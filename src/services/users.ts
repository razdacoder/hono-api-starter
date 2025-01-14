import { eq } from "drizzle-orm";
import { users } from "@/db/schema/users.js";
import { db } from "@/db";

export const userSelect = {
  id: users.id,
  firstName: users.firstName,
  lastName: users.lastName,
  email: users.email,
  isActive: users.isActive,
  emailVerified: users.email_verified,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
  deletedAt: users.deletedAt,
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select(userSelect)
    .from(users)
    .where(eq(users.email, email));
  return user;
};

export const getUserById = async (id: string) => {
  const [user] = await db
    .select(userSelect)
    .from(users)
    .where(eq(users.id, id));

  return user;
};
