import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/server/db/schemas.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
