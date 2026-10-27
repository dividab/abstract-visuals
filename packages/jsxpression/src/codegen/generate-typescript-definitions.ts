import type { Schema } from "../schema.js";
import { declareBuiltinTypes } from "./builtins/index.js";
import { declareComponentTypes, declareDataTypes, declareFunctionTypes, declareRecursiveTypes, recursiveSchemaNames } from "./schema/index.js";

/**
 * Generates TypeScript definitions from a JSXExpression schema.
 *
 * The generated definitions enable code editors to provide:
 *
 * - IntelliSense autocomplete for components and data properties
 * - Type checking for JSX expressions
 * - Hover documentation from schema descriptions
 *
 * @example
 *   ```typescript
 *   const schema = {
 *     elements: {
 *       Button: {
 *         props: { size: { type: "string", enum: ["sm", "md", "lg"] } },
 *       },
 *     },
 *     data: {
 *       user: { type: "object", shape: { name: { type: "string" } } },
 *     },
 *   };
 *
 *   const definitions = generateTypeScriptDefinitions(schema);
 *   // Use with Monaco, VS Code, or any TypeScript-enabled editor
 *   ```;
 *
 * @param schema - Schema defining allowed data properties, JSX elements, and their types
 * @returns Complete TypeScript definition file as a string
 */
export function generateTypeScriptDefinitions(schema: Schema): string {
  const names = recursiveSchemaNames([
    ...Object.values(schema.data ?? {}),
    ...Object.values(schema.elements ?? {}).flatMap((element) => Object.values(element.props ?? {})),
    ...Object.values(schema.functions ?? {}).flatMap((func) => [...(func.args ?? []).map((arg) => arg.property), func.ret]),
  ]);
  return [
    declareBuiltinTypes(),
    ...(Object.keys(names).length > 0 ? [declareRecursiveTypes(names)] : []),
    declareComponentTypes(schema, names),
    declareDataTypes(schema, names),
    declareFunctionTypes(schema, names),
  ].join("\n");
}
