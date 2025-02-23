import argon2 from "argon2";
import { eq } from "drizzle-orm";

import type { AppRouteHandler } from "@/lib/types";

import { db } from "@/db/index";
import { userTable } from "@/db/schema/users";
import {
  generateOrReuseOTP,
  invalidateOTP,
  validateOTP,
} from "@/lib/encryption";
import { encodeJWT, verifyJWT } from "@/lib/jwt";
import { logger } from "@/lib/logger";
import { addEmailJob } from "@/lib/queue";
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
    .from(userTable)
    .where(eq(userTable.email, email));

  if (existingUser) {
    return c.json({ success: false, message: "Email already exists" }, 400);
  }

  const hashPassword = await argon2.hash(password);

  const [user] = await db
    .insert(userTable)
    .values({
      firstName,
      lastName,
      email,
      password: hashPassword,
    })
    .returning(userSelect);

  const otp = await generateOrReuseOTP(user.id, "activation");

  await addEmailJob(EMAILTASKS.SendActivationEmail, { email: user.email, otp });

  return c.json(
    {
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
    .from(userTable)
    .where(eq(userTable.email, email));
  if (!user) {
    return c.json({ message: "No active account found" }, 400);
  }
  const otp = await generateOrReuseOTP(user.id, "activation");

  await addEmailJob(EMAILTASKS.SendActivationEmail, { email: user.email, otp });

  return c.json(
    {
      message: "OTP resend successful",
    },
    200
  );
};

export const activation: AppRouteHandler<ActivationType> = async (c) => {
  const { email, otp } = c.req.valid("json");
  const [user] = await db
    .select(userSelect)
    .from(userTable)
    .where(eq(userTable.email, email));

  if (!user) {
    return c.json(
      {
        message: "Invalid OTP",
      },
      400
    );
  }

  const isValidOTP = await validateOTP(user.id, otp, "activation");

  if (!isValidOTP) {
    return c.json(
      {
        message: "Invalid or Expired OTP",
      },
      400
    );
  }

  await db
    .update(userTable)
    .set({ isActive: true, emailVerifiedAt: new Date() })
    .where(eq(userTable.id, user.id));

  await addEmailJob(EMAILTASKS.SendWelcomeEmail, {
    email: user.email,
    name: user.firstName,
  });

  await invalidateOTP(user.id, "activation");

  return c.json(
    {
      message: "Account activated successfully",
    },
    200
  );
};

export const login: AppRouteHandler<LoginType> = async (c) => {
  const { email, password } = c.req.valid("json");

  const [user] = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, email));

  if (!user || !(await argon2.verify(user.password, password))) {
    return c.json({ message: "Invalid email or password" }, 401);
  }

  if (!user.isActive) {
    return c.json(
      {
        message: "Account not active",
      },
      401
    );
  }

  if (!user.emailVerifiedAt) {
    const otp = await generateOrReuseOTP(user.id, "activation");

    await addEmailJob(EMAILTASKS.SendActivationEmail, {
      email: user.email,
      otp,
    });

    return c.json(
      {
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
      message: "Login successful",
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

    await addEmailJob(EMAILTASKS.SendPasswordResetEmail, {
      email: user.email,
      name: user.firstName,
      otp,
    });
  }

  return c.json({
    message: "Password reset mail sent",
  });
};

export const resetPasswordConfirm: AppRouteHandler<
  ResetPasswordConfirmType
> = async (c) => {
  const { email, otp, new_password } = c.req.valid("json");

  const user = await getUserByEmail(email);

  if (!user) {
    return c.json({ message: "Invalid or expired otp" }, 400);
  }

  const isValidOTP = await validateOTP(user.id, otp, "reset-password");

  if (!isValidOTP) {
    return c.json({ message: "Invalid or expired otp" }, 400);
  }

  const hashedPassword = await argon2.hash(new_password);

  await db
    .update(userTable)
    .set({ password: hashedPassword })
    .where(eq(userTable.id, user.id));

  await invalidateOTP(user.id, "reset-password");

  return c.json({ message: "Password reset successful" }, 200);
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
        message: "Token refresh successful",
        data: {
          access_token,
        },
      },
      200
    );
  } catch (e) {
    logger.error(e);
    return c.json({ message: "Unauthorized" }, 401);
  }
};

export const verifyToken: AppRouteHandler<VerifyTokenType> = async (c) => {
  return c.json({ message: "Token verification Successful" }, 200);
};
