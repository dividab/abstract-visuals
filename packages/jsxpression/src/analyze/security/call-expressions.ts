import type { Program } from "acorn";
import { traverse } from "../../traverse";
import type { Schema } from "../../schema";
import { ValidationContext } from "../validation-context";
import { AnalysisReport } from "../analysis-report";
import { getNodeRange } from "../utils";

export function analyzeCallExpressions(
  ast: Program,
  _schema: Schema,
  validationContext: ValidationContext
): AnalysisReport {
  const analysisReport = new AnalysisReport();

  traverse(ast, {
    CallExpression(node) {
      const { callee } = node;

      if (callee.type !== "MemberExpression") {
        analysisReport.addIssue(
          "DIRECT_CALL_NOT_ALLOWED",
          "only member calls allowed",
          getNodeRange(node),
          validationContext.getSnapshot()
        );
        return;
      }

      if (callee.property.type !== "Identifier" || callee.computed) {
        analysisReport.addIssue(
          "DYNAMIC_METHOD_NOT_ALLOWED",
          "only explicitly allowed methods are permitted",
          getNodeRange(callee),
          validationContext.getSnapshot()
        );
      }
    },
  });

  return analysisReport;
}
