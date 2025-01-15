import { z } from "@hono/zod-openapi";

import type { ZodSchema } from "@/lib/types.js";

function createErrorSchema(schema?: ZodSchema) {
  if (schema) {
    const { error } = schema.safeParse(
      schema._def.typeName === z.ZodFirstPartyTypeKind.ZodArray ? [] : {},
    );
    return z.object({
      success: z.boolean().openapi({
        example: false,
      }),
      message: z.string(),
      error: z
        .object({
          issues: z.array(
            z.object({
              code: z.string(),
              path: z.array(z.union([z.string(), z.number()])),
              message: z.string().optional(),
            }),
          ),
          name: z.string(),
        })
        .openapi({
          example: error,
        }),
    });
  }
  return z.object({
    success: z.boolean().openapi({
      example: false,
    }),
    message: z.string(),
  });
}

export default createErrorSchema;
