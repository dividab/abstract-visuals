import type { Program } from "acorn";
import type { Schema } from "../schema";
import { AnalysisReport } from "./analysis-report";
import { analyzeSecurity } from "./security";
import { analyzeJsx } from "./jsx";
import { analyzeData } from "./data";

export function analyze(ast: Program, schema: Schema): AnalysisReport {
  return new AnalysisReport().merge(analyzeSecurity(ast, schema), analyzeJsx(ast, schema), analyzeData(ast, schema));
}
