import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import crypto from "node:crypto";

export const users = sqliteTable("users", {
  id: text()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  firstName: text({ length: 50 }).notNull(),
  lastName: text({ length: 50 }).notNull(),
  email: text({ length: 100 }).notNull().unique(),
  isActive: integer({ mode: "boolean" }).default(false).notNull(),
  email_verified: integer({ mode: "boolean" }).default(false).notNull(),
  isAdmin: integer({ mode: "boolean" }).default(false).notNull(),
  password: text().notNull(),
  updatedAt: text()
    .notNull()
    .default(sql`(current_timestamp)`)
    .$onUpdate(() => sql`(current_timestamp)`),
  createdAt: text()
    .notNull()
    .default(sql`(current_timestamp)`),
  deletedAt: text(),
});

export const userInsertSchema = createInsertSchema(users)
  .required({
    firstName: true,
    lastName: true,
    email: true,
    password: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    isActive: true,
    isAdmin: true,
    email_verified: true,
  });

export const userSelectSchema = createSelectSchema(users).omit({
  password: true,
});

export const userUpdateSchema = userInsertSchema.partial().omit({
  email: true,
  password: true,
});
