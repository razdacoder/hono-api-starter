import { createRouter } from "@/lib/create-app.js";
import * as handlers from "./auth.handlers.js";
import * as routes from "./auth.routes.js";

const router = createRouter()
  .openapi(routes.register, handlers.register)
  .openapi(routes.resendActivation, handlers.resendActivation)
  .openapi(routes.activation, handlers.activation)
  .openapi(routes.login, handlers.login)
  .openapi(routes.resetPassword, handlers.resetPassword)

export default router;
