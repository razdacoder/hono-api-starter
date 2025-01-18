import { createRouter } from "@/lib/create-app";

import * as handlers from "./auth.controllers";
import * as routes from "./auth.routes";

const router = createRouter()
  .openapi(routes.register, handlers.register)
  .openapi(routes.resendActivation, handlers.resendActivation)
  .openapi(routes.activation, handlers.activation)
  .openapi(routes.login, handlers.login)
  .openapi(routes.refreshToken, handlers.refreshToken)
  .openapi(routes.verifyToken, handlers.verifyToken)
  .openapi(routes.resetPassword, handlers.resetPassword)
  .openapi(routes.resetPasswordConfirm, handlers.resetPasswordConfirm);

export default router;
