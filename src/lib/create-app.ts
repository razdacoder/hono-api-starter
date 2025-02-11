import { OpenAPIHono } from "@hono/zod-openapi";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { trimTrailingSlash } from "hono/trailing-slash";

import type { AppBindings } from "@/lib/types";

import notFound from "@/middlewares/not-found";
import onError from "@/middlewares/on-error";
import { logger } from "@/middlewares/pino-logger";
import serveEmojiFavicon from "@/middlewares/serve-emoji-favicon";
import { tracing } from "@/middlewares/tracing";

export function createRouter() {
  return new OpenAPIHono<AppBindings>({ strict: false });
}

export default function createApp() {
  const app = createRouter();

  app.use(serveEmojiFavicon("🔥"));
  app.use(logger());
  app.use(cors());
  app.use(tracing);
  app.use(compress());
  app.use(trimTrailingSlash());

  app.notFound(notFound);
  app.onError(onError);

  // const emailtasker = createEmailTasker();
  // const emailWorker = emailtasker.setup();

  // emailWorker.on("ready", () => {
  //   // eslint-disable-next-line no-console
  //   console.log("Worker is ready and listening for jobs!");
  // });

  return app;
}
