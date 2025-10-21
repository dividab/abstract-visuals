import type { AnyNode, ArrowFunctionExpression, Identifier, Program } from "acorn";
import { traverse } from "../../traverse.js";
import type { Schema } from "../../schema.js";
import { getBuiltinGlobals } from "../../builtins.js";
import { ValidationContext } from "../validation-context.js";
import { AnalysisReport } from "../analysis-report.js";
import { getNodeRange } from "../utils.js";

export function analyzeIdentifiers(
  ast: Program,
  _schema: Schema,
  validationContext: ValidationContext
): AnalysisReport {
  const analysisReport = new AnalysisReport();
  const arrowParamScopes = getArrowParamScopes(ast);

  traverse(ast, {
    Identifier(node: Identifier) {
      const { name } = node;

      const allowedRoots = ["props", "data", ...getBuiltinGlobals()];

      if (allowedRoots.includes(name)) {
        return;
      }

      const arrowParent = findArrowParent(node, ast);

      if (arrowParent) {
        const params = arrowParamScopes.get(arrowParent);
        if (params?.has(name)) {
          return;
        }
      }

      analysisReport.addIssue(
        "IDENTIFIER_NOT_ALLOWED",
        `Identifier "${name}" not allowed`,
        getNodeRange(node),
        validationContext.getSnapshot(),
        allowedRoots
      );
    },
  });

  return analysisReport;
}

// Build a map of arrow functions to their parameter names so we can check if an
// identifier is a legit arrow function param or something shady. We do this in
// a separate traversal because it's cleaner than trying to track scope during the
// main validation pass.
function getArrowParamScopes(ast: Program): Map<ArrowFunctionExpression, Set<string>> {
  const arrowParamScopes = new Map<ArrowFunctionExpression, Set<string>>();
  traverse(ast, {
    ArrowFunctionExpression(node) {
      const { params } = node;
      if (Array.isArray(params)) {
        const paramNames = new Set<string>();
        params.forEach((p) => {
          if (p.type === "Identifier") {
            paramNames.add(p.name);
          }
        });
        arrowParamScopes.set(node, paramNames);
      }
    },
  });
  return arrowParamScopes;
}

// Walk up the AST tree to find the nearest ArrowFunctionExpression parent.
// This lets us check if an identifier is in scope as an arrow function parameter.
function findArrowParent(targetNode: AnyNode, rootNode: AnyNode): ArrowFunctionExpression | null {
  let found: ArrowFunctionExpression | null = null;

  function walk(node: AnyNode): boolean {
    if (node === targetNode) {
      return true;
    }

    const isArrow = node.type === "ArrowFunctionExpression";

    if (isArrow) {
      found = node as ArrowFunctionExpression;
    }

    for (const key of Object.keys(node)) {
      const value = (node as any)[key];

      if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === "object" && walk(item)) {
              return true;
            }
          }
        } else if (walk(value)) {
          return true;
        }
      }
    }

    if (isArrow) {
      found = null;
    }

    return false;
  }

  walk(rootNode);
  return found;
}
