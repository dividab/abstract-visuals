import type { Program, Expression, Super } from "acorn";
import { traverse } from "../../traverse";
import type { Schema } from "../../schema";
import { ValidationContext } from "../validation-context";
import { AnalysisReport } from "../analysis-report";
import { getNodeRange } from "../utils";

export function analyzeMemberAccess(
  ast: Program,
  _schema: Schema,
  validationContext: ValidationContext
): AnalysisReport {
  const analysisReport = new AnalysisReport();

  traverse(ast, {
    MemberExpression(node) {
      let depth = 0;
      let currentNode: Expression | Super = node;
      while (currentNode.type === "MemberExpression") {
        depth += 1;
        currentNode = currentNode.object;
      }
      if (depth > 5) {
        analysisReport.addIssue(
          "MEMBER_CHAIN_TOO_DEEP",
          "member chain too deep",
          getNodeRange(node),
          validationContext.getSnapshot()
        );
      }
    },
  });

  return analysisReport;
}
