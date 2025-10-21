import { Program } from "acorn";
import { Schema } from "../../schema.js";
import { AnalysisReport } from "../analysis-report.js";
import { ValidationContext } from "../validation-context.js";
import { analyzeDataAccess } from "./data-access.js";
import { analyzeMethodCalls } from "./method-calls.js";

export function analyzeData(ast: Program, schema: Schema): AnalysisReport {
  const validationContext = new ValidationContext();

  return new AnalysisReport().merge(
    analyzeMethodCalls(ast, schema, validationContext),
    analyzeDataAccess(ast, schema, validationContext)
  );
}
