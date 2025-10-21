import { Program } from "acorn";
import { Schema } from "../../schema.js";
import { AnalysisReport } from "../analysis-report.js";
import { ValidationContext } from "../validation-context.js";
import { analyzeElementAttributes } from "./element-attributes.js";
import { analyzeElementChildren } from "./element-children.js";
import { analyzeElementTags } from "./element-tags.js";

export function analyzeJsx(ast: Program, schema: Schema): AnalysisReport {
  const validationContext = new ValidationContext();

  return new AnalysisReport().merge(
    analyzeElementTags(ast, schema, validationContext),
    analyzeElementAttributes(ast, schema, validationContext),
    analyzeElementChildren(ast, schema, validationContext)
  );
}
