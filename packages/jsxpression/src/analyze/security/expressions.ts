import type { Program, Expression, Node, Super } from "acorn";
import type { Schema } from "../../schema.js";
import { traverse } from "../../traverse.js";
import { createAnalysisReport, type AnalysisReport } from "../analysis-report.js";
import { getNodeRange } from "../utils.js";
import type { ValidationContext } from "../validation-context.js";

export function analyzeExpressions(ast: Program, _schema: Schema, validationContext: ValidationContext): AnalysisReport {
  const analysisReport = createAnalysisReport();
  const loop = (node: Node): void => {
    analysisReport.addIssue("LOOP_NOT_ALLOWED", "loops not allowed", getNodeRange(node), validationContext.getSnapshot(), [
      "Use an array's methods instead, like map and filter",
    ]);
  };

  traverse(ast, {
    // The statements a template compiles are declarations, returns and expressions, which any other would be left out of or fail
    WhileStatement: loop,
    DoWhileStatement: loop,
    ForStatement: loop,
    ForInStatement: loop,
    ForOfStatement: loop,
    IfStatement(node) {
      analysisReport.addIssue("IF_NOT_ALLOWED", "if not allowed", getNodeRange(node), validationContext.getSnapshot(), [
        "Use a conditional expression instead: condition ? a : b",
      ]);
    },
    SwitchStatement(node) {
      analysisReport.addIssue("SWITCH_NOT_ALLOWED", "switch not allowed", getNodeRange(node), validationContext.getSnapshot(), [
        "Use a conditional expression instead: condition ? a : b",
      ]);
    },
    LabeledStatement(node) {
      analysisReport.addIssue("LABEL_NOT_ALLOWED", "labels not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    TryStatement(node) {
      analysisReport.addIssue("TRY_NOT_ALLOWED", "try not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    ThrowStatement(node) {
      analysisReport.addIssue("THROW_NOT_ALLOWED", "throw not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    DebuggerStatement(node) {
      analysisReport.addIssue("DEBUGGER_NOT_ALLOWED", "debugger not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    NewExpression(node) {
      analysisReport.addIssue("NEW_NOT_ALLOWED", "new not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    ThisExpression(node) {
      analysisReport.addIssue("THIS_NOT_ALLOWED", "this not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    WithStatement(node) {
      analysisReport.addIssue("WITH_NOT_ALLOWED", "with not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    AwaitExpression(node) {
      analysisReport.addIssue("AWAIT_NOT_ALLOWED", "await not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    YieldExpression(node) {
      analysisReport.addIssue("YIELD_NOT_ALLOWED", "yield not allowed", getNodeRange(node), validationContext.getSnapshot());
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
      let depth = 0;
      let currentNode: Expression | Super = node;
      while (currentNode.type === "MemberExpression") {
        depth += 1;
        currentNode = currentNode.object;
      }
      if (depth > 5) {
        analysisReport.addIssue("MEMBER_CHAIN_TOO_DEEP", "member chain too deep", getNodeRange(node), validationContext.getSnapshot());
      }

      if (node.computed) {
        if (node.property.type === "Literal" && typeof node.property.value === "number") {
          return;
        }

        analysisReport.addIssue(
          "COMPUTED_ACCESS_NOT_ALLOWED",
          "computed member access not allowed",
          getNodeRange(node),
          validationContext.getSnapshot(),
          ["Use dot notation: obj.prop instead of obj[prop]", "For arrays, use numeric indices: array[0] instead of array[variable]"]
        );
      }
    },
  });

  return analysisReport;
}
