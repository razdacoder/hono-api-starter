import { createRoute, z } from "@hono/zod-openapi";

import { userSelectSchema, userUpdateSchema } from "@/db/schema/users";
import { authCheck } from "@/middlewares/auth";
import { isAdminCheck } from "@/middlewares/is-admin";
import createErrorSchema from "@/utils/create-error-schema";
import IdUUIDParamsSchema from "@/utils/id-uuid-param";
import {
  createSuccessSchema,
  createPaginatedSchema,
} from "@/utils/create-success-schema";
import * as HttpStatusCodes from "@/utils/http-status-code";
import jsonContent from "@/utils/json-content";
import jsonContentRequired from "@/utils/json-content-required";

const tags = ["Users"];

export const me = createRoute({
  path: "/me",
  method: "get",
  tags,
  middleware: [authCheck] as const,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(userSelectSchema),
      "The current logged in user"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Unauthorized user errorrs"
    ),
  },
  security: [
    {
      Bearer: [],
    },
  ],
});

export const list = createRoute({
  path: "/",
  method: "get",
  tags,
  middleware: [authCheck, isAdminCheck] as const,
  request: {
    query: z.object({
      page: z.coerce.number().default(1),
      limit: z.coerce.number().default(10),
    }),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createPaginatedSchema(userSelectSchema),
      "List of users"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Unauthorized"
    ),
  },
  security: [
    {
      Bearer: [],
    },
  ],
});

export const getUser = createRoute({
  path: "/{id}",
  method: "get",
  tags,
  middleware: [authCheck, isAdminCheck] as const,
  request: {
    params: IdUUIDParamsSchema,
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(userSelectSchema),
      "Get user successfull"
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createErrorSchema(),
      "User not found error"
    ),
  },
  security: [
    {
      Bearer: [],
    },
  ],
});

export const updateCurrentUser = createRoute({
  path: "/me",
  method: "patch",
  tags,
  middleware: [authCheck] as const,
  request: {
    body: jsonContentRequired(userUpdateSchema, "Update user request body"),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(userSelectSchema),
      "User update successfull"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(userUpdateSchema),
      "User update validation errors"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Unauthorized"
    ),
  },
  security: [
    {
      Bearer: [],
    },
  ],
});

export const deleteCurrentUser = createRoute({
  path: "/me",
  method: "delete",
  tags,
  middleware: [authCheck] as const,
  request: {
    body: jsonContentRequired(
      z.object({
        current_password: z.string().min(8),
      }),
      "Delete user request body"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "User deletion sucessfull"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(
        z.object({
          current_password: z.string().min(8),
        })
      ),
      "Validation errors"
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createErrorSchema(),
      "Invalid password"
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Unauthorized"
    ),
  },
  security: [{ Bearer: [] }],
});

export const changeUserPassword = createRoute({
  path: "/change-password",
  method: "post",
  tags,
  middleware: [authCheck] as const,
  request: {
    body: jsonContentRequired(
      z
        .object({
          current_password: z.string().min(8),
          new_password: z.string().min(8),
          confirm_new_password: z.string().min(8),
        })
        .refine((data) => data.new_password === data.confirm_new_password, {
          path: ["confirm_new_password"],
        }),
      "Change password request body"
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "Password changed sucessfully"
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      z
        .object({
          current_password: z.string().min(8),
          new_password: z.string().min(8),
          confirm_new_password: z.string().min(8),
        })
        .refine((data) => data.new_password === data.confirm_new_password, {
          path: ["confirm_new_password"],
        }),
        "Validation errors"
    ),
  },
  security: [{ Bearer: [] }],
});
export type Me = typeof me;
export type List = typeof list;
export type GetUser = typeof getUser;
export type UpdateCurrentUser = typeof updateCurrentUser;
export type DeleteCurrentUser = typeof deleteCurrentUser;
