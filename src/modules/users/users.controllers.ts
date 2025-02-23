import argon2 from "argon2";
import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db";
import { userTable } from "@/db/schema/users";
import {
  deleteUser,
  getUserById,
  updateUser,
  userSelect,
} from "@/modules/users/users.services";
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
    message: "User fetched successfully",
    data: user,
  });
};

export const list: AppRouteHandler<List> = async (c) => {
  const { page, limit } = c.req.valid("query");

  const result = await paginate(() => db.select(userSelect).from(userTable), {
    page,
    limit,
  });
  return c.json(
    {
      message: "User list fetched successfully",
      data: result,
    },
    200
  );
};

export const getUser: AppRouteHandler<GetUser> = async (c) => {
  const { id } = c.req.valid("param");
  const user = await getUserById({ id, withPassword: false });
  if (!user) {
    return c.json({ message: "User not found" }, 404);
  }
  return c.json({ message: "User retrieve successfully" }, 200);
};

export const updateCurrentUser: AppRouteHandler<UpdateCurrentUser> = async (
  c
) => {
  const payload = c.req.valid("json");
  const user = c.get("user");
  const updatedUser = await updateUser(user.id, payload);
  return c.json({ message: "User updated successful", data: updatedUser }, 200);
};

export const deleteCurrentUser: AppRouteHandler<DeleteCurrentUser> = async (
  c
) => {
  const { current_password } = c.req.valid("json");
  const user = c.get("user");
  const userWithPassword = await getUserById({
    id: user.id,
    withPassword: true,
  });
  if (!userWithPassword) {
    return c.json({ message: "Unauthorized" }, 401);
  }
  const isValidPassword = await argon2.verify(
    userWithPassword.password,
    current_password
  );
  if (!isValidPassword) {
    return c.json({ message: "Invalid password" }, 400);
  }
  await deleteUser(user.id, true);
  return c.json({ message: "Account deleted successfully" }, 200);
};

export const changeUserPassword: AppRouteHandler<ChangeUserPassword> = async (
  c
) => {
  const { current_password, new_password } = c.req.valid("json");
  const user = c.get("user");
  const userWithPassword = await getUserById({
    id: user.id,
    withPassword: true,
  });

  if (!userWithPassword) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const isValidPassword = await argon2.verify(
    userWithPassword.password,
    current_password
  );

  if (!isValidPassword) {
    return c.json({ message: "Invalid Password" }, 400);
  }

  const hashedPassword = await argon2.hash(new_password);
  await db
    .update(userTable)
    .set({ password: hashedPassword })
    .where(eq(userTable.id, user.id));

  return c.json({ message: "Password updated successfully" }, 200);
};
