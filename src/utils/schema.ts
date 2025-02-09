import { z } from "@hono/zod-openapi";
import { userSelectSchema } from "@/db/schema/users";

export const emailSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
});

export const emailOtpSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  otp: z.string().min(6).max(6),
});

export const loginRequestSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(8),
});

export const loginResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  user: userSelectSchema,
});

export const verifyEmailSchema = z.object({
  verify_email: z.boolean().optional(),
});

export const resetPasswordConfirmSchema = z
  .object({
    email: z.string().email(),
    otp: z.string().min(6).max(6),
    new_password: z.string().min(8),
    confirm_new_password: z.string().min(8),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    path: ["confirm_new_password"],
  });


export const accessTokenSchema = z.object({
    access_token: z.string(),
  })


export const refreshTokenSchema = z.object({
    refresh_token: z.string(),
  })

export const currentPasswordSchema = z.object({
    current_password: z.string().min(8),
  })

  export const changePasswordSchema = z
  .object({
    current_password: z.string().min(8),
    new_password: z.string().min(8),
    confirm_new_password: z.string().min(8),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    path: ["confirm_new_password"],
  })