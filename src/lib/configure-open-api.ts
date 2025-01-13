import { apiReference } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "./types.js";

import packageJSON from "../../package.json";

export default function configureOpenAPI(app: AppOpenAPI) {
  app.doc("/openapi-doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Hono API Starter",
    },
  });

  app.get(
    "/doc",
    apiReference({
      theme: "kepler",
      spec: {
        url: "/openapi-doc",
      },
      layout: "classic",
      defaultHttpClient: {
        targetKey: "javascript",
        clientKey: "axios",
      },
    }),
  );
}
