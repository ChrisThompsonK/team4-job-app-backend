import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import type { NewApplication } from "../db/schema.js";
import { applications } from "../db/schema.js";

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
      .orderBy(applications.createdAt);
  }
}
