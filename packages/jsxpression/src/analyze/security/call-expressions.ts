import type { Program } from "acorn";
import { getBuiltinGlobals } from "../../builtins.js";
import type { Schema } from "../../schema.js";
import { traverse } from "../../traverse.js";
import { AnalysisReport } from "../analysis-report.js";
import { getNodeRange } from "../utils.js";
import type { ValidationContext } from "../validation-context.js";

export function analyzeCallExpressions(
  ast: Program,
  schema: Schema,
  validationContext: ValidationContext
): AnalysisReport {
  const analysisReport = new AnalysisReport();

  const localFunctionNames = new Set<string>();
  for (const stmt of ast.body) {
    if (stmt.type === "FunctionDeclaration" && stmt.id) {
      localFunctionNames.add(stmt.id.name);
    }
  }
  const schemaFunctionNames = new Set(Object.keys(schema.functions ?? {}));
  const builtinGlobals = new Set(getBuiltinGlobals());

  traverse(ast, {
    CallExpression(node) {
      const { callee } = node;

      if (callee.type === "MemberExpression") {
        if (callee.property.type !== "Identifier" || callee.computed) {
          analysisReport.addIssue(
            "DYNAMIC_METHOD_NOT_ALLOWED",
            "only explicitly allowed methods are permitted",
            getNodeRange(callee),
            validationContext.getSnapshot()
          );
        }
        return;
      }

      if (callee.type === "Identifier") {
        if (
          localFunctionNames.has(callee.name) ||
          schemaFunctionNames.has(callee.name) ||
          builtinGlobals.has(callee.name)
        ) {
          return;
        }
      }

      analysisReport.addIssue(
        "DIRECT_CALL_NOT_ALLOWED",
        "only member calls allowed",
        getNodeRange(node),
        validationContext.getSnapshot()
      );
    },
  });

  return analysisReport;
}
