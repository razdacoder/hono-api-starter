import { createRoute, z } from "@hono/zod-openapi";

import { userSelectSchema } from "@/db/schema/users";
import { authCheck } from "@/middlewares/auth";
import { isAdminCheck } from "@/middlewares/is-admin";
import createErrorSchema from "@/utils/create-error-schema";
import {
  createSuccessSchema,
  createPaginatedSchema,
} from "@/utils/create-success-schema";
import * as HttpStatusCodes from "@/utils/http-status-code";
import jsonContent from "@/utils/json-content";

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

export type Me = typeof me;
export type List = typeof list;
