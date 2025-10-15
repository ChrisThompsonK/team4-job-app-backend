# Drizzle ORM Instructions

> **Version Requirements**: Always use the latest stable version of Drizzle ORM (currently v0.44.6+) and drizzle-kit (v0.31.5+)

## Overview

**Drizzle ORM** is a TypeScript-first ORM with zero runtime overhead. It provides type-safe database operations with excellent TypeScript inference and a SQL-like query builder.

---

## Why Drizzle ORM?

### Advantages
- ⚡ **Zero Runtime Overhead** - No decorators, no reflection
- 🎯 **Type-Safe** - Full TypeScript inference from schema
- 📝 **SQL-Like** - Familiar SQL syntax in TypeScript
- 🚀 **Fast** - Minimal abstraction layer
- 🔧 **Migration System** - Built-in migration generator
- 🎨 **Drizzle Studio** - Visual database browser
- 📦 **Lightweight** - Small bundle size
- 🔄 **Multiple Databases** - PostgreSQL, MySQL, SQLite support

---

## Installation

Drizzle ORM is already installed in this project:

```bash
npm install drizzle-orm@latest better-sqlite3@latest
npm install -D drizzle-kit@latest @types/better-sqlite3@latest
```

### Dependencies
- `drizzle-orm` - ORM library
- `better-sqlite3` - SQLite driver for Node.js
- `drizzle-kit` - CLI tool for migrations
- `@types/better-sqlite3` - TypeScript types

---

## Configuration

### drizzle.config.ts

```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",           // Schema definition file
  out: "./drizzle",                        // Migration output directory
  dialect: "sqlite",                       // Database type
  dbCredentials: {
    url: process.env.DATABASE_URL || "./data/database.sqlite",
  },
  verbose: true,                           // Log SQL queries
  strict: true,                            // Strict mode (recommended)
});
```

### Configuration Options
- **schema**: Path to schema definition file(s)
- **out**: Directory for generated migrations
- **dialect**: Database type (`sqlite`, `postgresql`, `mysql`)
- **dbCredentials**: Connection settings
- **verbose**: Show SQL in console
- **strict**: Enable strict mode (recommended for development)

---

## Database Setup

### 1. Database Connection (`src/db/index.ts`)

```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

// Create SQLite database connection
const sqlite = new Database(process.env.DATABASE_URL || "./data/database.sqlite");

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });
```

### 2. Schema Definition (`src/db/schema.ts`)

```typescript
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

// Define table
export const jobRoles = sqliteTable("job_roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location").notNull(),
  capability: text("capability").notNull(),
  band: text("band").notNull(),
  closingDate: text("closing_date").notNull(),
  summary: text("summary").notNull(),
  keyResponsibilities: text("key_responsibilities").notNull(),
  status: text("status").notNull(),
  numberOfOpenPositions: integer("number_of_open_positions").notNull(),
});

// Infer types from schema
export type JobRole = typeof jobRoles.$inferSelect;
export type NewJobRole = typeof jobRoles.$inferInsert;
```

---

## Schema Definition

### Column Types (SQLite)

```typescript
import { integer, text, real, blob, sqliteTable } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  // Integer columns
  id: integer("id").primaryKey({ autoIncrement: true }),
  age: integer("age").notNull(),
  score: integer("score").default(0),
  
  // Text columns
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  
  // Real (floating point)
  price: real("price").notNull(),
  
  // Blob (binary data)
  avatar: blob("avatar"),
});
```

### Column Modifiers

```typescript
// Primary Key
id: integer("id").primaryKey({ autoIncrement: true })

// Not Null
name: text("name").notNull()

// Default Value
status: text("status").default("active")
createdAt: integer("created_at").default(sql`(unixepoch())`)

// Unique
email: text("email").unique()

// References (Foreign Key)
userId: integer("user_id").references(() => users.id)

// Combined
email: text("email").notNull().unique()
```

### Relationships

```typescript
export const applications = sqliteTable("applications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  jobRoleId: integer("job_role_id")
    .notNull()
    .references(() => jobRoles.id),    // Foreign key
  cvText: text("cv_text").notNull(),
  status: text("status").notNull().default("in progress"),
  createdAt: text("created_at").notNull(),
});
```

### Type Inference

```typescript
// Infer SELECT type (what you get from database)
export type JobRole = typeof jobRoles.$inferSelect;

// Infer INSERT type (what you send to database)
export type NewJobRole = typeof jobRoles.$inferInsert;

// Usage
const job: JobRole = await db.select().from(jobRoles).limit(1);
const newJob: NewJobRole = {
  name: "Developer",
  location: "Belfast",
  // ... other required fields
};
```

---

## Query Operations

### 1. SELECT Queries

```typescript
import { db } from "./db/index.js";
import { jobRoles } from "./db/schema.js";
import { eq, gt, lt, and, or, like, desc, asc } from "drizzle-orm";

// Select all
const allJobs = await db.select().from(jobRoles);

// Select specific columns
const names = await db.select({
  id: jobRoles.id,
  name: jobRoles.name,
}).from(jobRoles);

// Where clause
const openJobs = await db
  .select()
  .from(jobRoles)
  .where(eq(jobRoles.status, "open"));

// Multiple conditions
const filteredJobs = await db
  .select()
  .from(jobRoles)
  .where(
    and(
      eq(jobRoles.status, "open"),
      gt(jobRoles.numberOfOpenPositions, 0)
    )
  );

// OR conditions
const urgentJobs = await db
  .select()
  .from(jobRoles)
  .where(
    or(
      eq(jobRoles.status, "urgent"),
      lt(jobRoles.closingDate, "2025-12-01")
    )
  );

// LIKE (pattern matching)
const devJobs = await db
  .select()
  .from(jobRoles)
  .where(like(jobRoles.name, "%Developer%"));

// Order by
const sortedJobs = await db
  .select()
  .from(jobRoles)
  .orderBy(desc(jobRoles.closingDate));

// Limit and offset
const paginatedJobs = await db
  .select()
  .from(jobRoles)
  .limit(10)
  .offset(0);

// Get single result
const job = await db
  .select()
  .from(jobRoles)
  .where(eq(jobRoles.id, 1))
  .limit(1);

const singleJob = job[0]; // First result or undefined
```

### 2. INSERT Queries

```typescript
import { jobRoles } from "./db/schema.js";

// Insert single record
const newJob = await db.insert(jobRoles).values({
  name: "Senior Developer",
  location: "Belfast, UK",
  capability: "Software Development",
  band: "Senior",
  closingDate: "2025-12-31",
  summary: "Exciting role...",
  keyResponsibilities: "Lead development...",
  status: "open",
  numberOfOpenPositions: 2,
});

// Insert multiple records
const newJobs = await db.insert(jobRoles).values([
  { name: "Job 1", location: "Location 1", /* ... */ },
  { name: "Job 2", location: "Location 2", /* ... */ },
]);

// Insert and return
const inserted = await db
  .insert(jobRoles)
  .values({ /* ... */ })
  .returning();

console.log(inserted[0]); // Inserted record with generated ID
```

### 3. UPDATE Queries

```typescript
// Update with where clause
const updated = await db
  .update(jobRoles)
  .set({ status: "closed" })
  .where(eq(jobRoles.id, 1));

// Update multiple fields
await db
  .update(jobRoles)
  .set({
    status: "closed",
    numberOfOpenPositions: 0,
  })
  .where(eq(jobRoles.id, 1));

// Update with returning
const updatedJobs = await db
  .update(jobRoles)
  .set({ status: "closed" })
  .where(eq(jobRoles.status, "expired"))
  .returning();
```

### 4. DELETE Queries

```typescript
// Delete with where clause
await db
  .delete(jobRoles)
  .where(eq(jobRoles.id, 1));

// Delete multiple
await db
  .delete(jobRoles)
  .where(eq(jobRoles.status, "expired"));

// Delete all (use with caution!)
await db.delete(jobRoles);

// Delete and return
const deleted = await db
  .delete(jobRoles)
  .where(eq(jobRoles.id, 1))
  .returning();
```

### 5. Joins

```typescript
import { applications, jobRoles } from "./db/schema.js";
import { eq } from "drizzle-orm";

// Inner join
const results = await db
  .select({
    applicationId: applications.id,
    jobName: jobRoles.name,
    cvText: applications.cvText,
  })
  .from(applications)
  .innerJoin(jobRoles, eq(applications.jobRoleId, jobRoles.id));

// Left join
const allApplications = await db
  .select()
  .from(applications)
  .leftJoin(jobRoles, eq(applications.jobRoleId, jobRoles.id));

// Access joined data
allApplications.forEach(row => {
  console.log(row.applications); // Application data
  console.log(row.job_roles);    // Job role data (may be null)
});
```

---

## Migrations

### Workflow

1. **Modify Schema** (`src/db/schema.ts`)
2. **Generate Migration** (`npm run db:generate`)
3. **Review Migration** (check `drizzle/` directory)
4. **Apply Migration** (`npm run db:push`)

### Generate Migration

```bash
# After changing schema.ts
npm run db:generate

# Drizzle creates:
# drizzle/0001_migration_name.sql
# drizzle/meta/0001_snapshot.json
```

Example generated migration:
```sql
-- drizzle/0001_add_applications_table.sql
CREATE TABLE `applications` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `job_role_id` integer NOT NULL,
  `cv_text` text NOT NULL,
  `status` text DEFAULT 'in progress' NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`job_role_id`) REFERENCES `job_roles`(`id`)
);
```

### Apply Migration

```bash
# Push schema changes to database
npm run db:push

# OR use migrate for production
npm run db:migrate
```

### Migration Commands

```bash
# Generate migration from schema changes
npm run db:generate

# Push schema to database (development)
npm run db:push

# Run pending migrations (production)
npm run db:migrate

# Open Drizzle Studio (visual database browser)
npm run db:studio
```

---

## Drizzle Studio

**Drizzle Studio** is a visual database browser.

```bash
# Open Drizzle Studio
npm run db:studio

# Opens at http://localhost:4983
```

### Features
- 📊 Browse tables and data
- ✏️ Edit records directly
- 🔍 Filter and search
- 📈 View relationships
- 🎨 Beautiful UI

---

## Seeding Database

### Seed File (`src/db/seed.ts`)

```typescript
import { db } from "./index.js";
import { jobRoles } from "./schema.js";

async function seed() {
  console.log("🌱 Seeding database...");
  
  // Clear existing data
  await db.delete(jobRoles);
  
  // Insert sample data
  await db.insert(jobRoles).values([
    {
      name: "Frontend Developer",
      location: "Belfast, UK",
      capability: "Engineering",
      band: "Mid Level",
      closingDate: new Date("2025-12-31").toISOString(),
      summary: "Build amazing web apps",
      keyResponsibilities: "Develop React applications",
      status: "open",
      numberOfOpenPositions: 2,
    },
    {
      name: "Backend Developer",
      location: "London, UK",
      capability: "Engineering",
      band: "Senior",
      closingDate: new Date("2025-11-30").toISOString(),
      summary: "Build scalable APIs",
      keyResponsibilities: "Design REST APIs",
      status: "open",
      numberOfOpenPositions: 1,
    },
  ]);
  
  console.log("✅ Database seeded successfully!");
}

seed()
  .catch(console.error)
  .finally(() => process.exit());
```

### Run Seeding

```bash
npm run db:seed
```

---

## Best Practices

### 1. Type Safety

```typescript
// ✅ GOOD - Use inferred types
export type JobRole = typeof jobRoles.$inferSelect;
const job: JobRole = await db.select().from(jobRoles).limit(1);

// ❌ BAD - Manual types can get out of sync
interface JobRole {
  id: number;
  name: string;
  // ...
}
```

### 2. Query Builder

```typescript
// ✅ GOOD - Type-safe query builder
const openJobs = await db
  .select()
  .from(jobRoles)
  .where(eq(jobRoles.status, "open"));

// ❌ BAD - Raw SQL (loses type safety)
const openJobs = await db.execute(sql`SELECT * FROM job_roles WHERE status = 'open'`);
```

### 3. Separate Repository Layer

```typescript
// ✅ GOOD - Repository pattern
export const jobRoleRepository = {
  findAll: async () => db.select().from(jobRoles),
  findById: async (id: number) => {
    const result = await db.select().from(jobRoles).where(eq(jobRoles.id, id));
    return result[0];
  },
};

// ❌ BAD - Database queries scattered in controllers
app.get("/jobs", async (req, res) => {
  const jobs = await db.select().from(jobRoles); // Don't do this
  res.json(jobs);
});
```

### 4. Handle Null Results

```typescript
// ✅ GOOD - Check for null
const job = await jobRoleRepository.findById(id);
if (!job) {
  return res.status(404).json({ error: "Not found" });
}

// ❌ BAD - Assume result exists
const job = await jobRoleRepository.findById(id);
res.json(job.name); // Could crash if null
```

### 5. Use Prepared Statements (Performance)

```typescript
// For frequently used queries
const getJobById = db
  .select()
  .from(jobRoles)
  .where(eq(jobRoles.id, sql.placeholder("id")))
  .prepare();

// Use with different IDs
const job1 = await getJobById.execute({ id: 1 });
const job2 = await getJobById.execute({ id: 2 });
```

---

## Common Patterns

### 1. Find or Create

```typescript
async function findOrCreate(email: string) {
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  if (existing.length > 0) {
    return existing[0];
  }
  
  const created = await db
    .insert(users)
    .values({ email, name: "New User" })
    .returning();
  
  return created[0];
}
```

### 2. Pagination

```typescript
async function getJobsPaginated(page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  
  const jobs = await db
    .select()
    .from(jobRoles)
    .limit(pageSize)
    .offset(offset)
    .orderBy(desc(jobRoles.closingDate));
  
  return jobs;
}
```

### 3. Count Records

```typescript
import { count } from "drizzle-orm";

const result = await db
  .select({ count: count() })
  .from(jobRoles)
  .where(eq(jobRoles.status, "open"));

const totalOpenJobs = result[0].count;
```

### 4. Transactions

```typescript
import { db } from "./db/index.js";

await db.transaction(async (tx) => {
  // Create job
  const job = await tx.insert(jobRoles).values({
    name: "Developer",
    // ...
  }).returning();
  
  // Create related application
  await tx.insert(applications).values({
    jobRoleId: job[0].id,
    cvText: "CV content",
    // ...
  });
  
  // Both operations succeed or both fail
});
```

---

## Troubleshooting

### Issue: "Table not found"

```bash
# Solution: Apply schema to database
npm run db:push
```

### Issue: "Cannot find module"

```bash
# Solution: Check import extensions (use .js not .ts)
import { db } from "./db/index.js"; // ✅ Correct
import { db } from "./db/index.ts"; // ❌ Wrong
```

### Issue: "Type errors after schema change"

```bash
# Solution: Regenerate types
npm run db:generate
npm run db:push
```

### Issue: "Empty results"

```bash
# Solution: Seed database
npm run db:seed
```

### Issue: "Migration conflicts"

```bash
# Solution: Delete migrations and regenerate
rm -rf drizzle/
npm run db:generate
npm run db:push
```

---

## Resources

- **Official Docs**: https://orm.drizzle.team/
- **Drizzle Studio**: https://orm.drizzle.team/drizzle-studio/overview
- **SQLite Docs**: https://orm.drizzle.team/docs/get-started-sqlite
- **Query Examples**: https://orm.drizzle.team/docs/select
- **GitHub**: https://github.com/drizzle-team/drizzle-orm

---

## Quick Reference

| Operation | Code |
|-----------|------|
| Select All | `db.select().from(table)` |
| Where | `db.select().from(table).where(eq(table.col, value))` |
| Insert | `db.insert(table).values({ ... })` |
| Update | `db.update(table).set({ ... }).where(...)` |
| Delete | `db.delete(table).where(...)` |
| Join | `db.select().from(table1).innerJoin(table2, eq(...))` |
| Order | `db.select().from(table).orderBy(desc(table.col))` |
| Limit | `db.select().from(table).limit(10)` |

### Common Operators

```typescript
import { eq, ne, gt, gte, lt, lte, like, and, or, not } from "drizzle-orm";

eq(column, value)         // column = value
ne(column, value)         // column != value
gt(column, value)         // column > value
gte(column, value)        // column >= value
lt(column, value)         // column < value
lte(column, value)        // column <= value
like(column, "%pattern%") // column LIKE pattern
and(condition1, condition2) // condition1 AND condition2
or(condition1, condition2)  // condition1 OR condition2
not(condition)            // NOT condition
```

---

**Last Updated**: October 9, 2025
**Drizzle ORM Version**: 0.44.6+ (always use latest stable)
**Drizzle Kit Version**: 0.31.5+ (always use latest stable)
