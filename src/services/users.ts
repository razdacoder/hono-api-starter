import { users } from "@/db/schema/users.js";



export const userSelect = {
    id: users.id,
    firstName: users.firstName,
    lastName: users.lastName,
    email: users.email,
    isActive: users.isActive,
    emailVerified: users.email_verified,
    createdAt: users.createdAt,
    updatedAt: users.updatedAt,
    deletedAt: users.deletedAt
  }