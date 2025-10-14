import { Program } from "acorn";
import { Schema } from "../../schema";
import { AnalysisReport } from "../analysis-report";
import { ValidationContext } from "../validation-context";
import { analyzeCallExpressions } from "./call-expressions";
import { analyzeDeclarations } from "./declarations";
import { analyzeExpressions } from "./expressions";
import { analyzeIdentifiers } from "./identifiers";
import { analyzeMemberAccess } from "./member-access";

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
