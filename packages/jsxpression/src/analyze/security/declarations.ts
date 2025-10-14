import type { Program } from "acorn";
import { traverse } from "../../traverse";
import type { Schema } from "../../schema";
import { ValidationContext } from "../validation-context";
import { AnalysisReport } from "../analysis-report";
import { getNodeRange } from "../utils";

export function analyzeDeclarations(
  ast: Program,
  _schema: Schema,
  validationContext: ValidationContext
): AnalysisReport {
  const analysisReport = new AnalysisReport();

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
      analysisReport.addIssue(
        "FUNCTION_NOT_ALLOWED",
        "function declarations not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
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
      analysisReport.addIssue(
        "VARIABLE_NOT_ALLOWED",
        "variables not allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
  });

  return analysisReport;
}
