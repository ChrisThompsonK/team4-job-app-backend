import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Type definitions for status fields
export type JobRoleStatus = "open" | "closed";
export type ApplicationStatus = "in progress" | "hired" | "rejected";
export type UserRole = "admin" | "user";

// Minimal Auth - Just what we need for login
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user").$type<UserRole>(),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  password: text("password").notNull(),
});

// Legacy users table (keeping for backward compatibility during migration)
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // hashed password
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull().default("user").$type<UserRole>(),
  createdAt: text("created_at").notNull(), // stored as ISO string
  updatedAt: text("updated_at").notNull(), // stored as ISO string
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type PublicUser = Omit<User, "password">;

// Better Auth User Types
export type BetterAuthUser = typeof user.$inferSelect;
export type NewBetterAuthUser = typeof user.$inferInsert;

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
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  jobRoleId: integer("job_role_id")
    .notNull()
    .references(() => jobRoles.id),
  cvText: text("cv_text").notNull(),
  status: text("status").notNull().default("in progress").$type<ApplicationStatus>(), // "in progress" | "hired" | "rejected"
  createdAt: text("created_at").notNull(), // stored as ISO string
});

export type Application = typeof applications.$inferSelect;
export type NewApplication = typeof applications.$inferInsert;
