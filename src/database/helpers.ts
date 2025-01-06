import { timestamp } from "drizzle-orm/pg-core";

export const timestamps = {
    updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
    created_at: timestamp().defaultNow().notNull(),
    deleted_at: timestamp(),
  }