[![Code Quality](https://github.com/ChrisThompsonK/team4-job-app-backend/actions/workflows/code-quality.yml/badge.svg)](https://github.com/ChrisThompsonK/team4-job-app-backend/actions/workflows/code-quality.yml)

[![Formatted with Biome](https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)

# Team 4 Job Application Project - Backend API

A modern Node.js backend API built with TypeScript, Express.js, and Drizzle ORM. This project provides RESTful API endpoints for managing job roles in the Team 4 Job Application system.

⚠️ **Important**: This backend API is required for the frontend application to function. The frontend (`team4-job-app-frontend`) consumes data from this API.

## 📖 Documentation

For comprehensive guides on working with this backend API, see the **[`.github/instructions/` directory](./.github/instructions/)**:

- **[Project Info](./.github/instructions/project-info.instructions.md)** - Complete architecture overview, layered pattern, database schema
- **[Drizzle ORM](./.github/instructions/drizzle-orm.instructions.md)** - Database operations, queries, migrations, seeding
- **[Linting](./.github/instructions/linting.instructions.md)** - Biome setup, code style, AI/Copilot workflow
- **[Dependencies](./.github/instructions/dependencies.instructions.md)** - npm package management, updates, security

**For LLMs/AI Assistants**: These instruction files provide detailed guidance for code modifications and best practices.

## Features

- **TypeScript** - Type-safe JavaScript development with strict type checking
- **Express.js** - Fast, unopinionated web framework for building REST APIs
- **Drizzle ORM** - Modern TypeScript-first ORM for database operations
- **SQLite Database** - Lightweight database with full CRUD operations for job roles and applications
- **Layered Architecture** - Clean separation: Controllers → Services → Repositories → Database
- **JWT Authentication** - Secure token-based authentication with Better Auth integration
- **Role-Based Access** - Admin and user role permissions for different operations
- **Input Validation** - Comprehensive request validation with custom validators
- **Error Handling** - Centralized error handling with proper HTTP status codes
- **Business Logic** - Advanced features like cascade deletion and status transition validation
- **ES Modules** - Modern JavaScript module system
- **Biome** - Fast linter and formatter for consistent code quality
- **Vitest Testing** - Comprehensive unit and integration tests
- **Hot Reloading** - Automatic server restart during development
- **Database Migrations** - Version-controlled schema changes with Drizzle
- **RESTful API** - Full CRUD operations for job roles and applications
- **CORS Ready** - Configured for cross-origin requests from frontend clients

## Prerequisites

- Node.js (v18 or higher)
- npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ChrisThompsonK/team4-job-app-backend.git
cd team4-job-app-backend
```

2. Install dependencies:
```bash
npm install
```

3. **Initial Setup - Seed the Database**:

⚠️ **Important**: Before running the application for the first time, you must seed the database with sample data:
```bash
npm run db:seed
```

This command populates the database with sample job roles. Without this step, the API will return empty results.

## Quick Start (Backend + Frontend Together)

To run both the backend API and frontend application:

### Terminal 1 - Backend API (This Project)
```bash
cd team4-job-app-backend
npm install              # First time only
npm run db:seed          # First time only - seed database
npm run dev              # Starts on http://localhost:3001
```

### Terminal 2 - Frontend Application
```bash
cd team4-job-app-frontend
npm install              # First time only
npm run dev              # Starts on http://localhost:3000
```

Then open http://localhost:3000 in your browser.

⚠️ **The frontend cannot function without this backend API running** - it will fail to load job data.

## Running the Application

### Development Mode
Start the application in development mode with hot reloading:
```bash
npm run dev
```

The server will start on `http://localhost:3001` and automatically restart when you make changes to the code.

### Testing the API
You can test the API endpoints using curl, Postman, or any HTTP client:
```bash
curl http://localhost:3001
# Response: {"message":"Job Application Backend API","status":"healthy"}

curl http://localhost:3001/api/jobs
# Response: {"success":true,"data":[...],"count":3}
```

### Production Mode
1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

Alternatively, you can build and start in one command:
```bash
npm run start:prod
```

## Code Quality & Formatting

This project uses **Biome** for maintaining code quality and consistent formatting.

See **[`.github/instructions/linting.instructions.md`](./.github/instructions/linting.instructions.md)** for detailed linting setup and best practices.

🚨 **CRITICAL**: If using GitHub Copilot or AI code generation tools, **always run `npm run lint:fix` immediately after** accepting AI-generated code.

### Available Commands

#### Linting & Formatting
```bash
npm run check         # Check for linting and formatting issues
npm run lint          # Same as check
npm run lint:fix      # Fix linting and formatting issues automatically
npm run format        # Format code only
npm run format:check  # Check formatting without applying changes
```

#### Database Operations
```bash
npm run db:generate      # Generate database migrations
npm run db:push          # Push schema changes to database
npm run db:studio        # Open Drizzle Studio (database browser)
npm run db:seed          # Seed database with sample data
```

#### Development & Testing
```bash
npm run dev           # Start development server with hot reloading
npm run build         # Compile TypeScript to JavaScript
npm start             # Run the compiled application
npm run start:prod    # Build and run in production mode
npm test              # Run unit tests (117 tests covering all layers)
npm run test:watch    # Run tests in watch mode for development
```

### Code Style Guidelines

- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Always required
- **Line Width**: 100 characters maximum
- **Trailing Commas**: ES5 style

## API Endpoints

This backend provides RESTful API endpoints consumed by the frontend application.

See **[`.github/instructions/project-info.instructions.md`](./.github/instructions/project-info.instructions.md)** for complete API documentation and architecture details.

### Health Check
- `GET /` - Returns server status and available endpoints

### Authentication

The API includes JWT-based authentication. After seeding the database, you can use these test credentials:

#### Test User Accounts
- **Admin**: `admin@example.com` / `password123`
- **Member**: `member@example.com` / `password123` 
- **User**: `john.doe@example.com` / `password123`

#### Authentication Endpoints
- `POST /api/auth/login` - Login with email/password, returns JWT token
- `POST /api/auth/register` - Register new user
- `GET /api/auth/me` - Get current user info (requires Bearer token)
- `POST /api/auth/logout` - Logout (client-side token removal)

#### Frontend Integration
Include the JWT token in requests:
```javascript
const token = localStorage.getItem('authToken');
fetch('/api/applications', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Job Roles API
- `GET /api/jobs` - Get all job roles (supports pagination with `?limit=10&offset=0`)
- `GET /api/jobs/:id` - Get specific job role by ID
- `GET /api/jobs/status/:status` - Get job roles by status (`open` or `closed`)
- `POST /api/jobs` - Create new job role (requires authentication)
- `PUT /api/jobs/:id` - Update existing job role (requires authentication)
- `DELETE /api/jobs/:id` - Delete job role (requires authentication, supports `?force=true`)

### Applications API
- `POST /api/applications` - Submit job application (requires authentication)
- `GET /api/applications/:id` - Get application by ID (requires authentication)
- `GET /api/applications/job/:jobId` - Get all applications for a job (requires authentication)
- `PUT /api/applications/:id/hire` - Hire applicant (requires admin role)
- `PUT /api/applications/:id/reject` - Reject applicant (requires admin role)

### Job Role Data Structure
```typescript
interface JobRole {
  id: number;
  name: string;
  location: string;
  capability: string;
  band: string;
  closingDate: Date;
  summary: string;
  keyResponsibilities: string;
  status: "open" | "closed";
  numberOfOpenPositions: number;
}
```

### Job Role Management Features

#### Business Logic & Validation
- **Status Transitions**: Jobs can only be closed if no applications are "in progress"
- **Deletion Rules**: Jobs with active applications cannot be deleted (unless force delete is used)
- **Cascade Operations**: Deleting a job also removes all associated applications
- **Input Validation**: Comprehensive validation for all job role fields
- **Partial Updates**: Support for updating individual fields without affecting others

#### Advanced Operations

**Update Job Role**:
```bash
curl -X PUT http://localhost:3001/api/jobs/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"name": "Senior Frontend Developer", "numberOfOpenPositions": 3}'
```

**Delete Job Role**:
```bash
# Regular delete (fails if active applications exist)
curl -X DELETE http://localhost:3001/api/jobs/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Force delete (removes job and all applications)
curl -X DELETE "http://localhost:3001/api/jobs/1?force=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Example API Responses

**Get Job Roles**:
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
  "count": 1,
  "total": 15
}
```

**Delete Job Role Success**:
```json
{
  "message": "Job role deleted successfully",
  "data": {
    "deletedJob": {
      "id": 1,
      "name": "Frontend Developer"
    },
    "deletedApplicationsCount": 3
  }
}
```

**Business Rule Violation**:
```json
{
  "error": "Cannot delete job role with 2 active application(s). Please process all applications before deletion or use force delete."
}
```

## Database

This project uses **SQLite** with **Drizzle ORM** for data persistence.

See **[`.github/instructions/drizzle-orm.instructions.md`](./.github/instructions/drizzle-orm.instructions.md)** for comprehensive database operations guide.

### First-Time Setup
🚨 **Required**: After installation, you must seed the database before using the application:
```bash
npm run db:seed
```

This populates the database with sample job roles. The application will create the database tables automatically, but it starts with no data.

### Database Schema

#### Job Roles Table (`job_roles`)
- `id` - Auto-incrementing primary key
- `name` - Job role title
- `location` - Job location
- `capability` - Required capability/skill area
- `band` - Experience level (Junior, Mid, Senior)
- `closing_date` - Application deadline
- `summary` - Job description summary
- `key_responsibilities` - Main responsibilities
- `status` - Job status (`open` | `closed`)
- `number_of_open_positions` - Available positions

#### Applications Table (`applications`)
- `id` - Auto-incrementing primary key
- `user_id` - Foreign key to users table
- `job_role_id` - Foreign key to job_roles table
- `cv_text` - Application CV content
- `status` - Application status (`in progress` | `hired` | `rejected`)
- `created_at` - Application submission timestamp

#### Users Tables
- `users` - Custom user accounts with email/password authentication
- `user` - Better Auth user accounts with OAuth support
- Related tables: `account`, `session`, `verification` for Better Auth

### Database Management
- **View Database**: `npm run db:studio` - Opens Drizzle Studio web interface at http://localhost:4983
- **Generate Migrations**: `npm run db:generate` - Creates migration files from schema changes
- **Apply Schema**: `npm run db:push` - Applies schema changes directly to database
- **Seed Data**: `npm run db:seed` - Populates database with sample job roles and users
- **Migration Files**: Located in `drizzle/` directory with sequential numbering (0000-0005)

## Project Structure

```
team4-job-app-backend/
├── .github/
│   └── instructions/       # 📖 Comprehensive documentation (READ FIRST)
│       ├── dependencies.instructions.md
│       ├── drizzle-orm.instructions.md
│       ├── linting.instructions.md
│       └── project-info.instructions.md
├── src/
│   ├── controllers/        # HTTP request handlers
│   │   ├── application-controller.ts
│   │   ├── auth-controller.ts
│   │   └── job-role-controller.ts
│   ├── db/
│   │   ├── index.ts        # Database connection
│   │   ├── schema.ts       # Database schema definition (tables, types)
│   │   └── seed.ts         # Sample data seeding
│   ├── errors/
│   │   └── custom-errors.ts # Custom error classes and handlers
│   ├── lib/
│   │   └── auth.ts         # Authentication utilities
│   ├── middleware/
│   │   └── auth.ts         # Authentication middleware
│   ├── repositories/       # Data access layer
│   │   ├── application-repository.ts
│   │   ├── job-role-repository.ts
│   │   └── user-repository.ts
│   ├── routes/             # API route definitions
│   │   ├── applications.ts
│   │   ├── auth.ts
│   │   └── jobs.ts
│   ├── services/           # Business logic layer
│   │   ├── application-service.ts
│   │   └── job-role-service.ts
│   ├── validators/         # Input validation layer
│   │   ├── application-validator.ts
│   │   └── job-role-validator.ts
│   └── index.ts            # Main application entry point
├── data/
│   └── database.sqlite     # SQLite database file
├── drizzle/                # Database migrations & metadata
│   ├── meta/
│   ├── 0000_create_job_roles.sql
│   ├── 0001_absurd_next_avengers.sql
│   ├── 0002_numerous_toro.sql
│   ├── 0003_melodic_hobgoblin.sql
│   ├── 0004_furry_rattler.sql
│   └── 0005_yellow_network.sql
├── dist/                   # Compiled JavaScript output
├── auth-schema.ts          # Better Auth configuration
├── drizzle.config.ts       # Drizzle ORM configuration
├── biome.json              # Biome linter/formatter config
├── vitest.config.ts        # Vitest testing configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

📖 **New to this project?** Start by reading the documentation in [`.github/instructions/`](./.github/instructions/)

## Testing

This project includes comprehensive test coverage with **117 tests** across all layers:

### Test Coverage
- **Service Layer Tests**: Business logic, validation, error handling
- **Validator Tests**: Input validation for create/update operations
- **Integration Tests**: API endpoint behavior and error responses
- **Repository Tests**: Database operations and data integrity
- **Error Handling Tests**: Custom error classes and HTTP status mapping

### Running Tests
```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode (development)
```

### Test Structure
- **Unit Tests**: Individual component testing (services, validators, repositories)
- **Integration Tests**: API endpoint testing with mock data
- **Business Logic Tests**: Complex scenarios like cascade deletion, status transitions
- **Error Scenario Tests**: Validation failures, not found errors, business rule violations

## Development Workflow

1. **Start development**: `npm run dev`
2. **Make changes**: Edit files in the `src/` directory
3. **Run tests**: `npm test` (ensure all tests pass)
4. **Check code quality**: `npm run check`
5. **Fix issues**: `npm run lint:fix`
6. **Build for production**: `npm run build`

## Technology Stack

- **Runtime**: Node.js (v18+, latest LTS: v20+)
- **Language**: TypeScript (v5.9+)
- **Framework**: Express.js v5.1.0 (RESTful API)
- **Database**: SQLite with Drizzle ORM v0.44.6
- **Module System**: ES Modules
- **Code Quality**: Biome v2.2.4 (linting + formatting)
- **Development**: tsx v4.20.6 (TypeScript execution with hot reloading)
- **Testing**: Vitest v3.2.4

📖 See [`.github/instructions/project-info.instructions.md`](./.github/instructions/project-info.instructions.md) for detailed technology stack information.  
📦 See [`.github/instructions/dependencies.instructions.md`](./.github/instructions/dependencies.instructions.md) for package management.

## Frontend Integration

This backend API serves data to the frontend application located in `team4-job-app-frontend/`.

### Connection Details
- **API Base URL**: `http://localhost:3001` (development)
- **CORS**: Configured to accept requests from `http://localhost:3000` (frontend)
- **Data Format**: JSON responses with `{success, data, count}` structure

### What the Frontend Needs
⚠️ **Critical**: The frontend application **cannot function without this backend running**. 

**Without this backend API, the frontend will**:
- ❌ Fail to load the jobs list page (empty/error state)
- ❌ Fail to display individual job details
- ❌ Show "Failed to load jobs" error messages
- ❌ Be unable to submit job applications

**To run both projects together**, see the "Quick Start (Backend + Frontend Together)" section above.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run code quality checks (`npm run check`)
5. Fix any issues (`npm run lint:fix`)
6. Commit your changes (`git commit -m 'Add amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

### Code Quality Standards

- All code must pass Biome linting and formatting checks
- Use TypeScript for type safety
- Follow the established code style guidelines
- Write meaningful commit messages

## VS Code Setup (Recommended)

For the best development experience, install the Biome VS Code extension:

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Biome"
4. Install the official Biome extension by `biomejs.biome`

This will provide real-time linting and formatting as you type.

## Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reloading |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run the compiled application |
| `npm run start:prod` | Build and run in production mode |
| `npm test` | Run unit tests with Vitest (117 tests) |
| `npm run db:generate` | Generate database migrations |
| `npm run db:push` | Push schema changes to database |
| `npm run db:studio` | Open Drizzle Studio (database browser) |
| `npm run db:seed` | Seed database with sample data |
| `npm run check` | Check for linting and formatting issues |
| `npm run lint` | Same as check |
| `npm run lint:fix` | Fix linting and formatting issues automatically |
| `npm run format` | Format code only |
| `npm run format:check` | Check formatting without applying changes |

## License

ISC