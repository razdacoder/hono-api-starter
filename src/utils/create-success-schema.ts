import type { ZodSchema } from "@/lib/types.js";
import { z } from "@hono/zod-openapi";

export const createSuccessSchema = (schema?: ZodSchema) => {
  if (schema) {
    return z.object({
      success: z
        .boolean()
        .openapi({
          example: true,
        })
        .default(true),
      message: z.string(),
      data: schema,
    });
  }
  return z.object({
    success: z
      .boolean()
      .openapi({
        example: true,
      })
      .default(true),
    message: z.string(),
  });
};
