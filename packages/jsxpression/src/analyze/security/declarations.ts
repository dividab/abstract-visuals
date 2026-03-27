import type { Program } from "acorn";
import { isJsxRoot } from "../../jsx.js";
import type { Schema } from "../../schema.js";
import { traverse } from "../../traverse.js";
import { AnalysisReport } from "../analysis-report.js";
import { getNodeRange } from "../utils.js";
import type { ValidationContext } from "../validation-context.js";

export function analyzeDeclarations(
  ast: Program,
  _schema: Schema,
  validationContext: ValidationContext
): AnalysisReport {
  const analysisReport = new AnalysisReport();
  const topLevelNodes = new Set(ast.body);

  traverse(ast, {
    ImportDeclaration(node) {
      analysisReport.addIssue(
        "IMPORT_NOT_ALLOWED",
        "import not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
    ExportNamedDeclaration(node) {
      analysisReport.addIssue(
        "EXPORT_NOT_ALLOWED",
        "export not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
    ExportDefaultDeclaration(node) {
      analysisReport.addIssue(
        "EXPORT_NOT_ALLOWED",
        "export not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
    FunctionDeclaration(node) {
      if (!topLevelNodes.has(node as any)) {
        analysisReport.addIssue(
          "FUNCTION_NOT_ALLOWED",
          "nested function declarations not allowed",
          getNodeRange(node),
          validationContext.getSnapshot()
        );
      }
    },
    ClassDeclaration(node) {
      analysisReport.addIssue(
        "CLASS_NOT_ALLOWED",
        "classes not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
    VariableDeclaration(node) {
      if (node.kind === "const") {
        return;
      }
      analysisReport.addIssue(
        "VARIABLE_NOT_ALLOWED",
        `${node.kind} not allowed, use const`,
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
  });

  const hasDeclarations = ast.body.some((s) => s.type === "VariableDeclaration" || s.type === "FunctionDeclaration");
  if (hasDeclarations) {
    const lastStatement = ast.body[ast.body.length - 1];
    if (!lastStatement || lastStatement.type !== "ReturnStatement") {
      const isBareJsx = lastStatement?.type === "ExpressionStatement" && isJsxRoot(lastStatement.expression);
      const range = lastStatement
        ? getNodeRange(lastStatement)
        : { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } };
      analysisReport.addIssue(
        "RETURN_REQUIRED",
        isBareJsx
          ? "Templates with declarations must end with a return statement. Add 'return' before the JSX."
          : "Templates with declarations must end with a return statement",
        range,
        validationContext.getSnapshot()
      );
    }
  }

  return analysisReport;
}
