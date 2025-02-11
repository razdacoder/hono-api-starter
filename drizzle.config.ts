import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/db/migrations",
  schema: "./src/db/schema",
  dialect: "sqlite",
  dbCredentials: {
    // eslint-disable-next-line node/no-process-env
    url: process.env.DB_FILE_NAME!,
  },
});
