import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users } from "@/db/schema/users";

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

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select(userSelect)
    .from(users)
    .where(eq(users.email, email));
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db
    .select(userSelect)
    .from(users)
    .where(eq(users.id, id));

  return user;
}
