import type { PinoLogger } from "hono-pino";

import { OpenAPIHono } from "@hono/zod-openapi";

import notFound from "./middlewares/not-found.js";
import onError from "./middlewares/on-error.js";
import { logger } from "./middlewares/pino-logger.js";
import serveEmojiFavicon from "./middlewares/serve-emoji-favicon.js";

interface AppBindings {
  Variables: {
    logger: PinoLogger;
  };
}

const app = new OpenAPIHono<AppBindings>();

app.use(serveEmojiFavicon("🔥"));
app.use(logger());

app.get("/", (c) => {
  c.var.logger.info("Wow");
  return c.text("Hello Hono!");
});

app.notFound(notFound);
app.onError(onError);

export default app;
