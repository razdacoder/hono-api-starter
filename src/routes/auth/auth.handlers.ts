import type { AppRouteHandler } from "@/lib/types.js";
import type { RegisterRoute, ResendActivation } from "./auth.routes.js";
import { db } from "@/db/index.js";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema/users.js";
import argon2 from "argon2";
import { userSelect } from "@/services/users.js";
import { defaultQueue, connection as redis } from "@/lib/queue.js";
import { TASK } from "@/tasks/index.js";
import { generateOrReuseOTP } from "@/lib/encryption.js";

export const register: AppRouteHandler<RegisterRoute> = async (c) => {
  const { firstName, lastName, email, password } = c.req.valid("json");

  const [existingUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, email));

  if (existingUser) {
    return c.json({ success: false, message: "Email already exists" }, 400);
  }

  const hashPassword = await argon2.hash(password);

  const [user] = await db
    .insert(users)
    .values({
      firstName,
      lastName,
      email,
      password: hashPassword,
    })
    .returning(userSelect);

  const otp = await generateOrReuseOTP(user.id);

  const job = await defaultQueue.add(TASK.SendActivationEmail, {
    email: user.email,
    otp: otp,
  });
  c.var.logger.info(
    `Job ${job.id} added to queue. Task scheduled for ${TASK.SendActivationEmail}`
  );
  return c.json(
    {
      success: true,
      message: "User created Successfully",
      data: user,
    },
    201
  );
};

export const resendActivation: AppRouteHandler<ResendActivation> = async (
  c
) => {
  const { email } = c.req.valid("json");
  const [user] = await db
    .select(userSelect)
    .from(users)
    .where(eq(users.email, email));
  if (!user) {
    return c.json({ success: false, message: "No active account found" }, 400);
  }
  const otp = await generateOrReuseOTP(user.id);

  const job = await defaultQueue.add(TASK.SendActivationEmail, {
    email: user.email,
    otp: otp,
  });
  c.var.logger.info(
    `Job ${job.id} added to queue. Task scheduled for ${TASK.SendActivationEmail}`
  );

  return c.json(
    {
      success: true,
      message: "OTP resend successfull",
    },
    200
  );
};
