import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = process.env.DATABASE_URL?.replace("file:", "") || "./data/database.sqlite";
console.log(`Connecting to database at: ${dbPath}`);

const sqlite = new Database(dbPath);
const db = drizzle(sqlite);

console.log("Running migrations...");
// In production (dist), migrations are at /app/drizzle
// In development, they're at ../drizzle relative to src/db
const migrationsFolder =
  process.env.NODE_ENV === "production" ? "/app/drizzle" : join(__dirname, "../../drizzle");
console.log(`Using migrations folder: ${migrationsFolder}`);
migrate(db, { migrationsFolder });
console.log("Migrations completed successfully!");

sqlite.close();
