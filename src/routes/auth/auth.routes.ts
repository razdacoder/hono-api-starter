import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/utils/http-status-code.js";
import jsonContent from "@/utils/jsonContent.js";
import { userInsertSchema, userSelectSchema } from "@/db/schema/users.js";
import jsonContentRequired from "@/utils/jsonContentRequired.js";
import createErrorSchema from "@/utils/create-error-schema.js";
import { createSuccessSchema } from "@/utils/create-success-schema";
import { authCheck } from "@/middlewares/auth";

const tags = ["Auth"];

export const register = createRoute({
  path: "/auth/register",
  tags,
  method: "post",
  request: {
    body: jsonContentRequired(userInsertSchema, "The user to create"),
  },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(
      createSuccessSchema(userSelectSchema),
      "The user created"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(userInsertSchema),
      "User creation validation errors"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "User already exists error"
    ),
  },
});

export const resendActivation = createRoute({
  path: "/auth/resend-activation",
  tags,
  method: "post",
  request: {
    body: jsonContentRequired(
      z.object({
        email: z.string().email(),
      }),
      "Resend activation request body"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "The user created"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(
        z.object({
          email: z.string().email({ message: "Invalid email address" }),
        })
      ),
      "Validation Errors"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
     createErrorSchema(),
      "No user found"
    ),
  },
});

export const activation = createRoute({
  path: "/auth/activation",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        email: z.string().email({ message: "Invalid email address" }),
        otp: z.string().min(6).max(6),
      }),
      "Activation request body"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "Account activation sucessfull"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createErrorSchema(),
      "Activation Invalid OTP"
    ),
  },
});

export const login = createRoute({
  path: "/auth/login",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
      }),
      "Request body for login"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(
        z.object({
          access_token: z.string(),
          refresh_token: z.string(),
          user: userSelectSchema,
        })
      ),
      "Login sucessfull response"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(
        z.object({
          email: z.string().email(),
          password: z.string().min(8),
        })
      ),
      "Validation errors for login"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(createErrorSchema(z.object({
      verify_email: z.boolean().optional()
    })), "Invalid Credentials Error"),
  },
});


export const resetPassword = createRoute({
  path: "/auth/reset-password",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        email: z.string().email(),
      }),
      "Password reset request body"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "Password reset request sucessfull"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(
        z.object({
          email: z.string().email(),
        })
      ), "Password reset validation errors"
    ),
  },
});

export const resetPasswordConfirm = createRoute({
  path: "/auth/reset-password-confirm",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      z
        .object({
          email: z.string().email(),
          otp: z.string().min(6).max(6),
          new_password: z.string().min(8),
          confirm_new_password: z.string().min(8),
        })
        .refine((data) => data.new_password === data.confirm_new_password, {
          path: ["confirm_new_password"],
        }),
      "Reset Password Confirm Request Body"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "Password reset sucessfull"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(
        z
          .object({
            email: z.string().email(),
            otp: z.string().min(6).max(6),
            new_password: z.string().min(8),
            confirm_new_password: z.string().min(8),
          })
          .refine((data) => data.new_password === data.confirm_new_password, {
            path: ["confirm_new_password"],
          })
      ), "Password reset validation errors"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(createErrorSchema(), "Bad request errors")
  },
});

export const refreshToken = createRoute({
  path: "/auth/refresh-token",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      z.object({
        refresh_token: z.string(),
      }),
      "Refresh token request body"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(
        z.object({
          access_token: z.string(),
        })
      ),
      "Refresh token successfull"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      z.object({
        refresh_token: z.string(),
      }), "Refresh token validation errors"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(createErrorSchema(), "Unauthoried error")
  },
});

export const verifyToken = createRoute({
  path: "/auth/verify-token",
  method: "get",
  tags,
  middleware: [authCheck] as const,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "Verification successfull"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Verifivation failed"
    ),
  },
  security: [
    {
      Bearer: [],
    },
  ],
});


export type RegisterRoute = typeof register;
export type ResendActivationType = typeof resendActivation;
export type ActivationType = typeof activation;
export type LoginType = typeof login
export type ResetPasswordType = typeof resetPassword
export type ResetPasswordConfirmType = typeof resetPasswordConfirm
export type RefreshTokenType = typeof refreshToken
export type VerifyTokenType = typeof verifyToken