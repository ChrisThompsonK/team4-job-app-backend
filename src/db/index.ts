import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { mkdirSync } from "fs";
import { dirname } from "path";
import * as schema from "./schema.js";

// Create database file path
const dbPath = process.env.DATABASE_URL || "./data/database.sqlite";

// Ensure the directory exists
const dbDir = dirname(dbPath);
mkdirSync(dbDir, { recursive: true });

// Initialize database
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

// Create tables and seed data on startup
async function initializeDatabase() {
  try {
    console.log("🔧 Initializing database...");

    // Create the job_roles table if it doesn't exist
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS job_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        name TEXT NOT NULL,
        location TEXT NOT NULL,
        capability TEXT NOT NULL,
        band TEXT NOT NULL,
        closing_date TEXT NOT NULL,
        summary TEXT NOT NULL,
        key_responsibilities TEXT NOT NULL,
        status TEXT NOT NULL,
        number_of_open_positions INTEGER NOT NULL
      );
    `);

    console.log("✅ Database tables created successfully!");

    // Check if database is empty and seed if needed
    const existingJobs = await db.select().from(schema.jobRoles).limit(1);
    if (existingJobs.length === 0) {
      console.log("🌱 Seeding database with sample job roles...");
      await seedDatabase();
    } else {
      console.log("📊 Database already contains data, skipping seed.");
    }
  } catch (error) {
    console.error("❌ Database initialization error:", error);
  }
}

async function seedDatabase() {
  const sampleJobs = [
    {
      name: "Frontend Developer",
      location: "London, UK",
      capability: "Software Development",
      band: "Mid Level",
      closingDate: "2025-11-15T23:59:59.000Z",
      summary:
        "We're looking for a skilled Frontend Developer to join our dynamic team. You'll be responsible for creating engaging user interfaces and working with modern web technologies.",
      keyResponsibilities:
        "Develop responsive web applications using React and TypeScript. Collaborate with design teams to implement UI/UX requirements. Write clean, maintainable code following best practices.",
      status: "open",
      numberOfOpenPositions: 2,
    },
    {
      name: "Backend Developer",
      location: "Manchester, UK",
      capability: "Software Development",
      band: "Senior Level",
      closingDate: "2025-10-30T23:59:59.000Z",
      summary:
        "Join our backend team to build scalable APIs and microservices. You'll work with cutting-edge technologies and solve complex technical challenges.",
      keyResponsibilities:
        "Design and implement REST APIs. Manage database architecture and optimization. Ensure system scalability and performance.",
      status: "open",
      numberOfOpenPositions: 1,
    },
    {
      name: "Full Stack Developer",
      location: "Remote",
      capability: "Software Development",
      band: "Junior Level",
      closingDate: "2025-12-01T23:59:59.000Z",
      summary:
        "Exciting opportunity to work with a fast-growing startup. You'll be involved in both frontend and backend development, working across the entire stack.",
      keyResponsibilities:
        "Develop full-stack applications. Work with React, Node.js, and databases. Participate in code reviews and team collaboration.",
      status: "open",
      numberOfOpenPositions: 3,
    },
    {
      name: "DevOps Engineer",
      location: "Edinburgh, UK",
      capability: "Infrastructure",
      band: "Senior Level",
      closingDate: "2025-11-30T23:59:59.000Z",
      summary:
        "Lead our infrastructure and deployment strategies. You'll work with cloud technologies and automation tools to ensure reliable and scalable systems.",
      keyResponsibilities:
        "Manage CI/CD pipelines. Deploy and monitor cloud infrastructure. Implement automation and monitoring solutions.",
      status: "open",
      numberOfOpenPositions: 1,
    },
    {
      name: "Product Manager",
      location: "Birmingham, UK",
      capability: "Product Management",
      band: "Senior Level",
      closingDate: "2025-10-25T23:59:59.000Z",
      summary:
        "Drive product strategy and roadmap for our key initiatives. You'll work closely with engineering and design teams to deliver exceptional user experiences.",
      keyResponsibilities:
        "Define product requirements and roadmap. Conduct market research and user analysis. Coordinate with cross-functional teams.",
      status: "open",
      numberOfOpenPositions: 1,
    },
    {
      name: "UX Designer",
      location: "London, UK",
      capability: "Design",
      band: "Mid Level",
      closingDate: "2025-12-10T23:59:59.000Z",
      summary:
        "Create intuitive and engaging user experiences for our digital products. You'll be responsible for user research, wireframing, and prototyping.",
      keyResponsibilities:
        "Conduct user research and usability testing. Create wireframes and prototypes. Collaborate with development teams on implementation.",
      status: "open",
      numberOfOpenPositions: 2,
    },
    {
      name: "Data Scientist",
      location: "Cambridge, UK",
      capability: "Data & Analytics",
      band: "Senior Level",
      closingDate: "2025-11-20T23:59:59.000Z",
      summary:
        "Join our data team to extract insights from complex datasets. You'll build machine learning models and drive data-informed decision making.",
      keyResponsibilities:
        "Develop predictive models and algorithms. Analyze large datasets to identify trends. Present findings to stakeholders and leadership.",
      status: "open",
      numberOfOpenPositions: 1,
    },
    {
      name: "Quality Assurance Engineer",
      location: "Bristol, UK",
      capability: "Quality Assurance",
      band: "Mid Level",
      closingDate: "2025-10-20T23:59:59.000Z",
      summary:
        "Ensure the quality and reliability of our software products. You'll design test strategies and automate testing processes.",
      keyResponsibilities:
        "Create comprehensive test plans. Automate testing workflows. Identify and track bugs through resolution.",
      status: "open",
      numberOfOpenPositions: 2,
    },
  ];

  try {
    await db.insert(schema.jobRoles).values(sampleJobs);
    console.log("✅ Database seeded successfully with sample job roles!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
}

// Initialize database on module load
initializeDatabase();

export default db;
