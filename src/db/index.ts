import { drizzle } from "drizzle-orm/libsql";

import env from "@/env";

export const db = drizzle({ connection: { url: env.DB_FILE_NAME } });
