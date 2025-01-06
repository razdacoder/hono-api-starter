import { OpenAPIHono } from "@hono/zod-openapi";
import { compress } from 'hono/compress';
import { cors } from 'hono/cors';
import { trimTrailingSlash } from 'hono/trailing-slash';

import type { AppBindings } from "@/lib/types.js";

import notFound from "@/middlewares/not-found.js";
import onError from "@/middlewares/on-error.js";
import { logger } from "@/middlewares/pino-logger.js";
import serveEmojiFavicon from "@/middlewares/serve-emoji-favicon.js";
import { tracing } from "@/middlewares/tracing.js";

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

  return app;
}
