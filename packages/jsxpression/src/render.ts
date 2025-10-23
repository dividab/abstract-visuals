import { compile } from "./compile/index.js";
import { evaluate, EvaluateOptions } from "./evaluate/evaluate.js";
import { parse } from "./parse/index.js";
import { Schema } from "./schema.js";
import { analyze, AnalysisError } from "./analyze/index.js";

/**
 * Configuration options for rendering JSX expressions.
 *
 * Extends EvaluateOptions with render-specific functionality, including control over
 * the minimum severity threshold that stops rendering.
 *
 * @template T - The return type of createElement function
 */
export interface RenderOptions<T = any> extends EvaluateOptions<T> {
  /**
   * Minimum severity level that counts as a failure: 1=info, 2=warning, 3=error.
   */
  minSeverity?: 1 | 2 | 3;
}

/**
 * Renders a JSX expression with data validation and security constraints.
 *
 * Parses JSX source code, validates it against a schema for security and type safety,
 * compiles it to executable code, and evaluates it with the provided data and components.
 *
 * @template T - The return type of the rendered JSX (e.g., ReactElement, VNode, string)
 * @param source - JSX expression source code to render (e.g., `"<Text x={data.user.name}>Hello</Text>"`)
 * @param schema - Schema defining allowed data properties, JSX elements, and hierarchy rules
 * @param options - Rendering configuration
 * @param options.data - Data object available as `data.*` in expressions
 * @param options.components - Map of component names to component functions
 * @param options.createElement - Function to create elements (e.g., React.createElement)
 * @param options.minSeverity - Minimum severity (1=info, 2=warning, 3=error) required to abort rendering; defaults to `3`
 * @returns The rendered JSX element of type T
 *
 * @throws {AnalysisError} When JSX contains security violations, invalid data access, or schema mismatches
 *
 * @example
 * ```typescript
 * const schema: Schema = {
 *   data: {
 *     user: { type: "object", shape: { name: { type: "string" } } }
 *   },
 *   elements: {
 *     Text: { props: { children: { type: "string" } } }
 *   }
 * };
 *
 * const result = render(
 *   "<Text>Hello {data.user.name}!</Text>",
 *   schema,
 *   {
 *     data: { user: { name: "World" } },
 *     components: { Text: ({ children }) => children },
 *     createElement: (type, props, ...children) => ({ type, props, children })
 *   }
 * );
 * ```
 */
export function render<T = any>(
  source: string,
  schema: Schema,
  { minSeverity = 3, ...options }: RenderOptions<T> = {}
): T {
  const ast = parse(source);
  const report = analyze(ast, schema);

  if (report.hasIssues(minSeverity)) {
    throw AnalysisError.fromReport(report);
  }

  return evaluate(compile(ast), schema, options) as T;
}
