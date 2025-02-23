import { eq } from "drizzle-orm";

import { db } from "@/db";
import { userTable } from "@/db/schema/users";

export const userSelect = {
  id: userTable.id,
  firstName: userTable.firstName,
  lastName: userTable.lastName,
  email: userTable.email,
  isActive: userTable.isActive,
  emailVerifiedAt: userTable.emailVerifiedAt,
  role: userTable.role,
  createdAt: userTable.createdAt,
  updatedAt: userTable.updatedAt,
  deletedAt: userTable.deletedAt,
};

export async function getUserByEmail(email: string) {
  const [user] = await db
    .select(userSelect)
    .from(userTable)
    .where(eq(userTable.email, email));
  return user;
}

export async function getUserById(id: string) {
  const [user] = await db
    .select(userSelect)
    .from(userTable)
    .where(eq(userTable.id, id));

  return user;
}
