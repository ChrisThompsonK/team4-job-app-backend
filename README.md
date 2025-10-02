[![Code Quality](https://github.com/ChrisThompsonK/team4-job-app-backend/actions/workflows/code-quality.yml/badge.svg)](https://github.com/ChrisThompsonK/team4-job-app-backend/actions/workflows/code-quality.yml)

[![Formatted with Biome](https://img.shields.io/badge/Formatted_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev/)

# Team 4 Job Application Project - Backend API

A modern Node.js backend API built with TypeScript, Express.js, and Drizzle ORM. This project provides RESTful API endpoints for managing job roles in the Team 4 Job Application system.

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

### Health Check
- `GET /` - Returns server status and available endpoints

### Job Roles API
- `GET /api/jobs` - Get all job roles
- `GET /api/jobs/:id` - Get specific job role by ID
- `GET /api/jobs/status/open` - Get all open job roles
- `GET /api/jobs/status/closed` - Get all closed job roles

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
├── src/
│   ├── db/
│   │   ├── index.ts         # Database connection
│   │   ├── schema.ts        # Database schema definition
│   │   └── seed.ts          # Sample data seeding
│   ├── routes/
│   │   └── jobs.ts          # Job roles API endpoints
│   └── index.ts             # Main application entry point
├── data/
│   └── database.sqlite      # SQLite database file
├── drizzle/                 # Database migrations
├── dist/                    # Compiled JavaScript output
├── drizzle.config.ts        # Drizzle ORM configuration
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## Development Workflow

1. **Start development**: `npm run dev`
2. **Make changes**: Edit files in the `src/` directory
3. **Check code quality**: `npm run check`
4. **Fix issues**: `npm run lint:fix`
5. **Build for production**: `npm run build`

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript  
- **Framework**: Express.js (RESTful API)
- **Database**: SQLite with Drizzle ORM
- **Module System**: ES Modules
- **Code Quality**: Biome (linting + formatting)
- **Development**: tsx (TypeScript execution with hot reloading)
- **Testing**: Vitest

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