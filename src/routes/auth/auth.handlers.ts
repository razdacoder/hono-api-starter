import type { AppRouteHandler } from "@/lib/types.js";
import type {
  RegisterRoute,
  ResendActivationType,
  ActivationType,
  LoginType,
  ResetPasswordType,
} from "./auth.routes.js";
import { db } from "@/db/index.js";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema/users.js";
import argon2 from "argon2";
import { userSelect, getUserByEmail } from "@/services/users.js";
import { defaultQueue } from "@/lib/queue.js";
import { TASK } from "@/tasks/index.js";
import { generateOrReuseOTP, validateOTP } from "@/lib/encryption.js";
import { encodeJWT } from "@/lib/jwt.js";

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

  const otp = await generateOrReuseOTP(user.id, "activation");

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

export const resendActivation: AppRouteHandler<ResendActivationType> = async (
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
  const otp = await generateOrReuseOTP(user.id, "activation");

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

export const activation: AppRouteHandler<ActivationType> = async (c) => {
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

  const isValidOTP = await validateOTP(user.id, otp, "activation");

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

  const job = await defaultQueue.add(TASK.SendWelcomeEmail, {
    email: user.email,
    name: user.firstName,
  });
  c.var.logger.info(
    `Job ${job.id} added to queue. Task scheduled for ${TASK.SendWelcomeEmail}`
  );

  return c.json(
    {
      success: true,
      message: "Account activated successfully",
    },
    200
  );
};

export const login: AppRouteHandler<LoginType> = async (c) => {
  const { email, password } = c.req.valid("json");

  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user || !(await argon2.verify(user.password, password))) {
    return c.json(
      { success: false, message: "Invalid email or password" },
      401
    );
  }

  if (!user.isActive) {
    return c.json(
      {
        success: false,
        message: "Account not active",
      },
      401
    );
  }

  if (!user.email_verified) {
    const otp = await generateOrReuseOTP(user.id, "activation");

    const job = await defaultQueue.add(TASK.SendActivationEmail, {
      email: user.email,
      otp: otp,
    });
    c.var.logger.info(
      `Job ${job.id} added to queue. Task scheduled for ${TASK.SendActivationEmail}`
    );
    return c.json(
      {
        success: false,
        message: "Invalid email or password",
        data: {
          verify_email: true,
        },
      },
      401
    );
  }

  const access_token = await encodeJWT(
    user.id,
    user.email,
    Math.floor(Date.now() / 1000) + 60 * 5
  );

  const refresh_token = await encodeJWT(
    user.id,
    user.email,
    Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5
  );

  return c.json(
    {
      success: true,
      message: "Login sucessfull",
      data: {
        access_token,
        refresh_token,
        user: { ...user, password: undefined },
      },
    },
    200
  );
};

export const resetPassword: AppRouteHandler<ResetPasswordType> = async (c) => {
  const { email } = c.req.valid("json");

  const user = await getUserByEmail(email);

  if (user) {
    const otp = await generateOrReuseOTP(user.id, "reset-password");
    const job = await defaultQueue.add(TASK.SendPasswordResetEmail, {
      email: user.email,
      name: user.firstName,
      otp,
    });
    c.var.logger.info(
      `Job ${job.id} added to queue. Task scheduled for ${TASK.SendPasswordResetEmail}`
    );
  }

  return c.json({
    success: true,
    message: "Password reset mail sent",
  });
};
