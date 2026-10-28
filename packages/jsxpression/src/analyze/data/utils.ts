import type { Expression, MemberExpression, PrivateIdentifier, Super } from "acorn";
import type { JSONSchema7Definition } from "json-schema";
import { isAllowedOnArray, isAllowedOnString, getAvailableArrayMembers, getAvailableStringMembers } from "../../builtins.js";
import { items, keys, property, types } from "../../json-schema.js";
import type { Schema } from "../../schema.js";
import type { AnalysisReport } from "../analysis-report.js";
import { getNodeRange } from "../utils.js";
import type { ValidationContext } from "../validation-context.js";

export function isSimpleDataAccess(node: MemberExpression, dataKeys: ReadonlySet<string>): boolean {
  if (node.computed) {
    return node.property.type === "Literal" && typeof node.property.value === "number";
  }
  if (node.property.type !== "Identifier") {
    return false;
  }

  let current: MemberExpression["object"] = node.object;

  for (;;) {
    if (current.type === "Identifier") {
      return dataKeys.has(current.name);
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
}

export function extractPath(node: MemberExpression): Array<string> {
  const path: Array<string> = [];

  if (node.property.type === "Identifier") {
    path.unshift(node.property.name);
  }

  let current: MemberExpression["object"] = node.object;

  for (;;) {
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

/**
 * Adds an issue if the data doesn't have the path, e.g. product.images.front: each name a property of the one before, or, after an index like [0], of
 * an array's items, or a member strings and arrays have, like length, after which the path isn't followed further
 */
export function validateSchemaPath(
  path: Array<string>,
  schema: Schema,
  analysisReport: AnalysisReport,
  node: MemberExpression,
  validationContext: ValidationContext
): void {
  const data = schema.data;
  if (data === undefined || path[0] === undefined) {
    analysisReport.addIssue(
      "INVALID_DATA_ACCESS",
      "Invalid data access - no schema data available",
      getNodeRange(node),
      validationContext.getSnapshot(),
      data === undefined ? undefined : [...keys(data, data)]
    );
    return;
  }

  const elementAccessFlags = getElementAccessFlags(node, path.length);
  const issue = (message: string, suggestions: ReadonlyArray<string> | undefined): void =>
    analysisReport.addIssue("INVALID_DATA_ACCESS", message, getNodeRange(node), validationContext.getSnapshot(), suggestions && [...suggestions]);

  let current: JSONSchema7Definition = data;
  for (const [i, prop] of path.entries()) {
    const accessedPath = path.slice(0, i + 1).join(".");
    const container: JSONSchema7Definition = (elementAccessFlags[i - 1] === true ? items(current, data) : undefined) ?? current;
    const typeNames = types(container, data);
    const next = property(container, prop, data);

    if (next !== undefined && (typeNames.size === 0 || typeNames.has("object"))) {
      current = next;
      continue;
    }
    if (typeNames.has("array")) {
      if (!isAllowedOnArray(prop)) {
        issue(`Property '${accessedPath}' does not exist on array type`, getAvailableArrayMembers());
      }
      return;
    }
    if (typeNames.has("string")) {
      if (!isAllowedOnString(prop)) {
        issue(`Property '${accessedPath}' does not exist on string type`, getAvailableStringMembers());
      }
      return;
    }
    if (typeNames.size > 0 && !typeNames.has("object")) {
      issue(`Cannot access property '${prop}' on ${[...typeNames].join(" | ")} type`, undefined);
      return;
    }
    issue(`Property '${accessedPath}' does not exist in schema`, keys(container, data));
    return;
  }
}

function getElementAccessFlags(node: MemberExpression, pathLength: number): Array<boolean> {
  const flags = Array.from<boolean>({ length: pathLength }).fill(false);
  const segments: Array<{ property: Expression | PrivateIdentifier; computed: boolean }> = [];

  let current: Expression | Super = node;
  while (current.type === "MemberExpression") {
    segments.unshift({ property: current.property, computed: current.computed });
    current = current.object;
  }

  let schemaIndex = -1;
  let lastWasComputedNumeric = false;

  for (const segment of segments) {
    if (segment.property.type === "Identifier") {
      schemaIndex += 1;
      if (schemaIndex < pathLength) {
        flags[schemaIndex] = lastWasComputedNumeric;
      }
    }

    if (segment.computed && segment.property.type === "Literal" && typeof segment.property.value === "number") {
      lastWasComputedNumeric = true;
    } else {
      lastWasComputedNumeric = false;
    }
  }

  return flags;
}
