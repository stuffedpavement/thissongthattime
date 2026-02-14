import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { sql } from 'drizzle-orm';
import ws from "ws";
import * as schema from "@shared/schema";
import { log } from "./vite";

neonConfig.webSocketConstructor = ws;
neonConfig.useSecureWebSocket = true;
neonConfig.pipelineConnect = false;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  max: 10
});

export const db = drizzle({ client: pool, schema });

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