import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/utils/http-status-code.js";
import jsonContent from "@/utils/jsonContent.js";
import { userInsertSchema, userSelectSchema } from "@/db/schema/users.js";
import jsonContentRequired from "@/utils/jsonContentRequired.js";
import createErrorSchema from "@/utils/create-error-schema.js";
import { createSuccessSchema } from "@/utils/create-success-schema";

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
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "User already exists error"
    ),
  },
});

export const resendActivation = createRoute({
  path: "/resend-activation",
  tags,
  method: "post",
  request: {
    body: jsonContentRequired(
      z.object({
        email: z.string().email({ message: "Invalid email address" }),
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
      z.object({
        success: z.boolean().default(false),
        message: z.string(),
      }),
      "No user found"
    ),
  },
});

export const activation = createRoute({
  path: "/activation",
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
    [HttpStatusCodes.BAD_REQUEST]: 
      jsonContent(
        z.object({
          success: z.boolean().default(false),
          message: z.string(),
        }),
        "Activation Invalid OTP"
      ),
    
  },
});
export type RegisterRoute = typeof register;
export type ResendActivationType = typeof resendActivation;
export type ActivationType = typeof activation
