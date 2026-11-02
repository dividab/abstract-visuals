import type { Expression, FunctionDeclaration, Node, Program } from "acorn";
import { isJsxElement, isJsxExpressionContainer, isJsxRoot } from "../../jsx.js";
import type { Schema } from "../../schema.js";
import { traverse } from "../../traverse.js";
import { createAnalysisReport, type AnalysisReport } from "../analysis-report.js";
import { getNodeRange } from "../utils.js";
import type { ValidationContext } from "../validation-context.js";

export function analyzeDeclarations(ast: Program, schema: Schema, validationContext: ValidationContext): AnalysisReport {
  const analysisReport = createAnalysisReport();
  const topLevelNodes = new Set(ast.body);

  traverse(ast, {
    ImportDeclaration(node) {
      analysisReport.addIssue("IMPORT_NOT_ALLOWED", "import not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    ExportNamedDeclaration(node) {
      analysisReport.addIssue("EXPORT_NOT_ALLOWED", "export not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    ExportDefaultDeclaration(node) {
      analysisReport.addIssue("EXPORT_NOT_ALLOWED", "export not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    FunctionDeclaration(node) {
      // acorn-walk types this callback as FunctionDeclaration | AnonymousFunctionDeclaration, but Program-level
      // function declarations always have an id, so the cast reflects that guarantee without changing behavior.
      if (!topLevelNodes.has(node as FunctionDeclaration)) {
        analysisReport.addIssue(
          "FUNCTION_NOT_ALLOWED",
          "nested function declarations not allowed",
          getNodeRange(node),
          validationContext.getSnapshot()
        );
      }
    },
    ClassDeclaration(node) {
      analysisReport.addIssue("CLASS_NOT_ALLOWED", "classes not allowed", getNodeRange(node), validationContext.getSnapshot());
    },
    VariableDeclaration(node) {
      if (node.kind === "const") {
        return;
      }
      analysisReport.addIssue("VARIABLE_NOT_ALLOWED", `${node.kind} not allowed, use const`, getNodeRange(node), validationContext.getSnapshot());
    },
  });

  const hasDeclarations = ast.body.some((s) => s.type === "VariableDeclaration" || s.type === "FunctionDeclaration");
  if (hasDeclarations) {
    const lastStatement = ast.body[ast.body.length - 1];
    if (lastStatement?.type !== "ReturnStatement") {
      const isBareJsx = lastStatement?.type === "ExpressionStatement" && isJsxRoot(lastStatement.expression);
      const range = lastStatement ? getNodeRange(lastStatement) : { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } };
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

  // What the template returns as it's compiled, its returns, or without declarations its bare element or expression, must be the schema's root
  if (schema.root !== undefined) {
    const returned = ast.body.flatMap((s): Array<Node> => {
      if (s.type === "ReturnStatement") {
        return [s.argument ?? s];
      }
      if (!hasDeclarations && s.type === "ExpressionStatement" && isJsxRoot(s.expression)) {
        return [s.expression];
      }
      if (!hasDeclarations && s.type === "BlockStatement" && s.body.length === 1 && s.body[0]?.type === "ExpressionStatement") {
        return [s.body[0].expression];
      }
      return [];
    });
    if (returned.length === 0 && !hasDeclarations) {
      const range = ast.body[0] ? getNodeRange(ast.body[0]) : { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } };
      analysisReport.addIssue("ROOT_REQUIRED", `Templates must return <${schema.root}>`, range, validationContext.getSnapshot());
    }
    const roots = new Set([schema.root, ...ast.body.flatMap((s) => (s.type === "FunctionDeclaration" ? [s.id.name] : []))]);
    for (const node of returned.filter((n) => !canBeRoot(n, roots))) {
      analysisReport.addIssue("ROOT_REQUIRED", `Templates must return <${schema.root}>`, getNodeRange(node), validationContext.getSnapshot());
    }
  }

  return analysisReport;
}

/**
 * Whether a returned expression can be the root element, of one of the roots' names, the root's or a local function's, which could return it, as a
 * variable, a function's result and the like can't be known not to be
 */
function canBeRoot(node: Node, roots: ReadonlySet<string>): boolean {
  if (isJsxElement(node)) {
    return roots.has(node.openingElement.name.name);
  }
  if (isJsxExpressionContainer(node)) {
    return canBeRoot(node.expression as Node, roots);
  }
  const expression = node as Expression;
  switch (expression.type) {
    case "ConditionalExpression":
      return canBeRoot(expression.consequent, roots) && canBeRoot(expression.alternate, roots);
    case "ParenthesizedExpression":
      return canBeRoot(expression.expression, roots);
    case "Identifier":
    case "CallExpression":
    case "MemberExpression":
    case "ChainExpression":
    case "LogicalExpression":
      return true;
    default:
      return false;
  }
}
