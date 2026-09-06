import type { Program } from "acorn";
import type { Schema } from "../../schema.js";
import { createAnalysisReport, type AnalysisReport } from "../analysis-report.js";
import { createValidationContext } from "../validation-context.js";
import { analyzeDataAccess } from "./data-access.js";
import { analyzeMethodCalls } from "./method-calls.js";

export function analyzeData(ast: Program, schema: Schema): AnalysisReport {
  const validationContext = createValidationContext();

  return createAnalysisReport().merge(analyzeMethodCalls(ast, schema, validationContext), analyzeDataAccess(ast, schema, validationContext));
}
