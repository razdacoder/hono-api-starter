import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';



export const users = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),
    firstName: varchar({length: 50}).notNull(),
    lastName: varchar({length: 50}).notNull(),
    email: varchar({length: 100}).notNull().unique(),
    isActive: boolean().default(false).notNull(),
    email_verified: boolean().default(false).notNull(),
    password: text().notNull(),

    updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    deletedAt: timestamp(),
})



export const userInsertSchema = createInsertSchema(users).required({
    firstName: true,
    lastName: true,
    email: true,
    password: true
}).omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
    isActive: true,
    email_verified: true
});

export const userSelectSchema = createSelectSchema(users).omit({
    password: true
})

export const userUpdateSchema = userInsertSchema.partial()

