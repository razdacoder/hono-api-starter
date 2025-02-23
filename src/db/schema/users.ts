import type { InferSelectModel } from "drizzle-orm";

import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const userRole = pgEnum("role", ["USER", "ADMIN"]);

export const userTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  isActive: boolean("is_active").default(false).notNull(),
  role: userRole().default("USER").notNull(),
  emailVerifiedAt: timestamp("email_verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const userInsertSchema = createInsertSchema(userTable)
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
    role: true,
    emailVerifiedAt: true,
  });

export const userAdminInsertSchema = createInsertSchema(userTable)
  .required({
    firstName: true,
    lastName: true,
    email: true,
    password: true,
    role: true,
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    isActive: true,
    emailVerifiedAt: true,
  });

export const userSelectSchema = createSelectSchema(userTable).omit({
  password: true,
});

export const userUpdateSchema = userInsertSchema.partial().omit({
  email: true,
  password: true,
});

export type UserWithPassword = InferSelectModel<typeof userTable>;
export type User = Omit<UserWithPassword, "password">;
