import type { AnyNode, ArrowFunctionExpression, CallExpression, Identifier, MemberExpression, Program } from "acorn";
import type { ArrayPropertySchema, PropertySchema, Schema } from "../../schema.js";
import { traverse } from "../../traverse.js";
import { createAnalysisReport, type AnalysisReport } from "../analysis-report.js";
import { getNodeRange } from "../utils.js";
import type { ValidationContext } from "../validation-context.js";
import { isSimpleDataAccess, extractPath, validateSchemaPath } from "./utils.js";

export function analyzeDataAccess(ast: Program, schema: Schema, validationContext: ValidationContext): AnalysisReport {
  const analysisReport = createAnalysisReport();

  const dataKeys = new Set(Object.keys(schema.data ?? {}));
  const dataPaths = new Set<string>();
  const arrowFunctionContexts = new Map<ArrowFunctionExpression, Map<string, PropertySchema>>();

  // First pass: collect all data paths and arrow function contexts (including nested ones)
  function collectArrowFunctionContexts(node: AnyNode): void {
    if (node.type === "CallExpression") {
      const { callee, arguments: args } = node;

      if (
        callee.type === "MemberExpression" &&
        !callee.computed &&
        callee.property.type === "Identifier" &&
        args[0]?.type === "ArrowFunctionExpression"
      ) {
        const method = callee.property.name;

        // TODO: Move these into builtins so it stays in sync with the global method definitions
        const arrayCallbackMethods = ["map", "filter", "find", "forEach", "some", "every", "reduce"];

        if (arrayCallbackMethods.includes(method)) {
          const arrayElementType = getArrayElementTypeFromCall(node, schema, arrowFunctionContexts);
          const arrowFunction = args[0];

          if (arrayElementType && arrowFunction.params.length > 0) {
            const parameterTypes = new Map<string, PropertySchema>();

            // First parameter is always the array element
            if (arrowFunction.params[0]?.type === "Identifier") {
              parameterTypes.set(arrowFunction.params[0].name, arrayElementType);
            }

            // For methods like reduce, second parameter might be index (number)
            if (arrowFunction.params[1]?.type === "Identifier") {
              parameterTypes.set(arrowFunction.params[1].name, { type: "number" });
            }

            arrowFunctionContexts.set(arrowFunction, parameterTypes);
          }
        }
      }
    }

    // Recursively traverse all child nodes
    const record = node as unknown as Record<string, unknown>;
    for (const key of Object.keys(record)) {
      const value = record[key];
      if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          for (const child of value) {
            if (child && typeof child === "object" && (child as Record<string, unknown>)["type"]) {
              collectArrowFunctionContexts(child as AnyNode);
            }
          }
        } else if ((value as Record<string, unknown>)["type"]) {
          collectArrowFunctionContexts(value as AnyNode);
        }
      }
    }
  }

  traverse(ast, {
    MemberExpression(node) {
      if (isSimpleDataAccess(node, dataKeys)) {
        const path = extractPath(node);
        if (path[0] !== undefined && dataKeys.has(path[0])) {
          dataPaths.add(path.join("."));
        }
      }
    },
  });

  // Collect all arrow function contexts including nested ones
  collectArrowFunctionContexts(ast);

  const parentMap = buildParentMap(ast);

  const validatablePaths = new Set<string>();

  for (const path of dataPaths) {
    let hasLongerPath = false;
    for (const otherPath of dataPaths) {
      if (otherPath !== path && otherPath.startsWith(path + ".")) {
        hasLongerPath = true;
        break;
      }
    }
    if (!hasLongerPath) {
      validatablePaths.add(path);
    }
  }

  // Second pass: validate with context awareness
  traverse(ast, {
    MemberExpression(node) {
      const parent = parentMap.get(node);
      if (parent?.type === "CallExpression" && parent.callee === node) {
        return;
      }

      // Check if this is inside an arrow function with parameter context
      const arrowFunctionContext = findEnclosingArrowContext(node, arrowFunctionContexts);

      if (arrowFunctionContext && node.object.type === "Identifier") {
        const paramType = arrowFunctionContext.get(node.object.name);
        if (paramType) {
          validateParameterAccess(node, paramType, analysisReport, validationContext);
          return;
        }
      }

      if (isSimpleDataAccess(node, dataKeys)) {
        const path = extractPath(node);

        if (path[0] !== undefined && dataKeys.has(path[0])) {
          const pathString = path.join(".");

          if (validatablePaths.has(pathString)) {
            validateSchemaPath(path, schema, analysisReport, node, validationContext);
          }
        }
      }
    },
  });

  return analysisReport;
}

function findEnclosingArrowContext(
  targetNode: MemberExpression,
  arrowFunctionContexts: Map<ArrowFunctionExpression, Map<string, PropertySchema>>
): Map<string, PropertySchema> | null {
  let best: { arrowFn: ArrowFunctionExpression; size: number } | null = null;
  for (const arrowFn of arrowFunctionContexts.keys()) {
    if (targetNode.start >= arrowFn.start && targetNode.end <= arrowFn.end) {
      const size = arrowFn.end - arrowFn.start;
      if (!best || size < best.size) {
        best = { arrowFn, size };
      }
    }
  }
  return best ? (arrowFunctionContexts.get(best.arrowFn) ?? null) : null;
}

function getArrayElementTypeFromCall(
  node: CallExpression,
  schema: Schema,
  arrowFunctionContexts: Map<ArrowFunctionExpression, Map<string, PropertySchema>>
): PropertySchema | null {
  const { callee } = node;
  const dataKeys = new Set(Object.keys(schema.data ?? {}));

  if (callee.type !== "MemberExpression") {
    return null;
  }

  if (isSimpleDataAccess(callee, dataKeys)) {
    const path = extractPath(callee);
    if (path[0] !== undefined && dataKeys.has(path[0])) {
      const schemaPath = path.slice(0, -1); // Remove method name
      const arraySchema = getSchemaAtPath(schemaPath, schema);

      if (arraySchema?.type === "array") {
        return getArrayElementType(arraySchema);
      }
    }
  } else if (callee.object.type === "MemberExpression") {
    // Handle nested access like group.items.map where group is a parameter
    const objectPath = extractPath(callee.object);

    // Check if this is a parameter access (not data access)
    if (objectPath.length === 2) {
      // e.g., ["group", "items"] or ["dept", "employees"]
      const paramName = objectPath[0];
      const propertyName = objectPath[1];
      if (paramName === undefined || propertyName === undefined) {
        return null;
      }

      // Find the arrow function context that defines this parameter
      const parameterType = resolveParameterType(paramName, node, arrowFunctionContexts);

      if (parameterType?.type === "object") {
        const propertySchema = parameterType.shape[propertyName];
        if (propertySchema?.type === "array") {
          return getArrayElementType(propertySchema);
        }
      }
    }
  }

  return null;
}

function resolveParameterType(
  paramName: string,
  currentNode: AnyNode,
  arrowFunctionContexts: Map<ArrowFunctionExpression, Map<string, PropertySchema>>
): PropertySchema | undefined | null {
  // Find the arrow function that contains this node and has the parameter
  for (const [arrowFunction, parameterTypes] of arrowFunctionContexts.entries()) {
    if (parameterTypes.has(paramName)) {
      // Check if currentNode is inside this arrow function
      if (isNodeInsideArrowFunction(currentNode, arrowFunction)) {
        return parameterTypes.get(paramName);
      }
    }
  }
  return null;
}

function isNodeInsideArrowFunction(targetNode: AnyNode, arrowFunction: ArrowFunctionExpression): boolean {
  // Simple check: if the target node's position is within the arrow function's range
  if (targetNode.start >= arrowFunction.start && targetNode.end <= arrowFunction.end) {
    return true;
  }
  return false;
}

function getSchemaAtPath(path: Array<string>, schema: Schema): PropertySchema | null | undefined {
  const root = path[0];
  if (!schema.data || root === undefined) {
    // oxlint-disable-next-line typescript/no-explicit-any -- this branch returns the raw schema.data record (not a PropertySchema) when no path segments remain; preserved as-is for behavior parity
    return schema.data as any;
  }

  let current = schema.data[root];

  for (let i = 1; i < path.length && current; i++) {
    const prop = path[i];
    if (prop === undefined) {
      return undefined;
    }
    if (current.type === "object") {
      current = current.shape[prop];
    } else {
      return null;
    }
  }

  return current;
}

function validateParameterAccess(
  node: MemberExpression,
  paramType: PropertySchema,
  analysisReport: AnalysisReport,
  validationContext: ValidationContext
): void {
  if (node.property.type !== "Identifier") {
    return;
  }

  const propertyName = node.property.name;

  if (paramType.type === "object") {
    if (!paramType.shape[propertyName]) {
      analysisReport.addIssue(
        "INVALID_PARAMETER_ACCESS",
        `Property '${propertyName}' does not exist on parameter '${(node.object as Identifier).name}'`,
        getNodeRange(node),
        validationContext.getSnapshot(),
        Object.keys(paramType.shape)
      );
    }
  } else {
    analysisReport.addIssue(
      "INVALID_PARAMETER_ACCESS",
      `Cannot access property '${propertyName}' on ${paramType.type} type parameter '${(node.object as Identifier).name}'`,
      getNodeRange(node),
      validationContext.getSnapshot()
    );
  }
}

export function getArrayElementType(schema: ArrayPropertySchema): PropertySchema | null {
  return schema.shape;
}

function buildParentMap(ast: Program): Map<AnyNode, AnyNode | null> {
  const map = new Map<AnyNode, AnyNode | null>();
  function visit(node: unknown, parent: AnyNode | null): void {
    const record = node as Record<string, unknown> | null;
    if (!record || typeof record !== "object" || !record["type"]) {
      return;
    }
    map.set(node as AnyNode, parent);
    for (const key of Object.keys(record)) {
      const value = record[key];
      if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          for (const child of value) {
            visit(child, node as AnyNode);
          }
        } else {
          visit(value, node as AnyNode);
        }
      }
    }
  }
  visit(ast, null);
  return map;
}
