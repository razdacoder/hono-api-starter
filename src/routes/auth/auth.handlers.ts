import type { AppRouteHandler, SuccessResponse } from "@/lib/types.js";
import type { RegisterRoute } from "./auth.routes.js";
import { db } from "@/db/index.js";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema/users.js";
import argon2 from 'argon2';
import { userSelect } from "@/services/users.js";



export const register: AppRouteHandler<RegisterRoute> = async (c) => {
    const {firstName, lastName, email, password} = c.req.valid("json")

    const existingUser = await db.select().from(users).where(eq(users.email, email))

    if (existingUser) {
      return c.json({success: false, message: "Email already exists"}, 400)
    }

    const hashPassword = await argon2.hash(password)

    const [user] = await db.insert(users).values({
      firstName,
      lastName,
      email,
      password: hashPassword
    }).returning(userSelect);


    return c.json(
      {
        success: true,
        message: "User created Successfully",
        data: user
      },
      201,
    )
};