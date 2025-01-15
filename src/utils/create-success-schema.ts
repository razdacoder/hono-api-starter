import { z } from "@hono/zod-openapi";

import type { ZodSchema } from "@/lib/types.js";

export function createSuccessSchema(schema?: ZodSchema) {
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
}

export function createPaginatedSchema(dataSchema: ZodSchema) {
  // Define the pagination schema
  const paginationSchema = z.object({
    totalItems: z.number().int().nonnegative().openapi({
      example: 100,
    }),
    totalPages: z.number().int().positive().openapi({
      example: 10,
    }),
    currentPage: z.number().int().positive().openapi({
      example: 1,
    }),
    limit: z.number().int().positive().openapi({
      example: 10,
    }),
    nextPage: z.number().int().positive().nullable().openapi({
      example: 2,
    }),
    prevPage: z.number().int().positive().nullable().openapi({
      example: 2,
    }),
    hasPrevPage: z.boolean().openapi({ example: true }),
    hasNextPage: z.boolean().openapi({ example: true }),
  });

  // Return the success schema with data and pagination
  return z.object({
    success: z
      .boolean()
      .openapi({
        example: true,
      })
      .default(true),
    message: z.string(),
    data: z.object({
      items: z.array(dataSchema), // Array of items of the given schema
      pagination: paginationSchema,
    }),
  });
}
