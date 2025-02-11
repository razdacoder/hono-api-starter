import argon2 from "argon2";
import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { users } from "@/db/schema/users";
import { getUserById, userSelect } from "@/modules/users/users.services";
import { paginate } from "@/utils/create-paginated-data";

import type {
  ChangeUserPassword,
  DeleteCurrentUser,
  GetUser,
  List,
  Me,
  UpdateCurrentUser,
} from "./users.routes";

export const me: AppRouteHandler<Me> = async (c) => {
  const user = c.get("user");
  return c.json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
};

export const list: AppRouteHandler<List> = async (c) => {
  const { page, limit } = c.req.valid("query");

  const result = await paginate(
    () => db.select(userSelect).from(users),
    { page, limit },
  );
  return c.json(
    {
      success: true,
      message: "User list featched successfull",
      data: result,
    },
    200,
  );
};

export const getUser: AppRouteHandler<GetUser> = async (c) => {
  const { id } = c.req.valid("param");
  const user = await getUserById(id);
  if (!user) {
    return c.json({ success: false, message: "User not found" }, 404);
  }
  return c.json({ success: true, message: "User retrieve sucessfully" }, 200);
};

export const updateCurrentUser: AppRouteHandler<UpdateCurrentUser> = async (
  c,
) => {
  const payload = c.req.valid("json");
  const user = c.get("user");
  const updatedUser = await db
    .update(users)
    .set(payload)
    .where(eq(users.id, user.id))
    .returning(userSelect);
  return c.json(
    { success: true, message: "User updated successfull", data: updatedUser },
    200,
  );
};

export const deleteCurrentUser: AppRouteHandler<DeleteCurrentUser> = async (
  c,
) => {
  const { current_password } = c.req.valid("json");
  const user = c.get("user");
  const [userWithPass] = await db
    .select({ password: users.password })
    .from(users)
    .where(eq(users.id, user.id));
  const isValidPassword = await argon2.verify(
    userWithPass.password,
    current_password,
  );
  if (!isValidPassword) {
    return c.json({ success: false, message: "Invalid password" }, 400);
  }
  await db.delete(users).where(eq(users.id, user.id));
  return c.json(
    { success: true, message: "Account deleted successfully" },
    200,
  );
};

export const changeUserPassword: AppRouteHandler<ChangeUserPassword> = async (
  c,
) => {
  const { current_password, new_password } = c.req.valid("json");
  const user = c.get("user");
  const [userPassword] = await db
    .select({ password: users.password })
    .from(users)
    .where(eq(users.id, user.id));

  const isValidPassword = await argon2.verify(
    userPassword.password,
    current_password,
  );
  if (!isValidPassword) {
    return c.json({ success: false, message: "Invalid Password" }, 400);
  }

  const hashedPassword = await argon2.hash(new_password);
  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, user.id));

  return c.json(
    { success: true, message: "Password updated sucessfully" },
    200,
  );
};
