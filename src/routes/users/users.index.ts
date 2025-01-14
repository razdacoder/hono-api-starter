import { createRouter } from "@/lib/create-app";
import * as routes from "@/routes/users/users.routes"
import * as handlers from "@/routes/users/users.handlers"

const router = createRouter().openapi(routes.me, handlers.me)

export default router