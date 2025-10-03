import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

// Create database file path
const dbPath = process.env.DATABASE_URL || "./data/database.sqlite";

// Initialize database
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Create drizzle instance
export const db = drizzle(sqlite, { schema });

export default db;
