# Project Information - Backend API - LLM Context Guide

> **Important**: Read this document before processing any prompts to understand the backend API structure, architecture, and conventions.

## Project Overview

This is the **backend REST API** for a job application management system. It provides data services to the **team4-job-app-frontend** application.

**Project Type**: RESTful API Service
**Architecture**: Layered Architecture with Repository Pattern
**Database**: SQLite with Drizzle ORM

---

## Backend API Application

### Technology Stack
- **Runtime**: Node.js (v18+)
- **Language**: TypeScript with ES Modules
- **Framework**: Express.js (v5.1.0)
- **Database**: SQLite (better-sqlite3 v12.4.1)
- **ORM**: Drizzle ORM (v0.44.6)
- **Code Quality**: Biome v2.2.4 (linting + formatting)
- **Testing**: Vitest v3.2.4 + Supertest v7.1.4
- **Dev Tools**: tsx (hot reloading), drizzle-kit (migrations)

### Architecture Pattern
**Layered Architecture** with clear separation of concerns:
- **Controllers** (`src/controllers/`) - HTTP request/response handling
- **Services** (`src/services/`) - Business logic layer
- **Repositories** (`src/repositories/`) - Data access layer
- **Validators** (`src/validators/`) - Input validation
- **Routes** (`src/routes/`) - API endpoint definitions
- **DB** (`src/db/`) - Database schema, connection, and seeding

### Key Features
1. **RESTful API** - Standard HTTP methods and status codes
2. **Database Persistence** - SQLite with Drizzle ORM
3. **Type Safety** - Full TypeScript with strict mode
4. **Input Validation** - Comprehensive validation layer
5. **CORS Enabled** - Ready for frontend integration
6. **Hot Reloading** - Fast development with tsx
7. **Database Migrations** - Drizzle Kit migration system
8. **Seeding** - Sample data for development

### Directory Structure
```
src/
├── index.ts                    # Main Express app entry point
├── controllers/
│   ├── job-role-controller.ts       # Job role request handlers
│   └── application-controller.ts    # Application request handlers
├── services/
│   ├── job-role-service.ts          # Job role business logic
│   ├── job-role-service.test.ts     # Service unit tests
│   ├── application-service.ts       # Application business logic
│   └── application-service.test.ts  # Service unit tests
├── repositories/
│   ├── job-role-repository.ts       # Job role data access
│   └── application-repository.ts    # Application data access
├── validators/
│   ├── job-role-validator.ts        # Job role validation logic
│   ├── job-role-validator.test.ts   # Validator unit tests
│   ├── application-validator.ts     # Application validation logic
│   └── application-validator.test.ts # Validator unit tests
├── routes/
│   ├── jobs.ts                      # Job role API routes
│   └── applications.ts              # Application API routes
└── db/
    ├── index.ts                     # Database connection
    ├── schema.ts                    # Drizzle schema definitions
    └── seed.ts                      # Sample data seeding

data/
└── database.sqlite                  # SQLite database file

drizzle/
├── 0000_create_job_roles.sql        # Initial migration
├── 0001_*.sql                       # Subsequent migrations
└── meta/                            # Migration metadata
```

### Environment Configuration
```bash
PORT=3001                       # API server port
DATABASE_URL=./data/database.sqlite  # SQLite database path
```

### Available Scripts
- `npm run dev` - Development mode with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Run compiled production build
- `npm test` - Run Vitest unit tests (watch mode)
- `npm run test:run` - Run tests once
- `npm run lint:fix` - Auto-fix linting/formatting issues
- `npm run check` - Check code quality without fixing
- `npm run db:seed` - Populate database with sample data
- `npm run db:studio` - Open Drizzle Studio (database GUI)
- `npm run db:generate` - Generate migrations from schema
- `npm run db:push` - Push schema changes to database

### API Endpoints

#### Health Check
- `GET /` - Server status and endpoint list

#### Job Roles
- `GET /api/jobs` - List all job roles
- `GET /api/jobs/:id` - Get job role by ID
- `POST /api/jobs` - Create new job role
- `GET /api/jobs/status/:status` - Get jobs by status (open/closed)

#### Applications
- `GET /api/applications` - List all applications
- `GET /api/applications/:id` - Get application by ID
- `POST /api/applications` - Submit new application
- `GET /api/applications/job/:jobRoleId` - Get applications for specific job

---

## Database Architecture

### Drizzle ORM Pattern

Drizzle ORM is a TypeScript-first ORM with zero runtime overhead.

#### Schema Definition (`src/db/schema.ts`)
```typescript
export const jobRoles = sqliteTable("job_roles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  location: text("location").notNull(),
  capability: text("capability").notNull(),
  band: text("band").notNull(),
  closingDate: text("closing_date").notNull(), // ISO string
  summary: text("summary").notNull(),
  keyResponsibilities: text("key_responsibilities").notNull(),
  status: text("status").notNull(), // "open" | "closed"
  numberOfOpenPositions: integer("number_of_open_positions").notNull(),
});

export type JobRole = typeof jobRoles.$inferSelect;
export type NewJobRole = typeof jobRoles.$inferInsert;
```

#### Database Connection (`src/db/index.ts`)
```typescript
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new Database("./data/database.sqlite");
export const db = drizzle(sqlite);
```

### Important Database Details

1. **SQLite**: File-based database (`data/database.sqlite`)
2. **Type Inference**: `$inferSelect` and `$inferInsert` for type safety
3. **Date Handling**: Dates stored as ISO strings, parsed to Date objects in services
4. **Migrations**: Generated with `drizzle-kit generate`, applied with `drizzle-kit push`
5. **Seeding**: Run `npm run db:seed` to populate initial data (REQUIRED for first use)

---

## Layered Architecture Pattern

### 1. Routes Layer (`src/routes/`)

Define API endpoints and delegate to controllers.

```typescript
// src/routes/jobs.ts
import express from "express";
import { jobRoleController } from "../controllers/job-role-controller.js";

const router = express.Router();

router.get("/", jobRoleController.getAllJobRoles);
router.get("/:id", jobRoleController.getJobRoleById);
router.post("/", jobRoleController.createJobRole);

export default router;
```

### 2. Controllers Layer (`src/controllers/`)

Handle HTTP requests/responses, call services, return responses.

```typescript
// src/controllers/job-role-controller.ts
export const jobRoleController = {
  getAllJobRoles: async (req: Request, res: Response) => {
    try {
      const jobRoles = await jobRoleService.getAllJobRoles();
      res.json({ success: true, data: jobRoles, count: jobRoles.length });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  },
};
```

### 3. Services Layer (`src/services/`)

Business logic, data transformation, orchestrate repository calls.

```typescript
// src/services/job-role-service.ts
export const jobRoleService = {
  getAllJobRoles: async (): Promise<JobRole[]> => {
    const jobs = await jobRoleRepository.findAll();
    // Transform dates from ISO strings to Date objects
    return jobs.map(job => ({
      ...job,
      closingDate: new Date(job.closingDate),
    }));
  },
};
```

### 4. Repositories Layer (`src/repositories/`)

Direct database access, CRUD operations only.

```typescript
// src/repositories/job-role-repository.ts
export const jobRoleRepository = {
  findAll: async () => {
    return await db.select().from(jobRoles);
  },
  
  findById: async (id: number) => {
    const result = await db.select().from(jobRoles).where(eq(jobRoles.id, id));
    return result[0];
  },
};
```

### 5. Validators Layer (`src/validators/`)

Input validation before processing.

```typescript
// src/validators/job-role-validator.ts
export const jobRoleValidator = {
  validateCreateJobRole: (data: any): ValidationResult => {
    if (!data.name || typeof data.name !== "string") {
      return { valid: false, error: "Name is required and must be a string" };
    }
    // ... more validation
    return { valid: true };
  },
};
```

---

## Data Flow

### Complete Request Flow Example

```
1. HTTP Request
   ↓
2. Route Handler (src/routes/jobs.ts)
   ↓
3. Controller (src/controllers/job-role-controller.ts)
   → Validates input using Validator
   → Calls Service
   ↓
4. Service (src/services/job-role-service.ts)
   → Business logic
   → Calls Repository
   ↓
5. Repository (src/repositories/job-role-repository.ts)
   → Database query via Drizzle
   ↓
6. Database (SQLite)
   ↓
7. Response flows back up:
   Repository → Service → Controller → Client
```

### Example: GET /api/jobs/:id

```typescript
// Route
router.get("/:id", jobRoleController.getJobRoleById);

// Controller
async getJobRoleById(req, res) {
  const id = parseInt(req.params.id);
  const job = await jobRoleService.getJobRoleById(id);
  if (!job) {
    return res.status(404).json({ success: false, error: "Not found" });
  }
  res.json({ success: true, data: job });
}

// Service
async getJobRoleById(id: number) {
  const job = await jobRoleRepository.findById(id);
  if (!job) return null;
  return { ...job, closingDate: new Date(job.closingDate) };
}

// Repository
async findById(id: number) {
  const result = await db.select().from(jobRoles).where(eq(jobRoles.id, id));
  return result[0];
}
```

---

## Response Format Standard

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "data": { ... },      // Single object or array
  "count": 10          // Optional: for array responses
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### HTTP Status Codes
- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Common Development Patterns

### Adding a New Feature (Backend)

1. **Update Schema** (if needed) in `src/db/schema.ts`
2. **Generate Migration**: `npm run db:generate`
3. **Create Validator** in `src/validators/`
4. **Write Validator Tests** in `src/validators/*.test.ts`
5. **Create Repository** in `src/repositories/`
6. **Create Service** in `src/services/`
7. **Write Service Tests** in `src/services/*.test.ts`
8. **Create Controller** in `src/controllers/`
9. **Add Routes** in `src/routes/`
10. **Apply Schema**: `npm run db:push`
11. **Run Tests**: `npm test`
12. **Run Linter**: `npm run lint:fix`

### Testing Pattern

```typescript
// src/services/job-role-service.test.ts
import { describe, it, expect } from "vitest";
import { jobRoleService } from "./job-role-service.js";

describe("JobRoleService", () => {
  it("should get all job roles", async () => {
    const jobs = await jobRoleService.getAllJobRoles();
    expect(jobs).toBeInstanceOf(Array);
  });
});
```

---

## Important Conventions

### Naming
- **Files**: kebab-case (`job-role-controller.ts`)
- **Classes/Interfaces**: PascalCase (`JobRole`)
- **Functions/Variables**: camelCase (`getAllJobRoles`)
- **Constants**: UPPER_SNAKE_CASE (`DATABASE_URL`)
- **Database Tables**: snake_case (`job_roles`)

### Import Paths
- **MUST** use `.js` extension for local imports even though files are `.ts`
- Example: `import { jobRoleService } from "./services/job-role-service.js";`
- This is required for ES Modules in TypeScript

### Async/Await
- All database operations are async
- Use `async/await`, not `.then()` chains
- Always handle errors with try/catch

### Type Safety
- NO `any` types unless absolutely necessary
- Use Drizzle's type inference (`$inferSelect`, `$inferInsert`)
- Define interfaces for DTOs and responses

---

## Testing Philosophy

- **Unit Tests**: For validators and services
- **Integration Tests**: For API endpoints (with Supertest)
- **Test Framework**: Vitest (Jest-compatible)
- **Coverage**: Aim for >80% coverage
- **Run Tests**: `npm test` (watch) or `npm run test:run` (once)

### Test File Locations
- Validators: `src/validators/*.test.ts`
- Services: `src/services/*.test.ts`
- API: `src/api.test.ts`

---

## Database Management

### First-Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Generate migrations (if schema changed)
npm run db:generate

# 3. Apply schema to database
npm run db:push

# 4. Seed database with sample data (REQUIRED)
npm run db:seed
```

### Working with Database
```bash
# View database in GUI
npm run db:studio
# Opens at http://localhost:4983

# Generate new migration after schema change
npm run db:generate

# Apply schema changes
npm run db:push

# Re-seed database (clears existing data)
npm run db:seed
```

---

## CORS Configuration

CORS is wide open for development:

```typescript
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});
```

**⚠️ Production**: Configure CORS to only allow frontend origin.

---

## Common Pitfalls to Avoid

1. **Forgetting to Seed**: Run `npm run db:seed` before first use
2. **Wrong Import Extensions**: Use `.js` not `.ts` in imports
3. **Date Serialization**: Database stores ISO strings, convert to Date in services
4. **Skipping Validation**: Always validate input in validators before processing
5. **Not Running Tests**: Run `npm test` after changes
6. **Direct DB Access in Controllers**: Always go through services/repositories
7. **Forgetting Migrations**: Run `npm run db:generate` after schema changes

---

## Integration with Frontend

### Frontend Connection
- **Frontend URL**: `http://localhost:3000`
- **Backend URL**: `http://localhost:3001` (or configured)
- **Frontend expects**: `http://localhost:8080` (check frontend `.env`)
- **Data Format**: JSON with `{ success, data, count }` structure

### Data Transformation
- Backend sends dates as ISO strings in JSON
- Frontend parses to Date objects
- Frontend displays in `dd/MM/yyyy` format

---

## Quick Reference Commands

### Development
```bash
npm run dev           # Start development server
npm run build         # Build for production  
npm test              # Run tests (watch mode)
npm run test:run      # Run tests once
npm run lint:fix      # Fix code quality issues
```

### Database
```bash
npm run db:seed       # Populate database
npm run db:studio     # View database in browser
npm run db:generate   # Generate migrations
npm run db:push       # Apply schema changes
```

---

## Resources

- Backend README: `README.md`
- Frontend README: `../team4-job-app-frontend/README.md`
- Drizzle ORM Docs: https://orm.drizzle.team/
- Express.js Docs: https://expressjs.com/
- Biome Docs: https://biomejs.dev/

---

**Last Updated**: October 9, 2025
**Critical**: Always use latest stable versions of all dependencies
