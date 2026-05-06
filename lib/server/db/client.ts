//db 
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const databaseUrl = process.env.DATABASE_URL;

const schema = {};

if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for API routes");
}

const sql = neon(databaseUrl);

export const db = drizzle({ client: sql, schema });
