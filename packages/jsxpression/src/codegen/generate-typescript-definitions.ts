import { Schema } from "../schema.js";
import { declareBuiltinTypes } from "./builtins/index.js";
import { declareComponentTypes, declareDataTypes } from "./schema/index.js";

/**
 * Generates TypeScript definitions from a JSXExpression schema.
 *
 * The generated definitions enable code editors to provide:
 * - IntelliSense autocomplete for components and data properties
 * - Type checking for JSX expressions
 * - Hover documentation from schema descriptions
 *
 * @param schema - Schema defining allowed data properties, JSX elements, and their types
 * @returns Complete TypeScript definition file as a string
 *
 * @example
 * ```typescript
 * const schema = {
 *   elements: {
 *     Button: {
 *       props: { size: { type: "string", enum: ["sm", "md", "lg"] } }
 *     }
 *   },
 *   data: {
 *     user: { type: "object", shape: { name: { type: "string" } } }
 *   }
 * };
 *
 * const definitions = generateTypeScriptDefinitions(schema);
 * // Use with Monaco, VS Code, or any TypeScript-enabled editor
 * ```
 */
export function generateTypeScriptDefinitions(schema: Schema): string {
  return [declareBuiltinTypes(), declareComponentTypes(schema), declareDataTypes(schema)].join("\n");
}
