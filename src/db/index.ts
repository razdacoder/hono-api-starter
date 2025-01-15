import { drizzle } from "drizzle-orm/postgres-js";

import env from "@/env.js";

import { users } from "./schema/users.js";

export const db = drizzle(env.DATABASE_URL, { schema: {
  users,
} });
