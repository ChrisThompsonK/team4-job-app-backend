import { eq, like, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import type { JobRole, NewJobRole } from "../db/schema.js";
import { applications, jobRoles } from "../db/schema.js";

export class JobRoleRepository {
  /**
   * Helper method to apply search filter if search term is provided
   */
  private applySearchFilter(query: any, search?: string): any {
    if (search && search.trim()) {
      return query.where(like(jobRoles.name, `%${search}%`));
    }
    return query;
  }

  async findAll(limit?: number, offset?: number, search?: string) {
    let query = db.select().from(jobRoles);
    query = this.applySearchFilter(query, search);
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

  async count(search?: string) {
    let query = db.select({ count: sql<number>`count(*)` }).from(jobRoles);
    query = this.applySearchFilter(query, search);
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
