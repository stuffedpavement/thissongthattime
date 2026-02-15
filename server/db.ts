import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import * as schema from "@shared/schema";
import { log } from "./vite";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = drizzle(pool, { schema });

// Test database connection on startup
export async function initializeDatabase(): Promise<boolean> {
  try {
    // Test the connection with a simple query
    const result = await db.execute(sql`SELECT 1 as test`);
    log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    // Don't fail completely, just log the error
    log("Continuing without database connection");
    return false;
  }
}
