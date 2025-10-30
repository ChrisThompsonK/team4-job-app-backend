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

