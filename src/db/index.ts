import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

// Create database file path
const dbUrl = process.env.DATABASE_URL || "./data/database.sqlite";
// Remove 'file:' prefix if present
const dbPath = dbUrl.replace(/^file:/, "");

// Ensure the directory exists
const dbDir = dirname(dbPath);
mkdirSync(dbDir, { recursive: true });

// Initialize database
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");

// Create drizzle instance
export const db = drizzle(sqlite, { schema });
