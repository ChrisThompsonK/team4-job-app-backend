import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import type { ApplicationStatus, NewApplication } from "../db/schema.js";
import { applications, jobRoles, users } from "../db/schema.js";

export class ApplicationRepository {
  async create(application: NewApplication) {
    const result = await db.insert(applications).values(application).returning();
    return result[0] || null;
  }

  async findById(id: number) {
    const result = await db
      .select({
        application: applications,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(applications)
      .innerJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.id, id))
      .limit(1);

    if (!result[0]) return null;

    return {
      ...result[0].application,
      applicantName: `${result[0].user.firstName} ${result[0].user.lastName}`,
      email: result[0].user.email,
    };
  }

  async findByJobRoleId(jobRoleId: number) {
    const results = await db
      .select({
        application: applications,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(applications)
      .innerJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.jobRoleId, jobRoleId))
      .orderBy(desc(applications.createdAt));

    return results.map((r) => ({
      ...r.application,
      applicantName: `${r.user.firstName} ${r.user.lastName}`,
      email: r.user.email,
    }));
  }

  async findByUserId(userId: number) {
    const results = await db
      .select({
        application: applications,
        user: {
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
        },
      })
      .from(applications)
      .innerJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));

    return results.map((r) => ({
      ...r.application,
      applicantName: `${r.user.firstName} ${r.user.lastName}`,
      email: r.user.email,
    }));
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
