import { eq, sql } from "drizzle-orm";
import { db } from "../db/index.js";
import type { NewJobRole } from "../db/schema.js";
import { jobRoles } from "../db/schema.js";

export class JobRoleRepository {
  async findAll(limit?: number, offset?: number) {
    const query = db.select().from(jobRoles).orderBy(jobRoles.id);

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
}
