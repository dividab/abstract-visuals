import type { Program } from "acorn";
import type { Schema } from "../../schema.js";
import { createAnalysisReport, type AnalysisReport } from "../analysis-report.js";
import { createValidationContext } from "../validation-context.js";
import { analyzeElementAttributes } from "./element-attributes.js";
import { analyzeElementChildren } from "./element-children.js";
import { analyzeElementTags } from "./element-tags.js";

export function analyzeJsx(ast: Program, schema: Schema): AnalysisReport {
  const validationContext = createValidationContext();

  return createAnalysisReport().merge(
    analyzeElementTags(ast, schema, validationContext),
    analyzeElementAttributes(ast, schema, validationContext),
    analyzeElementChildren(ast, schema, validationContext)
  );
}
