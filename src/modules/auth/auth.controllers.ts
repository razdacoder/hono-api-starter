import argon2 from "argon2";
import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db/index";
import { users } from "@/db/schema/users";
import {
  generateOrReuseOTP,
  invalidateOTP,
  validateOTP,
} from "@/lib/encryption";
import { encodeJWT, verifyJWT } from "@/lib/jwt";
import { mailQueue } from "@/lib/queue";
import { EMAILTASKS } from "@/tasks/emails";

import type {
  ActivationType,
  LoginType,
  RefreshTokenType,
  RegisterRoute,
  ResendActivationType,
  ResetPasswordConfirmType,
  ResetPasswordType,
  VerifyTokenType,
} from "./auth.routes";

import { getUserByEmail, userSelect } from "../users/users.services";

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

  await mailQueue.add(EMAILTASKS.SendActivationEmail, {
    email: user.email,
    otp,
  });

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

  await mailQueue.add(EMAILTASKS.SendActivationEmail, {
    email: user.email,
    otp,
  });

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

  await mailQueue.add(EMAILTASKS.SendWelcomeEmail, {
    email: user.email,
    name: user.firstName,
  });

  await invalidateOTP(user.id, "activation");

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

    const job = await mailQueue.add(EMAILTASKS.SendActivationEmail, {
      email: user.email,
      otp,
    });

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
    Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5 // Expiry in 5 days
  );

  // setCookie(c, "refresh_token", refresh_token, {
  //   path: "/",
  //   secure: env.NODE_ENV === "production",
  //   httpOnly: true,
  //   maxAge: 60 * 60 * 24 * 5, // Duration in seconds (5 days)
  //   sameSite: "None", // Required for cookies used in cross-site contexts
  // });

  // c.header("Set-Cookie", refresh_token, { append: true });

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
    await mailQueue.add(EMAILTASKS.SendPasswordResetEmail, {
      email: user.email,
      name: user.firstName,
      otp,
    });
  }

  return c.json({
    success: true,
    message: "Password reset mail sent",
  });
};

export const resetPasswordConfirm: AppRouteHandler<
  ResetPasswordConfirmType
> = async (c) => {
  const { email, otp, new_password } = c.req.valid("json");

  const user = await getUserByEmail(email);

  if (!user) {
    return c.json({ success: false, message: "Invalid or exipred otp" }, 400);
  }

  const isValidOTP = await validateOTP(user.id, otp, "reset-password");

  if (!isValidOTP) {
    return c.json({ success: false, message: "Invalid or exipred otp" }, 400);
  }

  const hashedPassword = await argon2.hash(new_password);

  await db
    .update(users)
    .set({ password: hashedPassword })
    .where(eq(users.id, user.id));

  await invalidateOTP(user.id, "reset-password");

  return c.json({ success: true, message: "Password reset sucessfull" }, 200);
};

export const refreshToken: AppRouteHandler<RefreshTokenType> = async (c) => {
  const { refresh_token } = c.req.valid("json");

  try {
    const payload = await verifyJWT(refresh_token);
    const access_token = await encodeJWT(
      payload.sub,
      payload.email,
      Math.floor(Date.now() / 1000) + 60 * 5
    );

    return c.json(
      {
        success: true,
        message: "Token refresh sucessfull",
        data: {
          access_token,
        },
      },
      200
    );
  } catch (e) {
    c.var.logger.error(e);
    return c.json({ success: false, message: "Unauthorized" }, 401);
  }
};

export const verifyToken: AppRouteHandler<VerifyTokenType> = async (c) => {
  return c.json(
    { success: true, message: "Token verification Sucessuful" },
    200
  );
};
