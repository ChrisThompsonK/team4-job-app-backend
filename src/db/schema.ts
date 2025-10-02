import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const jobRoles = sqliteTable("job_roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location").notNull(),
  capability: text("capability").notNull(),
  band: text("band").notNull(),
  closingDate: text("closing_date").notNull(), // stored as ISO string
  summary: text("summary").notNull(),
  keyResponsibilities: text("key_responsibilities").notNull(),
  status: text("status").notNull(), // "open" | "closed"
  numberOfOpenPositions: integer("number_of_open_positions").notNull(),
});

export type JobRole = typeof jobRoles.$inferSelect;
export type NewJobRole = typeof jobRoles.$inferInsert;
