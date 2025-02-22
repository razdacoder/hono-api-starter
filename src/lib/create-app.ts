import { OpenAPIHono } from "@hono/zod-openapi";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";

import type { AppBindings } from "@/lib/types";

import { logger } from "@/lib/logger";
import notFound from "@/middlewares/not-found";
import onError from "@/middlewares/on-error";
import { logger as loggerMiddleware } from "@/middlewares/pino-logger";
import serveEmojiFavicon from "@/middlewares/serve-emoji-favicon";
import { tracing } from "@/middlewares/tracing";
import { createEmailTasker } from "@/tasks/emails";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({ strict: false });
}

export default function createApp() {
  const app = createRouter();

  app.use(serveEmojiFavicon("🔥"));
  app.use(loggerMiddleware());
  app.use(cors());
  app.use(tracing);
  app.use(compress());
  app.use(trimTrailingSlash());

  app.notFound(notFound);
  app.onError(onError);

  const emailtasker = createEmailTasker();
  const emailWorker = emailtasker.setup();

  emailWorker.on("ready", () => {
    logger.info("Worker has started");
  });

  return app;
}
