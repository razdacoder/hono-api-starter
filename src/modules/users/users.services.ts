import type { z } from "zod";

import { eq } from "drizzle-orm";

import type {
  User,
  userInsertSchema,
  userUpdateSchema,
  UserWithPassword,
} from "@/db/schema/users";

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

export const userSelectWithPassword = {
  id: userTable.id,
  firstName: userTable.firstName,
  lastName: userTable.lastName,
  email: userTable.email,
  isActive: userTable.isActive,
  emailVerifiedAt: userTable.emailVerifiedAt,
  role: userTable.role,
  password: userTable.password,
  createdAt: userTable.createdAt,
  updatedAt: userTable.updatedAt,
  deletedAt: userTable.deletedAt,
};

export async function getUserByEmail<T extends boolean>({
  email,
  withPassword = false as T, // Default is `false`
}: {
  email: string;
  withPassword?: T;
}): Promise<T extends true ? UserWithPassword | undefined : User | undefined> {
  const selectedFields = withPassword ? userSelectWithPassword : userSelect;

  const [user] = await db
    .select(selectedFields)
    .from(userTable)
    .where(eq(userTable.email, email));

  return user as T extends true
    ? UserWithPassword | undefined
    : User | undefined;
}

export async function getUserById<T extends boolean>({
  id,
  withPassword = false as T, // Default is `false`
}: {
  id: string;
  withPassword?: T;
}): Promise<T extends true ? UserWithPassword | undefined : User | undefined> {
  const selectedFields = withPassword ? userSelectWithPassword : userSelect;

  const [user] = await db
    .select(selectedFields)
    .from(userTable)
    .where(eq(userTable.id, id));

  return user as T extends true
    ? UserWithPassword | undefined
    : User | undefined;
}

export async function createUser(values: z.infer<typeof userInsertSchema>) {
  const [user] = await db
    .insert(userTable)
    .values({ ...values })
    .returning(userSelect);

  return user;
}

export async function updateUser(
  id: string,
  values: z.infer<typeof userUpdateSchema>
) {
  const [updatedUser] = await db
    .update(userTable)
    .set(values)
    .where(eq(userTable.id, id))
    .returning(userSelect);

  return updatedUser;
}

export async function deleteUser(id: string, soft: boolean) {
  if (soft) {
    await db
      .update(userTable)
      .set({ deletedAt: new Date() })
      .where(eq(userTable.id, id));
    return;
  }
  await db.delete(userTable).where(eq(userTable.id, id));
}
