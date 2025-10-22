import { desc, eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import type { ApplicationStatus, NewApplication } from "../db/schema.js";
import { applications, jobRoles, users } from "../db/schema.js";

export class ApplicationRepository {
  async create(application: NewApplication) {
    const result = await db.insert(applications).values(application).returning();
    return result[0] || null;
  }

  /**
   * Helper method to build the base query with user join and applicant details
   */
  private getApplicationWithUserQuery() {
    return db
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
      .innerJoin(users, eq(applications.userId, users.id));
  }

  /**
   * Helper method to map the query result to include computed applicant details
   */
  private mapApplicationWithUser(result: {
    application: typeof applications.$inferSelect;
    user: { id: number; email: string; firstName: string; lastName: string };
  }) {
    return {
      ...result.application,
      applicantName: `${result.user.firstName} ${result.user.lastName}`,
      email: result.user.email,
    };
  }

  async findById(id: number) {
    const result = await this.getApplicationWithUserQuery().where(eq(applications.id, id)).limit(1);

    if (!result[0]) return null;

    return this.mapApplicationWithUser(result[0]);
  }

  async findByJobRoleId(jobRoleId: number) {
    const results = await this.getApplicationWithUserQuery()
      .where(eq(applications.jobRoleId, jobRoleId))
      .orderBy(desc(applications.createdAt));

    return results.map((r) => this.mapApplicationWithUser(r));
  }

  async findByUserId(userId: number) {
    const results = await this.getApplicationWithUserQuery()
      .where(eq(applications.userId, userId))
      .orderBy(desc(applications.createdAt));

    return results.map((r) => this.mapApplicationWithUser(r));
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
