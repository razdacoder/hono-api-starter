import { serve } from "@hono/node-server";

import app from "./app";
import env from "./env";
import { logger } from "./lib/logger";

const port = env.PORT || 3000;
logger.info(`Server Started and listening on port http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});
