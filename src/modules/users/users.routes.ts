import { createRoute, z } from "@hono/zod-openapi";

import { userSelectSchema, userUpdateSchema } from "@/db/schema/users";
import { authCheck } from "@/middlewares/auth";
import { isAdminCheck } from "@/middlewares/is-admin";
import {
  createErrorSchema,
  createPaginatedSchema,
  createSuccessSchema,
} from "@/utils/create-response-schema";
import * as HttpStatusCodes from "@/utils/http-status-code";
import IdUUIDParamsSchema from "@/utils/id-uuid-param";
import { jsonContent, jsonContentRequired } from "@/utils/json-content";
import { changePasswordSchema, currentPasswordSchema } from "@/utils/schema";

const tags = ["Users"];

export const me = createRoute({
  path: "/me",
  method: "get",
  tags,
  middleware: [authCheck] as const,
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(userSelectSchema),
      "The current logged in user",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Unauthorized user errorrs",
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
      "List of users",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Unauthorized",
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
      "Get user successfull",
    ),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(
      createErrorSchema(),
      "User not found error",
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
      "User update successfull",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(userUpdateSchema),
      "User update validation errors",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Unauthorized",
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
      currentPasswordSchema,
      "Delete user request body",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "User deletion sucessfull",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      createErrorSchema(currentPasswordSchema),
      "Validation errors",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createErrorSchema(),
      "Invalid password",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Unauthorized",
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
      changePasswordSchema,
      "Change password request body",
    ),
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(
      createSuccessSchema(),
      "Password changed sucessfully",
    ),
    [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(
      changePasswordSchema,
      "Validation errors",
    ),
    [HttpStatusCodes.BAD_REQUEST]: jsonContent(
      createErrorSchema(),
      "Invalid Password Error",
    ),
    [HttpStatusCodes.UNAUTHORIZED]: jsonContent(
      createErrorSchema(),
      "Unauthorized",
    ),
  },
  security: [{ Bearer: [] }],
});
export type Me = typeof me;
export type List = typeof list;
export type GetUser = typeof getUser;
export type UpdateCurrentUser = typeof updateCurrentUser;
export type DeleteCurrentUser = typeof deleteCurrentUser;
export type ChangeUserPassword = typeof changeUserPassword;
