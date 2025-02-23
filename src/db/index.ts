import { drizzle } from "drizzle-orm/postgres-js";

import env from "@/env";

export const db = drizzle({
  connection: {
    url: env.DATABASE_URL,
  },
});
