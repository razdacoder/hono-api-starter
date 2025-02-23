import { createRoute } from "@hono/zod-openapi";

import { userInsertSchema, userSelectSchema } from "@/db/schema/users";
import { authCheck } from "@/middlewares/auth";
import {
  createErrorSchema,
  createSuccessSchema,
} from "@/utils/create-response-schema";
import * as HttpStatusCodes from "@/utils/http-status-code";
import { jsonContent, jsonContentRequired } from "@/utils/json-content";
import {
  accessTokenSchema,
  emailOtpSchema,
  emailSchema,
  loginRequestSchema,
  loginResponseSchema,
  refreshTokenSchema,
  resetPasswordConfirmSchema,
  verifyEmailSchema,
} from "@/utils/schema";

const tags = ["Auth"];

export const register = createRoute({
  path: "/register",
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
      createErrorSchema(),
      "User already exists error"
    ),
  },
});

export const resendActivation = createRoute({
  path: "/resend-activation",
  tags,
  method: "post",
  request: {
    body: jsonContentRequired(emailSchema, "Resend activation request body"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "The user created"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(emailSchema),
      "Validation Errors"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createErrorSchema(),
      "No user found"
    ),
  },
});

export const activation = createRoute({
  path: "/activation",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(emailOtpSchema, "Activation request body"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "Account activation successful"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(emailOtpSchema),
      "Validation errors"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createErrorSchema(),
      "Activation Invalid OTP"
    ),
  },
});

export const login = createRoute({
  path: "/login",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(loginRequestSchema, "Request body for login"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(loginResponseSchema),
      "Login sucessfull response"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(loginRequestSchema),
      "Validation errors for login"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(verifyEmailSchema),
      "Invalid Credentials Error"
    ),
  },
});

export const resetPassword = createRoute({
  path: "/reset-password",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(emailSchema, "Password reset request body"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "Password reset request sucessfull"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(emailSchema),
      "Password reset validation errors"
    ),
  },
});

export const resetPasswordConfirm = createRoute({
  path: "/reset-password-confirm",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(
      resetPasswordConfirmSchema,
      "Reset Password Confirm Request Body"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "Password reset sucessfull"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(resetPasswordConfirmSchema),
      "Password reset validation errors"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createErrorSchema(),
      "Bad request errors"
    ),
  },
});

export const refreshToken = createRoute({
  path: "/refresh-token",
  method: "post",
  tags,
  request: {
    body: jsonContentRequired(refreshTokenSchema, "Refresh token request body"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(accessTokenSchema),
      "Refresh token successfull"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      refreshTokenSchema,
      "Refresh token validation errors"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Unauthoried error"
    ),
  },
});

export const verifyToken = createRoute({
  path: "/verify-token",
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
export type LoginType = typeof login;
export type ResetPasswordType = typeof resetPassword;
export type ResetPasswordConfirmType = typeof resetPasswordConfirm;
export type RefreshTokenType = typeof refreshToken;
export type VerifyTokenType = typeof verifyToken;
