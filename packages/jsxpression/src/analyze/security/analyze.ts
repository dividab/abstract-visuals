import type { Program } from "acorn";
import type { Schema } from "../../schema.js";
import { createAnalysisReport, type AnalysisReport } from "../analysis-report.js";
import { createValidationContext } from "../validation-context.js";
import { analyzeCallExpressions } from "./call-expressions.js";
import { analyzeDeclarations } from "./declarations.js";
import { analyzeExpressions } from "./expressions.js";
// import { analyzeIdentifiers } from "./identifiers.js";

export function analyzeSecurity(ast: Program, schema: Schema): AnalysisReport {
  const validationContext = createValidationContext();

  return createAnalysisReport().merge(
    analyzeDeclarations(ast, schema, validationContext),
    // analyzeIdentifiers(ast, schema, validationContext),
    analyzeExpressions(ast, schema, validationContext),
    analyzeCallExpressions(ast, schema, validationContext)
  );
}
