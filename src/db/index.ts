import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
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

// Initialize database tables on startup
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
  } catch (error) {
    console.error("❌ Database initialization error:", error);
  }
}

// Initialize database on module load
initializeDatabase();

export default db;
