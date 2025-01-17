import { apiReference } from "@scalar/hono-api-reference";

import type { AppOpenAPI } from "./types";

import packageJSON from "../../package.json";

export default function configureOpenAPI(app: AppOpenAPI) {
  app.openAPIRegistry.registerComponent("securitySchemes", "Bearer", {
    type: "http",
    scheme: "bearer",
  });

  app.doc("/openapi-doc", {
    openapi: "3.0.0",
    info: {
      version: packageJSON.version,
      title: "Hono API Starter",
    },
  });

  app.get(
    "/",
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
      hiddenClients: [
        "libcurl",
        "clj_http",
        "httpclient",
        "restsharp",
        "native",
        "http1.1",
        "asynchttp",
        "nethttp",
        "okhttp",
        "unirest",
        "xhr",
        "jquery",
        "okhttp",
        "native",
        "request",
        "unirest",
        "nsurlsession",
        "cohttp",
        "curl",
        "guzzle",
        "http1",
        "http2",
        "webrequest",
        "restmethod",
        "python3",
        "requests",
        "httr",
        "native",
        "curl",
        "httpie",
        "wget",
        "nsurlsession",
        "undici",
        "ofetch",
      ],
    }),
  );
}
