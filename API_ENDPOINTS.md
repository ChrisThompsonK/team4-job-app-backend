# API Endpoints - Job Application Backend

## Application Management Endpoints

### 1. Submit Application
**POST** `/api/applications`

**Request Body:**
```json
{
  "jobRoleId": 1,
  "cvText": "My CV content here..."
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "id": 1,
    "jobRoleId": 1,
    "cvText": "My CV content here...",
    "status": "in progress",
    "createdAt": "2025-10-09T12:00:00.000Z"
  }
}
```

---

### 2. Get Application by ID
**GET** `/api/applications/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "jobRoleId": 1,
    "cvText": "My CV content here...",
    "status": "in progress",
    "createdAt": "2025-10-09T12:00:00.000Z"
  }
}
```

---

### 3. Get Applications by Job Role
**GET** `/api/applications/job/:jobRoleId`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "jobRoleId": 1,
      "cvText": "My CV content here...",
      "status": "in progress",
      "createdAt": "2025-10-09T12:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 4. Hire an Applicant ⭐ NEW
**PUT** `/api/applications/:id/hire`

**Response (200):**
```json
{
  "success": true,
  "message": "Application hired successfully",
  "data": {
    "application": {
      "id": 1,
      "jobRoleId": 1,
      "cvText": "My CV content here...",
      "status": "hired",
      "createdAt": "2025-10-09T12:00:00.000Z"
    },
    "jobRole": {
      "id": 1,
      "name": "Software Engineer",
      "numberOfOpenPositions": 4
    }
  }
}
```

**Error Responses:**
- **404** - Application not found
- **400** - Cannot hire (already hired/rejected or no open positions)
- **500** - Server error

---

### 5. Reject an Applicant ⭐ NEW
**PUT** `/api/applications/:id/reject`

**Response (200):**
```json
{
  "success": true,
  "message": "Application rejected",
  "data": {
    "id": 1,
    "jobRoleId": 1,
    "cvText": "My CV content here...",
    "status": "rejected",
    "createdAt": "2025-10-09T12:00:00.000Z"
  }
}
```

**Error Responses:**
- **404** - Application not found
- **400** - Cannot reject (already hired/rejected)
- **500** - Server error

---

## Job Role Endpoints

### 1. Get All Jobs
**GET** `/api/jobs`

### 2. Get Job by ID
**GET** `/api/jobs/:id`

### 3. Get Jobs by Status
**GET** `/api/jobs/status/:status`

Where `:status` is either `open` or `closed`

### 4. Create Job Role
**POST** `/api/jobs`

---

## Business Rules

### Application Status Workflow
1. **New Application:** `in progress`
2. **Hire:** `in progress` → `hired` (decrements open positions)
3. **Reject:** `in progress` → `rejected`

### Constraints
- ✅ Can only hire/reject applications with status `"in progress"`
- ✅ Cannot hire if `numberOfOpenPositions <= 0`
- ✅ Cannot change status of already hired/rejected applications
- ✅ Hiring decrements `numberOfOpenPositions` by 1
- ✅ All status updates are transactional (atomic)

---

## Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message here"
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors, business rule violations)
- `404` - Not Found
- `500` - Internal Server Error
