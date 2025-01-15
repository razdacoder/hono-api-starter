import configureOpenAPI from "@/lib/configure-open-api";
import createApp from "@/lib/create-app";
import auth from "@/routes/auth/auth.index";
import users from "@/routes/users/users.index";

const app = createApp();
configureOpenAPI(app);

app.route("/auth", auth);
app.route("/users", users);

export default app;
