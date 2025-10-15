# Test Scripts

This directory contains integration test scripts for manually testing the API endpoints.

## Available Tests

### `test-application.js`
Tests the job application API endpoints including authentication, job retrieval, application submission, and validation.

**Run with:**
```bash
node tests/test-application.js
```

**Prerequisites:**
- Backend server must be running (`npm run dev`)
- Database must be seeded (`npm run db:seed`)

### `test-create-job.js`
Tests the job creation API endpoint.

**Run with:**
```bash
node tests/test-create-job.js
```

**Prerequisites:**
- Backend server must be running (`npm run dev`)

## Running All Tests

1. Start the backend server:
```bash
npm run dev
```

2. In another terminal, run the tests:
```bash
# Test job applications
node tests/test-application.js

# Test job creation
node tests/test-create-job.js
```

## Notes

These are integration tests that make actual HTTP requests to the running server. They are separate from the unit tests run by `npm test` (Vitest).

For automated testing in CI/CD, use `npm test` instead.