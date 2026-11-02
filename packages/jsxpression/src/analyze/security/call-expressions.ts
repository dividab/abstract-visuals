import type { Identifier, Node, Program } from "acorn";
import { getBuiltins } from "../../builtins.js";
import type { Schema } from "../../schema.js";
import { traverse } from "../../traverse.js";
import { createAnalysisReport, type AnalysisReport } from "../analysis-report.js";
import { getNodeRange } from "../utils.js";
import type { ValidationContext } from "../validation-context.js";

export function analyzeCallExpressions(ast: Program, schema: Schema, validationContext: ValidationContext): AnalysisReport {
  const analysisReport = createAnalysisReport();

  // The template's own functions, declared or a const's arrow function, by name, with what each one runs
  const localFunctions = new Map<string, Node>(
    ast.body.flatMap((s): Array<[string, Node]> => {
      if (s.type === "FunctionDeclaration") {
        return [[s.id.name, s.body]];
      }
      if (s.type === "VariableDeclaration") {
        return s.declarations.flatMap((d): Array<[string, Node]> =>
          d.id.type === "Identifier" && d.init?.type === "ArrowFunctionExpression" ? [[d.id.name, d.init.body]] : []
        );
      }
      return [];
    })
  );
  const localFunctionNames = new Set(localFunctions.keys());
  const schemaFunctionNames = new Set(Object.keys(schema.functions ?? {}));
  // Only a global with a call signature, e.g. `String(value)`, not `Math(1)`
  const callableBuiltinGlobals = new Set(
    Object.entries(getBuiltins())
      .filter(([, builtin]) => builtin.global && builtin.call)
      .map(([name]) => name)
  );

  // The local functions each local function refers to, called or passed on, like to an array's map, so one that reaches itself through them
  // recurses, which a template could hang in
  const references = new Map(
    [...localFunctions].map(([name, body]) => {
      const names: Array<Identifier> = [];
      traverse(body, {
        Identifier(node) {
          if (localFunctionNames.has(node.name)) {
            names.push(node);
          }
        },
      });
      return [name, names];
    })
  );
  const reaches = (name: string, target: string, seen: Set<string>): boolean =>
    name === target || (!seen.has(name) && (seen.add(name), (references.get(name) ?? []).some((reference) => reaches(reference.name, target, seen))));
  for (const [name, names] of references) {
    for (const reference of names) {
      if (reaches(reference.name, name, new Set())) {
        analysisReport.addIssue(
          "RECURSION_NOT_ALLOWED",
          reference.name === name
            ? `${name} calls itself, recursion not allowed`
            : `${name} calls itself through ${reference.name}, recursion not allowed`,
          getNodeRange(reference),
          validationContext.getSnapshot()
        );
      }
    }
  }

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
        if (localFunctionNames.has(callee.name) || schemaFunctionNames.has(callee.name) || callableBuiltinGlobals.has(callee.name)) {
          return;
        }
      }

      analysisReport.addIssue("DIRECT_CALL_NOT_ALLOWED", "only member calls allowed", getNodeRange(node), validationContext.getSnapshot());
    },
  });

  return analysisReport;
}
