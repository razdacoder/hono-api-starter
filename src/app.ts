import configureOpenAPI from "@/lib/configure-open-api.js";
import createApp from "@/lib/create-app.js";
import auth from "@/routes/auth/auth.index.js"

const app = createApp();
const routes = [
  auth
];
configureOpenAPI(app);

routes.forEach((route) => {
  app.route("/", route);
});
export default app;
