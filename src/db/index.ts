
import env from "@/env.js";
import { drizzle } from "drizzle-orm/postgres-js";


export const db = drizzle(env.DATABASE_URL);
  