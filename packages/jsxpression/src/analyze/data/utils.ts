import type { MemberExpression, Program } from "acorn";
import { isAllowedOnArray, isAllowedOnString } from "../../builtins";
import { Schema, ArrayPropertySchema, PropertySchema } from "../../schema";
import { AnalysisReport } from "../analysis-report";
import { getNodeRange } from "../utils";
import { ValidationContext } from "../validation-context";

export function isSimpleDataAccess(node: MemberExpression): boolean {
  if (node.computed) {
    return node.property.type === "Literal" && typeof node.property.value === "number";
  }
  if (node.property.type !== "Identifier") {
    return false;
  }

  let current: MemberExpression["object"] = node.object;

  while (current) {
    if (current.type === "Identifier") {
      return current.name === "data";
    }

    if (current.type === "MemberExpression") {
      if (current.computed) {
        if (!(current.property.type === "Literal" && typeof current.property.value === "number")) {
          return false;
        }
      } else if (current.property.type !== "Identifier") {
        return false;
      }
      current = current.object;
    } else {
      return false;
    }
  }

  return false;
}

export function extractPath(node: MemberExpression): string[] {
  const path: string[] = [];

  if (node.property.type === "Identifier") {
    path.unshift(node.property.name);
  }

  let current: MemberExpression["object"] = node.object;

  while (current) {
    if (current.type === "Identifier") {
      path.unshift(current.name);
      break;
    }

    if (current.type === "MemberExpression") {
      if (current.property.type === "Identifier") {
        path.unshift(current.property.name);
      }
      current = current.object;
    } else {
      break;
    }
  }

  return path;
}

export function getParentNode(targetNode: any, ast: Program): any | null {
  let parent: any = null;

  function traverseForParent(node: any, currentParent: any = null): void {
    if (node === targetNode) {
      parent = currentParent;
      return;
    }

    for (const key of Object.keys(node)) {
      const value = node[key];
      if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          value.forEach((child) => {
            if (child && typeof child === "object" && child.type) {
              traverseForParent(child, node);
            }
          });
        } else if (value.type) {
          traverseForParent(value, node);
        }
      }
    }
  }

  traverseForParent(ast);
  return parent;
}

export function getAvailablePropsAtPath(path: string[], depth: number, schemaData: any): string[] {
  if (!schemaData || depth < 0) {
    return schemaData ? Object.keys(schemaData) : [];
  }

  if (depth === 0) {
    return Object.keys(schemaData);
  }

  let current = schemaData[path[0]];

  for (let i = 1; i <= depth; i++) {
    if (!current || current.type !== "object" || !current.shape) {
      return [];
    }
    current = current.shape[path[i]];
  }

  if (current && current.type === "object" && current.shape) {
    return Object.keys(current.shape);
  }

  return [];
}

export function validateSchemaPath(
  path: string[],
  schema: Schema,
  analysisReport: AnalysisReport,
  node: MemberExpression,
  validationContext: ValidationContext
): void {
  const schemaData = schema.data;
  if (!schemaData || path.length === 0) {
    analysisReport.addIssue(
      "INVALID_DATA_ACCESS",
      "Invalid data access - no schema data available",
      getNodeRange(node),
      validationContext.getSnapshot(),
      schemaData ? Object.keys(schemaData) : undefined
    );
    return;
  }

  let current = schemaData[path[0]];

  if (!current) {
    analysisReport.addIssue(
      "INVALID_DATA_ACCESS",
      `Property 'data.${path[0]}' does not exist in schema`,
      getNodeRange(node),
      validationContext.getSnapshot(),
      Object.keys(schemaData)
    );
    return;
  }

  for (let i = 1; i < path.length; i++) {
    const prop = path[i];

    if (current.type === "array") {
      if (isAllowedOnArray(prop)) {
        return;
      }

      return;
    }

    if (current.type === "string") {
      if (isAllowedOnString(prop)) {
        return;
      }

      return;
    }

    if (current.type !== "object" || !current.shape) {
      analysisReport.addIssue(
        "INVALID_DATA_ACCESS",
        `Cannot access property '${prop}' on ${current.type || "undefined"} type`,
        getNodeRange(node),
        validationContext.getSnapshot()
      );
      return;
    }

    current = current.shape[prop];

    if (!current) {
      const availableProps = getAvailablePropsAtPath(path, i - 1, schemaData);
      const paths = path.slice(0, i + 1);

      analysisReport.addIssue(
        "INVALID_DATA_ACCESS",
        `Property 'data.${paths.join(".")}' does not exist in schema`,
        getNodeRange(node),
        validationContext.getSnapshot(),
        availableProps
      );
    }
  }
}
