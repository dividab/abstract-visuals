import type { Program } from "acorn";
import { traverse } from "../../traverse";
import type { Schema } from "../../schema";
import { ValidationContext } from "../validation-context";
import { AnalysisReport } from "../analysis-report";
import { getNodeRange } from "../utils";

export function analyzeExpressions(
  ast: Program,
  _schema: Schema,
  validationContext: ValidationContext
): AnalysisReport {
  const analysisReport = new AnalysisReport();

  traverse(ast, {
    NewExpression(node) {
      analysisReport.addIssue(
        "NEW_NOT_ALLOWED",
        "new not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
    ThisExpression(node) {
      analysisReport.addIssue(
        "THIS_NOT_ALLOWED",
        "this not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
    WithStatement(node) {
      analysisReport.addIssue(
        "WITH_NOT_ALLOWED",
        "with not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
    AwaitExpression(node) {
      analysisReport.addIssue(
        "AWAIT_NOT_ALLOWED",
        "await not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
    YieldExpression(node) {
      analysisReport.addIssue(
        "YIELD_NOT_ALLOWED",
        "yield not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
    ArrowFunctionExpression(node) {
      if (node.body.type === "BlockStatement") {
        analysisReport.addIssue(
          "ARROW_FUNCTION_BLOCK_BODY_NOT_ALLOWED",
          "arrow functions with block body not allowed",
          getNodeRange(node),
          validationContext.getSnapshot()
        );
      }
    },
    ObjectExpression(node) {
      for (const property of node.properties) {
        if (property.type === "Property" && property.computed) {
          analysisReport.addIssue(
            "COMPUTED_PROPERTY_NOT_ALLOWED",
            "computed object properties not allowed",
            getNodeRange(property),
            validationContext.getSnapshot()
          );
        }
      }
    },
    MemberExpression(node) {
      if (node.computed) {
        // We allow numeric literals for array access (data.items[0])
        if (node.property.type === "Literal" && typeof node.property.value === "number") {
          return; // Allow numeric array indices
        }

        analysisReport.addIssue(
          "COMPUTED_ACCESS_NOT_ALLOWED",
          "computed member access not allowed",
          getNodeRange(node),
          validationContext.getSnapshot(),
          [
            "Use dot notation: obj.prop instead of obj[prop]",
            "For arrays, use numeric indices: array[0] instead of array[variable]",
          ]
        );
      }
    },
  });

  return analysisReport;
}
