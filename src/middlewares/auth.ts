import { createMiddleware } from "hono/factory";

import { verifyJWT } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { getUserById } from "@/modules/users/users.services";

export const authCheck = createMiddleware(async (c, next) => {
  try {
    // Verify JWT from Authorization header
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      throw new Error("Authorization token is missing");
    }

    // Decode and validate the token
    const payload = await verifyJWT(token);
    const user = await getUserById({ id: payload.sub, withPassword: false });

    if (!user) {
      throw new Error("User not found");
    }

    // Attach user data to the context
    c.set("user", user);

    // Proceed to the next middleware or route handler
    await next();
  } catch (err) {
    logger.error(err);
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
});
