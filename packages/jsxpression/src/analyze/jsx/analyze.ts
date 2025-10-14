import { Program } from "acorn";
import { Schema } from "../../schema";
import { AnalysisReport } from "../analysis-report";
import { ValidationContext } from "../validation-context";
import { analyzeElementAttributes } from "./element-attributes";
import { analyzeElementChildren } from "./element-children";
import { analyzeElementTags } from "./element-tags";

export function analyzeJsx(ast: Program, schema: Schema): AnalysisReport {
  const validationContext = new ValidationContext();

  return new AnalysisReport().merge(
    analyzeElementTags(ast, schema, validationContext),
    analyzeElementAttributes(ast, schema, validationContext),
    analyzeElementChildren(ast, schema, validationContext)
  );
}
