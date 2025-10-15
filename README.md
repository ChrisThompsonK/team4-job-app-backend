[![Code Quality](https://github.com/ChrisThompsonK/team4-job-app-backend/actions/workflows/code-quality.yml/badge.svg)](https://github.com/ChrisThompsonK/team4-job-app-backend/actions/workflows/code-quality.yml)

[![Formatted with Biome](https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)

# Team 4 Job Application Project - Backend API

A modern Node.js backend API built with TypeScript, Express.js, and Drizzle ORM. This project provides RESTful API endpoints for managing job roles in the Team 4 Job Application system.

⚠️ **Important**: This backend API is required for the frontend application to function. The frontend (`team4-job-app-frontend`) consumes data from this API.

## 📖 Documentation

For comprehensive guides on working with this backend API, see the **[`instructions/` directory](./instructions/)**:

- **[Project Info](./instructions/project-info.md)** - Complete architecture overview, layered pattern, database schema
- **[Drizzle ORM](./instructions/drizzle-orm-instructions.md)** - Database operations, queries, migrations, seeding
- **[Linting](./instructions/linting-instructions.md)** - Biome setup, code style, AI/Copilot workflow
- **[Dependencies](./instructions/dependencies-instructions.md)** - npm package management, updates, security

**For LLMs/AI Assistants**: Read [`instructions/README.md`](./instructions/README.md) for guidance on using these documentation files.

## Features

- **TypeScript** - Type-safe JavaScript development
- **Express.js** - Fast, unopinionated web framework for building REST APIs
- **Drizzle ORM** - Modern TypeScript-first ORM for database operations
- **SQLite Database** - Lightweight database for job role storage
- **ES Modules** - Modern JavaScript module system
- **Biome** - Fast linter and formatter for consistent code quality
- **Hot Reloading** - Automatic server restart during development
- **RESTful API** - Backend API endpoints serving job role data
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

See **[`instructions/linting-instructions.md`](./instructions/linting-instructions.md)** for detailed linting setup and best practices.

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

#### Development
```bash
npm run dev           # Start development server with hot reloading
npm run build         # Compile TypeScript to JavaScript
npm start             # Run the compiled application
npm run start:prod    # Build and run in production mode
```

### Code Style Guidelines

- **Indentation**: 2 spaces
- **Quotes**: Double quotes for strings
- **Semicolons**: Always required
- **Line Width**: 100 characters maximum
- **Trailing Commas**: ES5 style

## API Endpoints

This backend provides RESTful API endpoints consumed by the frontend application.

See **[`instructions/project-info.md`](./instructions/project-info.md)** for complete API documentation and architecture details.

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
- `GET /api/jobs` - Get all job roles
- `GET /api/jobs/:id` - Get specific job role by ID
- `GET /api/jobs/status/open` - Get all open job roles
- `GET /api/jobs/status/closed` - Get all closed job roles

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

### Example API Response
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

## Database

This project uses **SQLite** with **Drizzle ORM** for data persistence.

See **[`instructions/drizzle-orm-instructions.md`](./instructions/drizzle-orm-instructions.md)** for comprehensive database operations guide.

### First-Time Setup
🚨 **Required**: After installation, you must seed the database before using the application:
```bash
npm run db:seed
```

This populates the database with sample job roles. The application will create the database tables automatically, but it starts with no data.

### Database Schema
The main entity is the `job_roles` table with the following structure:
- `id` - Auto-incrementing primary key
- `name` - Job role title
- `location` - Job location
- `capability` - Required capability/skill area
- `band` - Experience level (Junior, Mid, Senior)
- `closing_date` - Application deadline
- `summary` - Job description summary
- `key_responsibilities` - Main responsibilities
- `status` - Job status (open/closed)
- `number_of_open_positions` - Available positions

### Database Management
- **View Database**: `npm run db:studio` - Opens Drizzle Studio web interface
- **Generate Migrations**: `npm run db:generate` - Creates migration files
- **Apply Schema**: `npm run db:push` - Applies schema to database
- **Seed Data**: `npm run db:seed` - Populates with sample job roles

## Project Structure

```
team4-job-app-backend/
├── instructions/            # 📖 Comprehensive documentation (READ FIRST)
│   ├── README.md           # Documentation navigation guide
│   ├── project-info.md     # Architecture & technology overview
│   ├── drizzle-orm-instructions.md  # Database operations guide
│   ├── linting-instructions.md      # Code quality & AI workflow
│   └── dependencies-instructions.md # Package management
├── src/
│   ├── db/
│   │   ├── index.ts        # Database connection
│   │   ├── schema.ts       # Database schema definition
│   │   └── seed.ts         # Sample data seeding
│   ├── routes/
│   │   └── jobs.ts         # Job roles API endpoints
│   └── index.ts            # Main application entry point
├── data/
│   └── database.sqlite     # SQLite database file
├── drizzle/                # Database migrations
├── dist/                   # Compiled JavaScript output
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json            # Project dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

📖 **New to this project?** Start by reading [`instructions/README.md`](./instructions/README.md)

## Development Workflow

1. **Start development**: `npm run dev`
2. **Make changes**: Edit files in the `src/` directory
3. **Check code quality**: `npm run check`
4. **Fix issues**: `npm run lint:fix`
5. **Build for production**: `npm run build`

## Technology Stack

- **Runtime**: Node.js (v18+, latest LTS: v20+)
- **Language**: TypeScript (v5.9+)
- **Framework**: Express.js v5.1.0 (RESTful API)
- **Database**: SQLite with Drizzle ORM v0.44.6
- **Module System**: ES Modules
- **Code Quality**: Biome v2.2.4 (linting + formatting)
- **Development**: tsx v4.20.6 (TypeScript execution with hot reloading)
- **Testing**: Vitest v3.2.4

📖 See [`instructions/project-info.md`](./instructions/project-info.md) for detailed technology stack information.  
📦 See [`instructions/dependencies-instructions.md`](./instructions/dependencies-instructions.md) for package management.

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
| `npm test` | Run unit tests with Vitest |
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