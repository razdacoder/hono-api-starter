import { count } from "drizzle-orm";
import type { AppRouteHandler } from "@/lib/types";

import type { Me, List, GetUser } from "./users.routes";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { userSelect } from "@/services/users";
import { paginate } from "@/utils/create-paginated-data";
import { getUserById } from "@/services/users";

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
    () => db.select({ count: count() }).from(users),
    { page, limit }
  );
  return c.json(
    {
      success: true,
      message: "User list featched successfull",
      data: result,
    },
    200
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
