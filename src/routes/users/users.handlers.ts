import { AppRouteHandler } from "@/lib/types";
import { Me } from "./users.routes";
import { JWTPayload } from "@/lib/jwt";
import { getUserById } from "@/services/users";

export const me: AppRouteHandler<Me> = async (c) => {
  const payload: JWTPayload = c.get("jwtPayload");
  const user = await getUserById(payload.sub);
  return c.json({
    success: true,
    message: "User fetched successfully",
    data: user,
  });
};
