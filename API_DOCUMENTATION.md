# API Documentation

This document provides comprehensive API documentation for all endpoints in the Job Application Backend.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: (To be configured)

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": any,
  "error": string (only present when success is false),
  "count": number (only for list endpoints)
}
```

## Endpoints

### Health Check

#### GET /
Get server status and available endpoints.

**Response:**
```json
{
  "message": "Job Application Backend API",
  "status": "healthy",
  "endpoints": {
    // List of all available endpoints
  }
}
```

---

## Authentication Endpoints

### POST /api/auth/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
}
```

### POST /api/auth/register
Register a new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 2,
      "email": "newuser@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "role": "user"
    }
  }
}
```

### GET /api/auth/me
Get current user information (requires authentication).

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user"
  }
}
```

### POST /api/auth/logout
Logout user (client-side token removal).

**Headers:**
```http
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## Job Roles Endpoints

### GET /api/jobs
Get all job roles.

**Query Parameters:**
- `status` (optional): Filter by status (`open`, `closed`)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Frontend Developer",
      "location": "London, UK",
      "capability": "Software Development",
      "band": "Mid Level",
      "closingDate": "2025-11-15T23:59:59.000Z",
      "summary": "We're looking for a skilled Frontend Developer...",
      "keyResponsibilities": "Develop responsive web applications...",
      "status": "open",
      "numberOfOpenPositions": 2
    }
  ],
  "count": 1
}
```

### GET /api/jobs/:id
Get a specific job role by ID.

**Parameters:**
- `id`: Job role ID (integer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Frontend Developer",
    "location": "London, UK",
    "capability": "Software Development",
    "band": "Mid Level",
    "closingDate": "2025-11-15T23:59:59.000Z",
    "summary": "We're looking for a skilled Frontend Developer...",
    "keyResponsibilities": "Develop responsive web applications...",
    "status": "open",
    "numberOfOpenPositions": 2
  }
}
```

### GET /api/jobs/status/:status
Get job roles filtered by status.

**Parameters:**
- `status`: Job status (`open` or `closed`)

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of job roles with the specified status
  ],
  "count": 5
}
```

### POST /api/jobs
Create a new job role (admin only).

**Request Body:**
```json
{
  "name": "Backend Developer",
  "location": "Manchester, UK",
  "capability": "Software Development",
  "band": "Senior Level",
  "closingDate": "2025-12-31",
  "summary": "We're seeking an experienced Backend Developer...",
  "keyResponsibilities": "Design and implement scalable APIs...",
  "numberOfOpenPositions": 1
}
```

### PUT /api/jobs/:id
Update an existing job role (admin only).

**Parameters:**
- `id`: Job role ID (integer)

**Request Body:** (same as POST, all fields optional)

### DELETE /api/jobs/:id
Delete a job role (admin only).

**Parameters:**
- `id`: Job role ID (integer)

**Query Parameters:**
- `force`: Set to `true` to force delete job roles with applications

---

## Applications Endpoints

### POST /api/applications
Submit a job application with CV file upload.

**Content-Type:** `multipart/form-data`

**Form Fields:**
- `userId`: User ID (string)
- `jobRoleId`: Job role ID (string)
- `cvFile`: CV file (File) - Max 10MB, supported types: .doc, .docx, .png

**Example using FormData:**
```javascript
const formData = new FormData();
formData.append('userId', '1');
formData.append('jobRoleId', '1');
formData.append('cvFile', fileInput.files[0]);

fetch('/api/applications', {
  method: 'POST',
  body: formData
});
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "jobRoleId": 1,
    "cvFileName": "john-doe-cv.docx",
    "cvFilePath": "uploads/cvs/2025/10/1729756800000-john-doe-cv.docx",
    "cvFileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "cvFileSize": 524288,
    "status": "pending",
    "createdAt": "2025-10-23T10:00:00.000Z",
    "updatedAt": "2025-10-23T10:00:00.000Z",
    "applicantName": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

### GET /api/applications/:id
Get application by ID.

**Parameters:**
- `id`: Application ID (integer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "jobRoleId": 1,
    "cvFileName": "john-doe-cv.docx",
    "cvFilePath": "uploads/cvs/2025/10/1729756800000-john-doe-cv.docx",
    "cvFileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "cvFileSize": 524288,
    "status": "pending",
    "createdAt": "2025-10-23T10:00:00.000Z",
    "updatedAt": "2025-10-23T10:00:00.000Z",
    "applicantName": "John Doe",
    "email": "john.doe@example.com"
  }
}
```

### GET /api/applications/job/:jobRoleId
Get all applications for a specific job role.

**Parameters:**
- `jobRoleId`: Job role ID (integer)

**Response:**
```json
{
  "success": true,
  "data": [
    // Array of applications for the job role
  ],
  "count": 3
}
```

### PUT /api/applications/:id/hire
Hire an applicant (admin only).

**Parameters:**
- `id`: Application ID (integer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "hired",
    "updatedAt": "2025-10-23T10:30:00.000Z"
  }
}
```

### PUT /api/applications/:id/reject
Reject an applicant (admin only).

**Parameters:**
- `id`: Application ID (integer)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "rejected",
    "updatedAt": "2025-10-23T10:30:00.000Z"
  }
}
```

### DELETE /api/applications/:id
Delete an application.

**Parameters:**
- `id`: Application ID (integer)

---

## File Serving Endpoints

### GET /api/files/cv/:applicationId
Serve CV file for viewing in browser.

**Parameters:**
- `applicationId`: Application ID (integer)

**Response:** File content with appropriate MIME type headers

### GET /api/files/cv/:applicationId/download
Download CV file with download headers.

**Parameters:**
- `applicationId`: Application ID (integer)

**Response:** File content with `Content-Disposition: attachment` header

### GET /api/files/cv/:applicationId/info
Get CV file metadata without downloading.

**Parameters:**
- `applicationId`: Application ID (integer)

**Response:**
```json
{
  "success": true,
  "data": {
    "applicationId": 1,
    "fileName": "john-doe-cv.docx",
    "filePath": "uploads/cvs/2025/10/1729756800000-john-doe-cv.docx",
    "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "fileSize": 524288,
    "fileSizeFormatted": "512.00 KB",
    "exists": true,
    "createdAt": "2025-10-23T10:00:00.000Z"
  }
}
```

---

## Admin Endpoints

> **⚠️ Security Note**: These endpoints are currently unprotected and should be secured with admin authentication in production.

### GET /api/admin/file-stats
Get file system statistics and health metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalApplications": 10,
    "totalFiles": 10,
    "missingFiles": 0,
    "totalSizeBytes": 5242880,
    "totalSizeFormatted": "5.00 MB",
    "averageFileSizeBytes": 524288,
    "averageFileSizeFormatted": "512.00 KB",
    "fileTypes": {
      "docx": 7,
      "doc": 2,
      "png": 1
    },
    "healthScore": 100
  }
}
```

### GET /api/admin/validate-all-files
Validate integrity of all files in the system.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalApplications": 10,
      "validFiles": 9,
      "invalidFiles": 1,
      "totalSizeBytes": 5242880,
      "totalSizeFormatted": "5.00 MB",
      "healthScore": 90
    },
    "details": [
      {
        "applicationId": 1,
        "fileName": "john-doe-cv.docx",
        "filePath": "uploads/cvs/2025/10/1729756800000-john-doe-cv.docx",
        "isValid": true
      },
      {
        "applicationId": 2,
        "fileName": "jane-smith-cv.doc",
        "filePath": "uploads/cvs/2025/10/1729756900000-jane-smith-cv.doc",
        "isValid": false,
        "issues": ["File missing"]
      }
    ]
  }
}
```

### GET /api/admin/verify-file/:applicationId
Verify integrity of a specific file.

**Parameters:**
- `applicationId`: Application ID (integer)

**Response:**
```json
{
  "success": true,
  "data": {
    "applicationId": 1,
    "fileName": "john-doe-cv.docx",
    "filePath": "uploads/cvs/2025/10/1729756800000-john-doe-cv.docx",
    "exists": true,
    "accessible": true,
    "isValid": true,
    "storedSize": 524288,
    "actualSize": 524288,
    "sizeMismatch": false,
    "storedMimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "actualMimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "mimeTypeMismatch": false,
    "issues": []
  }
}
```

### POST /api/admin/cleanup-files
Clean up old files in the system.

**Request Body:**
```json
{
  "daysOld": 30,
  "dryRun": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dry run completed - no files were actually deleted",
  "data": {
    "daysOld": 30,
    "referencedFiles": 10,
    "note": "Set dryRun: false to actually perform cleanup"
  }
}
```

### POST /api/admin/cleanup-orphaned-files
Clean up files that are not referenced in the database.

**Request Body:**
```json
{
  "dryRun": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Dry run completed - no files were actually deleted",
  "data": {
    "foundFiles": 12,
    "referencedFiles": 10,
    "orphanedFiles": 2,
    "cleanedFiles": 0,
    "orphanedFilePaths": [
      "uploads/cvs/2025/09/old-file-1.docx",
      "uploads/cvs/2025/09/old-file-2.png"
    ],
    "note": "Set dryRun: false to actually perform cleanup"
  }
}
```

---

## Error Responses

When an error occurs, the API returns an error response with the following format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

### Common HTTP Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `413 Payload Too Large` - File too large (>10MB)
- `415 Unsupported Media Type` - Invalid file type
- `500 Internal Server Error` - Server error

---

## File Upload Specifications

### Supported File Types

| Extension | MIME Type | Description |
|-----------|-----------|-------------|
| `.doc` | `application/msword` | Microsoft Word 97-2003 Document |
| `.docx` | `application/vnd.openxmlformats-officedocument.wordprocessingml.document` | Microsoft Word Document |
| `.png` | `image/png` | Portable Network Graphics |

### File Size Limits

- **Maximum file size**: 10MB (10,485,760 bytes)
- **Minimum file size**: 1 byte

### File Storage Structure

```
uploads/
└── cvs/
    └── {YEAR}/
        └── {MONTH}/
            └── {TIMESTAMP}-{SANITIZED_FILENAME}.{EXTENSION}
```

### File Naming Convention

Files are renamed upon upload using the following pattern:
- `{TIMESTAMP}` - Unix timestamp in milliseconds
- `{SANITIZED_FILENAME}` - Original filename with special characters removed
- `{EXTENSION}` - Original file extension

Example: `1729756800000-john-doe-cv.docx`

### Content Security

- Files are validated for MIME type and extension consistency
- File contents are not scanned or modified
- Files are stored outside the web root for security
- Access to files is controlled through API endpoints

---

## Rate Limiting

Currently, no rate limiting is implemented. In production environments, consider implementing:

- Request rate limiting per IP
- File upload size and frequency limits
- Admin endpoint access restrictions

---

## CORS Configuration

The API is configured to accept cross-origin requests from:
- `http://localhost:3000` (frontend development server)
- All origins (in development - restrict in production)

Allowed headers:
- `Origin`
- `X-Requested-With`
- `Content-Type`
- `Accept`
- `Authorization`

Allowed methods:
- `GET`
- `POST`
- `PUT`
- `DELETE`
- `OPTIONS`