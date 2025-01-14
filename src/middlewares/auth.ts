import { jwt } from "hono/jwt";
import env from "@/env";

export const authCheck = jwt({ secret: env.SECRET_KEY });
