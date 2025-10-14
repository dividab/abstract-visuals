import { Program } from "acorn";
import { Schema } from "../../schema";
import { AnalysisReport } from "../analysis-report";
import { ValidationContext } from "../validation-context";
import { analyzeDataAccess } from "./data-access";
import { analyzeMethodCalls } from "./method-calls";

export function analyzeData(ast: Program, schema: Schema): AnalysisReport {
  const validationContext = new ValidationContext();

  return new AnalysisReport().merge(
    analyzeMethodCalls(ast, schema, validationContext),
    analyzeDataAccess(ast, schema, validationContext)
  );
}
