import type { Program } from "acorn";
import type { Schema } from "../schema.js";
import { createAnalysisReport, type AnalysisReport } from "./analysis-report.js";
import { analyzeData } from "./data/index.js";
import { analyzeJsx } from "./jsx/index.js";
import { analyzeSecurity } from "./security/index.js";

export function analyze(ast: Program, schema: Schema): AnalysisReport {
  return createAnalysisReport().merge(analyzeSecurity(ast, schema), analyzeJsx(ast, schema), analyzeData(ast, schema));
}
