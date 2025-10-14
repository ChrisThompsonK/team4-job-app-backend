import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Type definitions for status fields
export type JobRoleStatus = "open" | "closed";
export type ApplicationStatus = "in progress" | "hired" | "rejected";

export const jobRoles = sqliteTable("job_roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location").notNull(),
  capability: text("capability").notNull(),
  band: text("band").notNull(),
  closingDate: text("closing_date").notNull(), // stored as ISO string
  summary: text("summary").notNull(),
  keyResponsibilities: text("key_responsibilities").notNull(),
  status: text("status").notNull().$type<JobRoleStatus>(), // "open" | "closed"
  numberOfOpenPositions: integer("number_of_open_positions").notNull(),
});

export type JobRole = typeof jobRoles.$inferSelect;
export type NewJobRole = typeof jobRoles.$inferInsert;

export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobRoleId: integer("job_role_id")
    .notNull()
    .references(() => jobRoles.id),
  cvText: text("cv_text").notNull(),
  status: text("status").notNull().default("in progress").$type<ApplicationStatus>(), // "in progress" | "hired" | "rejected"
  createdAt: text("created_at").notNull(), // stored as ISO string
});

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
