import { createRoute, z } from "@hono/zod-openapi";
import * as HttpStatusCodes from "@/utils/http-status-code";
import jsonContent from "@/utils/jsonContent.js";
import createErrorSchema from "@/utils/create-error-schema";
import { createSuccessSchema } from "@/utils/create-success-schema";
import { userSelectSchema } from "@/db/schema/users";
import { authCheck } from "@/middlewares/auth";

const tags = ["Users"];

export const me = createRoute({
  path: "/users/me",
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

export type Me = typeof me;
