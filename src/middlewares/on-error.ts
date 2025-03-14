import type { ErrorHandler } from "hono";
import type { StatusCode } from "hono/utils/http-status";

import env from "@/env";
import { INTERNAL_SERVER_ERROR, OK } from "@/utils/http-status-code";

const onError: ErrorHandler = (err, c) => {
  const currentStatus
    = "status" in err ? err.status : c.newResponse(null).status;
  const statusCode
    = currentStatus !== OK
      ? (currentStatus as StatusCode)
      : INTERNAL_SERVER_ERROR;
  const environ = env.NODE_ENV;
  return c.json(
    {
      success: false,
      message: err.message,
      stack: environ === "production" ? undefined : err.stack,
    },
    statusCode,
  );
};

export default onError;
