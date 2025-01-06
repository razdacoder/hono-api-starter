

import type { ZodSchema } from "@/lib/types.js";
import jsonContent from "./jsonContent.js";


const jsonContentRequired = <
  T extends ZodSchema,
>(schema: T,
  description: string,
) => {
  return {
    ...jsonContent(schema, description),
    required: true,
  };
};

export default jsonContentRequired;