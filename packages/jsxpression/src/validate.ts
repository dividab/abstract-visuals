import { analyze, AnalysisError } from "./analyze/index.js";
import { parse, ParseError } from "./parse/index.js";
import { Schema } from "./schema.js";

export type ValidateResult = { ok: true } | { ok: false; error: AnalysisError | ParseError };

export interface ValidateOptions {
  /**
   * Minimum severity level that counts as a failure: 1=info, 2=warning, 3=error.
   */
  minSeverity?: 1 | 2 | 3;
}
/**
 * Validates JSX expression syntax and schema compliance without execution.
 *
 * Performs static analysis to check if JSX source code is valid according to the schema.
 * This includes syntax validation, security constraints, JSX element/attribute validation,
 * and data access pattern validation - all without needing actual data or components.
 *
 * This function parses the source code and returns a simple ok/error result.
 *
 * @param source - JSX expression source code to validate
 * @param schema - Schema defining allowed data properties, JSX elements, and hierarchy rules
 * @returns Validation result indicating success or failure with parse or analysis error
 *
 * @example
 * ```typescript
 * const result = validate("<Text>{data.user.name}</Text>", schema);
 * if (result.ok) {
 *   console.log("JSX is valid!");
 * } else {
 *   console.error("Validation failed with", result.report.errors.length, "errors");
 *   result.report.errors.forEach(err => console.error(err.message));
 * }
 * ```
 */
export function validate(
  source: string,
  schema: Schema,

  { minSeverity = 3 }: ValidateOptions = {}
): ValidateResult {
  try {
    const ast = parse(source);
    const report = analyze(ast, schema);

    if (report.hasIssues(minSeverity)) {
      return { ok: false, error: AnalysisError.fromReport(report) };
    }

    return { ok: true };
  } catch (error: unknown) {
    if (error instanceof ParseError) {
      return { ok: false, error };
    }

    throw error;
  }
}
