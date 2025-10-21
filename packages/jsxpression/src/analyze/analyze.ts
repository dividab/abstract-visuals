import type { Program } from "acorn";
import type { Schema } from "../schema.js";
import { AnalysisReport } from "./analysis-report.js";
import { analyzeSecurity } from "./security/index.js";
import { analyzeJsx } from "./jsx/index.js";
import { analyzeData } from "./data/index.js";

export function analyze(ast: Program, schema: Schema): AnalysisReport {
  return new AnalysisReport().merge(analyzeSecurity(ast, schema), analyzeJsx(ast, schema), analyzeData(ast, schema));
}
