import type { Schema } from "../schema.js";
import { declareBuiltinTypes } from "./builtins/index.js";
import { declareComponentTypes, declareDataTypes, declareFunctionTypes, definitionNames } from "./schema/index.js";

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
 *         props: { type: "object", properties: { size: { type: "string", enum: ["sm", "md", "lg"] } } },
 *       },
 *     },
 *     data: {
 *       type: "object",
 *       properties: { user: { type: "object", properties: { name: { type: "string" } } } },
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
  const names = definitionNames(schema.data);
  return [declareBuiltinTypes(), declareComponentTypes(schema), declareDataTypes(schema, names), declareFunctionTypes(schema, names)].join("\n");
}
