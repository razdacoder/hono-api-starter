import type { ZodSchema } from "@/lib/types.js";

function jsonContent<
  T extends ZodSchema,
>(schema: T, description: string) {
  return {
    content: {
      "application/json": {
        schema,
      },
    },
    description,
  };
}

export default jsonContent;
