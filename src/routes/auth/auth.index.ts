import {eq} from "drizzle-orm"
import {db} from "@/db"
import {users} from "@/db/schema/users"
import {userSelect} from "@/services/users"
import { createRouter } from "@/lib/create-app";
import { validateOTP } from "@/lib/encryption";
import * as handlers from "./auth.handlers";
import * as routes from "./auth.routes";

const router = createRouter()
  .openapi(routes.register, handlers.register)
  .openapi(routes.activation, async (c) => {
    const { email, otp } = c.req.valid("json");
    const [user] = await db
      .select(userSelect)
      .from(users)
      .where(eq(users.email, email));

    if (!user) {
      return c.json(
        {
          success: false,
          message: "Invalid OTP",
        },
        400
      );
    }

    const isValidOTP = await validateOTP(user.id, otp);

    if (!isValidOTP) {
      return c.json(
        {
          success: false,
          message: "Invalid or Expired OTP",
        },
        400
      );
    }

    await db
      .update(users)
      .set({ isActive: true, email_verified: true })
      .where(eq(users.id, user.id));

    return c.json(
      {
        success: true,
        message: "Account activated successfully",
      },
      200
    );
  });
// .openapi(routes.resendActivation, handlers.resendActivation);

export default router;
