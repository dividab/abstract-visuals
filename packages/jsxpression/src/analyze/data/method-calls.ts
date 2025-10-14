import type { Program } from "acorn";
import { traverse } from "../../traverse";
import type { Schema } from "../../schema";
import { isMethodAllowed, getMethodDefinition, getMethodDisplayName } from "../../builtins";
import { ValidationContext } from "../validation-context";
import { AnalysisReport } from "../analysis-report";
import { isSimpleDataAccess, extractPath, validateSchemaPath } from "./utils";
import { getNodeRange } from "../utils";

export function analyzeMethodCalls(ast: Program, schema: Schema, validationContext: ValidationContext): AnalysisReport {
  const analysisReport = new AnalysisReport();

  traverse(ast, {
    CallExpression(node) {
      const { callee, arguments: args } = node;

      if (callee.type === "MemberExpression" && !callee.computed && callee.property.type === "Identifier") {
        const method = callee.property.name;

        if (isSimpleDataAccess(callee)) {
          const path = extractPath(callee);
          if (path[0] === "data") {
            const schemaPath = path.slice(1, -1);
            if (schemaPath.length > 0) {
              validateSchemaPath(schemaPath, schema, analysisReport, callee, validationContext);
            }
          }
        }

        if (!isMethodAllowed(method)) {
          const methodContext = callee.object.type === "Identifier" ? `${callee.object.name}.${method}` : `.${method}`;

          analysisReport.addIssue(
            "METHOD_NOT_ALLOWED",
            `method ${methodContext} not allowed`,
            getNodeRange(callee),
            validationContext.getSnapshot()
          );
          return;
        }

        const methodDef = getMethodDefinition(method);

        if (!methodDef || !methodDef.params) {
          return;
        }

        const { params } = methodDef;

        const requiredParams = params.filter((params) => params.required !== false);
        const hasVariadic = params.some((params) => params.variadic);

        if (hasVariadic) {
          const nonVariadicRequired = requiredParams.filter((params) => !params.variadic);
          if (args.length < nonVariadicRequired.length) {
            analysisReport.addIssue(
              "INSUFFICIENT_PARAMETERS",
              `${getMethodDisplayName(method)} expects at least ${nonVariadicRequired.length} parameter${
                nonVariadicRequired.length !== 1 ? "s" : ""
              }, got ${args.length}`,
              getNodeRange(node),
              validationContext.getSnapshot()
            );
          }
        } else {
          const minParams = requiredParams.length;
          const maxParams = params.length;

          if (args.length < minParams) {
            analysisReport.addIssue(
              "INSUFFICIENT_PARAMETERS",
              `${getMethodDisplayName(method)} expects at least ${minParams} parameter${
                minParams !== 1 ? "s" : ""
              }, got ${args.length}`,
              getNodeRange(node),
              validationContext.getSnapshot()
            );
          }

          if (args.length > maxParams) {
            analysisReport.addIssue(
              "TOO_MANY_PARAMETERS",
              `${getMethodDisplayName(method)} expects at most ${maxParams} parameter${
                maxParams !== 1 ? "s" : ""
              }, got ${args.length}`,
              getNodeRange(node),
              validationContext.getSnapshot()
            );
          }
        }
      }
    },
  });

  return analysisReport;
}
