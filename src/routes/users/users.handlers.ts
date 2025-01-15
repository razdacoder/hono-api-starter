import { AppRouteHandler } from "@/lib/types";
import { Me } from "./users.routes";
import { JWTPayload } from "@/lib/jwt";
import { getUserById } from "@/services/users";

export const me: AppRouteHandler<Me> = async (c) => {
  const user = c.get("user")
  return c.json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
};
