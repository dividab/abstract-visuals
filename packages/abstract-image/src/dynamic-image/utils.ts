import type { Schema } from "jsxpression";

type DataSchema = NonNullable<Schema["data"]>;

/** The JSON schema of data like the given, each value's schema inferred from it, an array's from its first item */
export function generateDataSchema(data: Record<string, unknown>): DataSchema {
  return { type: "object", properties: Object.fromEntries(Object.entries(data).map(([key, value]) => [key, inferSchema(value)])) };
}

function inferSchema(value: unknown): DataSchema {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return { type: typeof value as "string" | "number" | "boolean" };
  }
  if (Array.isArray(value)) {
    return { type: "array", items: value.length > 0 ? inferSchema(value[0]) : {} };
  }
  if (typeof value === "object" && value !== null) {
    return { type: "object", properties: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, inferSchema(v)])) };
  }
  // null, undefined and functions, which JSON schemas don't describe
  return {};
}
