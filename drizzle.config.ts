import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema",
  dialect: "postgresql",
  dbCredentials: {
    // eslint-disable-next-line node/no-process-env
    url: process.env.DATABASE_URL!,
  },
});
