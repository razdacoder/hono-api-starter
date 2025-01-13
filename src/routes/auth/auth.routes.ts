import { createRoute, z } from "@hono/zod-openapi"
import * as HttpStatusCodes from "@/utils/http-status-code.js";
import jsonContent from "@/utils/jsonContent.js";
import { userInsertSchema, userSelectSchema } from "@/db/schema/users.js";
import jsonContentRequired from "@/utils/jsonContentRequired.js";
import createErrorSchema from "@/utils/create-error-schema.js";
import { createSuccessSchema } from "@/utils/create-success-schema.js";


const tags = ["Auth"]

export const register = createRoute({
    path: "/register",
    tags,
    method: "post",
    request: {
        body: jsonContentRequired(userInsertSchema, "The user to create")
    },
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(createSuccessSchema(userSelectSchema), "The user created"),
        [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(createErrorSchema(userInsertSchema), "User creation validation errors"),
        [HttpStatusCodes.BAD_REQUEST]: jsonContent(z.object({
            success: z.boolean().default(false),
            message: z.string()
        }), "User already exists error")
       
    }
})


export type RegisterRoute = typeof register;
