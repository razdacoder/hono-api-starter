import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';



export const userTable = pgTable("users", {
    id: uuid().primaryKey().defaultRandom(),
    firstName: varchar({length: 50}).notNull(),
    lastName: varchar({length: 50}).notNull(),
    email: varchar({length: 100}).notNull().unique(),
    isActive: boolean().default(false),
    email_verified: boolean().default(false),
    password: text().notNull(),

    updatedAt: timestamp().defaultNow().$onUpdate(() => new Date()),
    created_at: timestamp().defaultNow().notNull(),
    deleted_at: timestamp(),
})