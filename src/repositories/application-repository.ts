import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import type { ApplicationStatus, NewApplication } from "../db/schema.js";
import { applications, jobRoles } from "../db/schema.js";

export class ApplicationRepository {
  async create(application: NewApplication) {
    const result = await db.insert(applications).values(application).returning();
    return result[0] || null;
  }

  async findById(id: number) {
    const result = await db.select().from(applications).where(eq(applications.id, id)).limit(1);
    return result[0] || null;
  }

  async findByJobRoleId(jobRoleId: number) {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.jobRoleId, jobRoleId))
      .orderBy(desc(applications.createdAt));
  }

  async findByUserId(userId: number) {
    return await db
      .select()
      .from(applications)
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));
  }

  async updateStatus(id: number, status: ApplicationStatus) {
    const result = await db
      .update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    return result[0] || null;
  }

  async findByIdWithJobRole(id: number) {
    const result = await db
      .select({
        application: applications,
        jobRole: jobRoles,
      })
      .from(applications)
      .innerJoin(jobRoles, eq(applications.jobRoleId, jobRoles.id))
      .where(eq(applications.id, id))
      .limit(1);
    return result[0] || null;
  }

  async deleteByJobRoleId(jobRoleId: number) {
    const result = await db
      .delete(applications)
      .where(eq(applications.jobRoleId, jobRoleId))
      .returning();
    return result;
  }

  async countByJobRoleId(jobRoleId: number) {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.jobRoleId, jobRoleId));
    return result[0]?.count || 0;
  }
}
