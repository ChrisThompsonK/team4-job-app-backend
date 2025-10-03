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

// Run pending migrations if needed (temporary fix until drizzle-kit is updated)
function runMigrations() {
  try {
    // Check if table exists
    const tableExists = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='job_roles'")
      .get();

    if (!tableExists) {
      console.log("🔧 Running database migrations...");
      // Run the migration SQL
      sqlite.exec(`
        CREATE TABLE job_roles (
          id integer PRIMARY KEY AUTOINCREMENT NOT NULL,
          name text NOT NULL,
          location text NOT NULL,
          capability text NOT NULL,
          band text NOT NULL,
          closing_date text NOT NULL,
          summary text NOT NULL,
          key_responsibilities text NOT NULL,
          status text NOT NULL,
          number_of_open_positions integer NOT NULL
        );
      `);
      console.log("✅ Migrations completed successfully!");
    }
  } catch (error) {
    console.error("❌ Migration error:", error);
  }
}

// Run migrations on startup
runMigrations();

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

export default db;
