# Backend Testing Plan

## Overview
This testing plan covers unit and integration tests for the Team 4 Job Application Backend API. The plan includes 10 test cases covering authentication, job roles, and applications functionality.

## Testing Framework
- **Framework**: Vitest
- **Coverage Tool**: @vitest/coverage-v8
- **API Testing**: Supertest
- **Database**: SQLite (test database)

## Test Cases

### 1. User Registration
**Description**: Test user registration with valid credentials  
**Type**: Integration Test  
**Endpoint**: `POST /api/auth/register`  
**Expected Behavior**:
- Accept valid user data (email, password, firstName, lastName)
- Hash password before storage
- Return success response with user data (excluding password)
- Ensure email uniqueness

**Test Data**:
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

### 2. User Login
**Description**: Test user authentication with valid credentials  
**Type**: Integration Test  
**Endpoint**: `POST /api/auth/login`  
**Expected Behavior**:
- Accept email and password
- Validate credentials against database
- Return JWT token on success
- Return 401 for invalid credentials

**Test Data**:
```json
{
  "email": "test@example.com",
  "password": "SecurePass123!"
}
```

---

### 3. Create Job Role (Admin Only)
**Description**: Test creation of new job role by admin user  
**Type**: Integration Test  
**Endpoint**: `POST /api/jobs`  
**Expected Behavior**:
- Require admin authentication
- Accept valid job role data
- Return created job with auto-generated ID
- Default status should be "open"

**Test Data**:
```json
{
  "name": "Software Engineer",
  "location": "London",
  "capability": "Engineering",
  "band": "Mid Level",
  "closingDate": "2025-12-31",
  "summary": "We are looking for a talented software engineer",
  "keyResponsibilities": "Develop features, write tests, code reviews",
  "numberOfOpenPositions": 3
}
```

---

### 4. Get All Job Roles
**Description**: Test retrieval of all job roles  
**Type**: Integration Test  
**Endpoint**: `GET /api/jobs`  
**Expected Behavior**:
- Return array of all job roles
- No authentication required
- Include all job role fields
- Support filtering by status (optional)

**Expected Response**:
```json
[
  {
    "id": 1,
    "name": "Software Engineer",
    "status": "open",
    ...
  }
]
```

---

### 5. Get Single Job Role
**Description**: Test retrieval of a specific job role by ID  
**Type**: Integration Test  
**Endpoint**: `GET /api/jobs/:id`  
**Expected Behavior**:
- Return job role details for valid ID
- Return 404 for non-existent ID
- Include all job role fields

---

### 6. Update Job Role
**Description**: Test updating an existing job role  
**Type**: Integration Test  
**Endpoint**: `PUT /api/jobs/:id`  
**Expected Behavior**:
- Require admin authentication
- Accept partial updates
- Validate status transitions (prevent closing with active applications)
- Return updated job role data
- Return 404 for non-existent job

**Test Data**:
```json
{
  "numberOfOpenPositions": 5,
  "status": "open"
}
```

---

### 7. Delete Job Role
**Description**: Test deletion of a job role  
**Type**: Integration Test  
**Endpoint**: `DELETE /api/jobs/:id`  
**Expected Behavior**:
- Require admin authentication
- Prevent deletion if active applications exist (unless force=true)
- Delete associated applications when force=true
- Return deletion confirmation with count of deleted applications
- Return 404 for non-existent job

**Query Parameters**: `?force=true` (optional)

---

### 8. Submit Job Application
**Description**: Test submitting an application with CV upload  
**Type**: Integration Test  
**Endpoint**: `POST /api/applications`  
**Expected Behavior**:
- Require user authentication
- Accept multipart/form-data with CV file
- Validate file type (PDF, DOC, DOCX)
- Validate file size (max 5MB)
- Store file metadata in database
- Default status should be "in progress"

**Test Data**:
```json
{
  "jobRoleId": 1,
  "cvFile": "<PDF file>"
}
```

---

### 9. Get User's Applications
**Description**: Test retrieval of all applications for authenticated user  
**Type**: Integration Test  
**Endpoint**: `GET /api/applications/my-applications`  
**Expected Behavior**:
- Require user authentication
- Return only applications belonging to authenticated user
- Include job role details
- Include application status

**Expected Response**:
```json
[
  {
    "id": 1,
    "userId": 1,
    "jobRoleId": 1,
    "status": "in progress",
    "createdAt": "2025-10-30T...",
    "jobRole": {...}
  }
]
```

---

### 10. Update Application Status (Admin Only)
**Description**: Test updating application status by admin  
**Type**: Integration Test  
**Endpoint**: `PUT /api/applications/:id`  
**Expected Behavior**:
- Require admin authentication
- Accept status updates ("in progress", "hired", "rejected")
- Prevent invalid status values
- Return updated application data
- Return 404 for non-existent application

**Test Data**:
```json
{
  "status": "hired"
}
```

---

## Implementation Steps

### Step 1: Setup Test Environment
```bash
# Install testing dependencies (already installed)
npm install --save-dev vitest @vitest/coverage-v8 supertest @types/supertest
```

### Step 2: Create Test Database Configuration
Create a separate test database configuration to avoid affecting development data:

```typescript
// src/db/test-config.ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

export function createTestDatabase() {
  const sqlite = new Database(":memory:"); // In-memory database for tests
  return drizzle(sqlite);
}
```

### Step 3: Create Test Utilities
```typescript
// src/tests/utils/test-helpers.ts
import { createTestDatabase } from "../../db/test-config";
import jwt from "jsonwebtoken";

export function setupTestDb() {
  // Create test database and run migrations
}

export function createTestUser(role: "admin" | "user" = "user") {
  // Create and return test user
}

export function generateAuthToken(userId: number, role: string) {
  // Generate JWT token for testing
}

export function cleanupTestDb() {
  // Clear test database
}
```

### Step 4: Create Integration Test Files
Create separate test files for each controller:

```
src/
  tests/
    integration/
      auth.test.ts
      job-roles.test.ts
      applications.test.ts
    utils/
      test-helpers.ts
      fixtures.ts
```

### Step 5: Implement Auth Tests
```typescript
// src/tests/integration/auth.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../../index";
import { setupTestDb, cleanupTestDb } from "../utils/test-helpers";

describe("Authentication API", () => {
  beforeEach(async () => {
    await setupTestDb();
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  it("should register a new user", async () => {
    // Test Case 1 implementation
  });

  it("should login with valid credentials", async () => {
    // Test Case 2 implementation
  });
});
```

### Step 6: Implement Job Role Tests
```typescript
// src/tests/integration/job-roles.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../../index";
import { setupTestDb, cleanupTestDb, createTestUser, generateAuthToken } from "../utils/test-helpers";

describe("Job Roles API", () => {
  beforeEach(async () => {
    await setupTestDb();
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  it("should create a job role (admin)", async () => {
    // Test Case 3 implementation
  });

  it("should get all job roles", async () => {
    // Test Case 4 implementation
  });

  it("should get single job role by ID", async () => {
    // Test Case 5 implementation
  });

  it("should update a job role (admin)", async () => {
    // Test Case 6 implementation
  });

  it("should delete a job role (admin)", async () => {
    // Test Case 7 implementation
  });
});
```

### Step 7: Implement Application Tests
```typescript
// src/tests/integration/applications.test.ts
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import { app } from "../../index";
import { setupTestDb, cleanupTestDb, createTestUser, generateAuthToken } from "../utils/test-helpers";
import path from "path";

describe("Applications API", () => {
  beforeEach(async () => {
    await setupTestDb();
  });

  afterEach(async () => {
    await cleanupTestDb();
  });

  it("should submit a job application with CV", async () => {
    // Test Case 8 implementation
  });

  it("should get user's applications", async () => {
    // Test Case 9 implementation
  });

  it("should update application status (admin)", async () => {
    // Test Case 10 implementation
  });
});
```

### Step 8: Configure Test Scripts
Update `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run",
    "test:coverage": "vitest run --coverage",
    "test:integration": "vitest run src/tests/integration",
    "test:watch": "vitest watch"
  }
}
```

### Step 9: Create Test Fixtures
```typescript
// src/tests/utils/fixtures.ts
export const mockUser = {
  email: "test@example.com",
  password: "SecurePass123!",
  firstName: "John",
  lastName: "Doe"
};

export const mockAdmin = {
  email: "admin@example.com",
  password: "AdminPass123!",
  firstName: "Admin",
  lastName: "User",
  role: "admin"
};

export const mockJobRole = {
  name: "Software Engineer",
  location: "London",
  capability: "Engineering",
  band: "Mid Level",
  closingDate: "2025-12-31",
  summary: "We are looking for a talented software engineer",
  keyResponsibilities: "Develop features, write tests, code reviews",
  numberOfOpenPositions: 3
};
```

### Step 10: Run Tests
```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run with coverage
npm run test:coverage

# Run integration tests only
npm run test:integration

# Watch mode for development
npm run test:watch
```

## Success Criteria
- All 10 test cases pass
- Test coverage > 70% for critical paths
- Tests run in CI/CD pipeline
- No false positives/negatives
- Tests run independently and can be run in any order

## Maintenance
- Update tests when API changes
- Add new tests for new features
- Review test coverage monthly
- Keep test data realistic and relevant
