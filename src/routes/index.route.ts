import { createRoute, z } from "@hono/zod-openapi";

import { createRouter } from "@/lib/create-app.js";

const router = createRouter().openapi(createRoute({
  method: "get",
  path: "/",
  responses: {
    200: {
      content: {
        "application/json": {
          schema: z.object({ message: z.string() }),
        },
      },
      description: "Hono API Starter Index",

    },
  },
}), (c) => {
  return c.json({ message: "Hono API Starter" }, 200);
});

export default router;
