import { createRouter } from "@/lib/create-app";
import * as handlers from "@/modules/users/users.controllers";
import * as routes from "@/modules/users/users.routes";

const router = createRouter()
  .openapi(routes.list, handlers.list)
  .openapi(routes.me, handlers.me)
  .openapi(routes.getUser, handlers.getUser)
  .openapi(routes.updateCurrentUser, handlers.updateCurrentUser)
  .openapi(routes.deleteCurrentUser, handlers.deleteCurrentUser)
  .openapi(routes.changeUserPassword, handlers.changeUserPassword);

export default router;
