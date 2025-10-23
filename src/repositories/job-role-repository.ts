import { and, eq, like, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import type { JobRole, NewJobRole } from "../db/schema.js";
import { applications, jobRoles } from "../db/schema.js";

export class JobRoleRepository {
  /**
   * Helper method to build all WHERE conditions (search + filters)
   */
  private buildWhereConditions(
    search?: string,
    filters?: { location?: string; capability?: string; band?: string }
  ) {
    const conditions = [];

    // Add search condition
    if (search?.trim()) {
      conditions.push(like(jobRoles.name, `%${search}%`));
    }

    // Add filter conditions
    if (filters) {
      if (filters.location?.trim()) {
        conditions.push(eq(jobRoles.location, filters.location));
      }
      if (filters.capability?.trim()) {
        conditions.push(eq(jobRoles.capability, filters.capability));
      }
      if (filters.band?.trim()) {
        conditions.push(eq(jobRoles.band, filters.band));
      }
    }

    return conditions;
  }

  async findAll(
    limit?: number,
    offset?: number,
    search?: string,
    filters?: { location?: string; capability?: string; band?: string }
  ) {
    let query = db.select().from(jobRoles);

    const conditions = this.buildWhereConditions(search, filters);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    query = query.orderBy(jobRoles.id) as typeof query;

    if (limit !== undefined && offset !== undefined) {
      return await query.limit(limit).offset(offset);
    }

    if (limit !== undefined) {
      return await query.limit(limit);
    }

    if (offset !== undefined) {
      return await query.offset(offset);
    }

    return await query;
  }

  async findById(id: number) {
    const result = await db.select().from(jobRoles).where(eq(jobRoles.id, id)).limit(1);
    return result[0] || null;
  }

  async findByStatus(status: "open" | "closed") {
    return await db.select().from(jobRoles).where(eq(jobRoles.status, status)).orderBy(jobRoles.id);
  }

  async create(jobRole: NewJobRole) {
    const result = await db.insert(jobRoles).values(jobRole).returning();
    return result[0] || null;
  }

  async decrementOpenPositions(id: number) {
    const result = await db
      .update(jobRoles)
      .set({ numberOfOpenPositions: sql`${jobRoles.numberOfOpenPositions} - 1` })
      .where(eq(jobRoles.id, id))
      .returning();
    return result[0] || null;
  }

  async count(
    search?: string,
    filters?: { location?: string; capability?: string; band?: string }
  ) {
    let query = db.select({ count: sql<number>`count(*)` }).from(jobRoles);

    const conditions = this.buildWhereConditions(search, filters);
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const result = await query;
    return result[0]?.count || 0;
  }

  async update(id: number, updates: Partial<Omit<JobRole, "id">>) {
    const result = await db.update(jobRoles).set(updates).where(eq(jobRoles.id, id)).returning();
    return result[0] || null;
  }

  async delete(id: number) {
    const result = await db.delete(jobRoles).where(eq(jobRoles.id, id)).returning();
    return result[0] || null;
  }

  async deleteWithApplications(id: number) {
    return await db.transaction(async (tx) => {
      // First, get the job role to return it
      const jobRole = await tx.select().from(jobRoles).where(eq(jobRoles.id, id)).limit(1);

      if (!jobRole[0]) {
        return { job: null, deletedApplicationsCount: 0 };
      }

      // Count applications before deletion
      const applicationCountResult = await tx
        .select({ count: sql<number>`count(*)` })
        .from(applications)
        .where(eq(applications.jobRoleId, id));

      const applicationCount = applicationCountResult[0]?.count || 0;

      // Delete all applications for this job role first
      await tx.delete(applications).where(eq(applications.jobRoleId, id));

      // Then delete the job role
      await tx.delete(jobRoles).where(eq(jobRoles.id, id));

      return {
        job: jobRole[0],
        deletedApplicationsCount: applicationCount,
      };
    });
  }
}
