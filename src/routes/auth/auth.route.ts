import { createRoute } from "@hono/zod-openapi"
import * as HttpStatusCodes from "@/utils/http-status-code.js";
import jsonContent from "@/utils/jsonContent.js";
import { userInsertSchema } from "@/db/schema/users.js";


const tags = ["Auth"]

export const register = createRoute({
    path: "/register",
    tags,
    method: "post",
    responses: {
        [HttpStatusCodes.CREATED]: jsonContent(userInsertSchema, "This route is for user registration")
    }
})