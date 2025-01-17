import type { z } from "@hono/zod-openapi";

import { createMiddleware } from "hono/factory";

import type { userSelectSchema } from "@/db/schema/users";

import { logger } from "@/lib/logger";

export const isAdminCheck = createMiddleware(async (c, next) => {
  const user: z.infer<typeof userSelectSchema> = c.get("user");
  if (user.isAdmin === false) {
    logger.error(user);
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
  await next();
});
