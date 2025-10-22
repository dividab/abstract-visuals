export function generateDataSchema(data: Record<string, unknown>): Record<string, any> {
  const schema: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    schema[key] = inferPropertySchema(value);
  }

  return schema;
}

function inferPropertySchema(value: unknown): any {
  if (value === null || value === undefined) {
    return {
      type: "string",
    };
  }

  if (typeof value === "string") {
    return {
      type: "string",
    };
  }

  if (typeof value === "number") {
    return {
      type: "number",
    };
  }

  if (typeof value === "boolean") {
    return {
      type: "boolean",
    };
  }

  if (typeof value === "function") {
    return {
      type: "function",
    };
  }

  if (Array.isArray(value)) {
    const itemSchema = value.length > 0 ? inferPropertySchema(value[0]) : { type: "string" };
    return {
      type: "array",
      shape: itemSchema,
    };
  }

  if (typeof value === "object") {
    const shape: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) {
      shape[k] = inferPropertySchema(v);
    }
    return {
      type: "object",
      shape,
    };
  }

  return { type: "string" };
}
