import type {
  OpenAPIHono,
  z,
  RouteConfig,
  RouteHandler,
} from "@hono/zod-openapi";
import type { PinoLogger } from "hono-pino";
import type { JwtVariables } from "hono/jwt";
import { userSelectSchema } from "@/db/schema/users";

export interface AppBindings {
  Variables: {
    logger: PinoLogger;
    jwt: JwtVariables;
    user: z.infer<typeof userSelectSchema>
  };
}

export type AppOpenAPI = OpenAPIHono<AppBindings>;

export type AppRouteHandler<R extends RouteConfig> = RouteHandler<
  R,
  AppBindings
>;
// eslint-disable-next-line ts/ban-ts-comment
// @ts-expect-error
export type ZodSchema =
  | z.ZodUnion
  | z.AnyZodObject
  | z.ZodArray<z.AnyZodObject>;
