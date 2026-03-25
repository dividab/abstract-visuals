import { Program } from "acorn";
import { Schema } from "../../schema.js";
import { AnalysisReport } from "../analysis-report.js";
import { ValidationContext } from "../validation-context.js";
import { analyzeCallExpressions } from "./call-expressions.js";
import { analyzeDeclarations } from "./declarations.js";
import { analyzeExpressions } from "./expressions.js";
import { analyzeIdentifiers } from "./identifiers.js";
import { analyzeMemberAccess } from "./member-access.js";

export function analyzeSecurity(ast: Program, schema: Schema): AnalysisReport {
  const validationContext = new ValidationContext();

  return new AnalysisReport().merge(
    analyzeDeclarations(ast, schema, validationContext),
    analyzeIdentifiers(ast, schema, validationContext),
    analyzeExpressions(ast, schema, validationContext),
    analyzeMemberAccess(ast, schema, validationContext),
    analyzeCallExpressions(ast, schema, validationContext)
  );
}
