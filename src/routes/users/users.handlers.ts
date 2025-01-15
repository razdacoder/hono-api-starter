import type { AppRouteHandler } from "@/lib/types";

import type { Me } from "./users.routes";

export const me: AppRouteHandler<Me> = async (c) => {
  const user = c.get("user");
  return c.json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
};
