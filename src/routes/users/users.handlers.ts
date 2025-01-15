import type { AppRouteHandler } from "@/lib/types";

import type { Me, List } from "./users.routes";
import { db } from "@/db";
import { users } from "@/db/schema/users";
import { userSelect } from "@/services/users";
import { paginate } from "@/utils/create-paginated-data";
import { count, sql } from "drizzle-orm";

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
