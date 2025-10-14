import type { Program } from "acorn";
import { traverse } from "../../traverse";
import {
  type Schema,
  isAttributeAllowed,
  getAllowedAttributes,
  getRequiredAttributes,
  getAttributeSchema,
  getEnumValues,
} from "../../schema";
import { isJsxAttribute, isJsxExpressionContainer, type JSXAttribute } from "../../jsx";
import { ValidationContext } from "../validation-context";
import { AnalysisReport } from "../analysis-report";

import { getNodeRange, getAttributeSimilarityMatchers, getBestSimilarityMatcherSuggestion } from "../utils";

export function analyzeElementAttributes(
  ast: Program,
  schema: Schema,
  validationContext: ValidationContext
): AnalysisReport {
  const analysisReport = new AnalysisReport();

  traverse(ast, {
    JSXElement(node) {
      const tagName = node.openingElement.name.name;

      validationContext.enterElement(tagName);
      const currentContext = validationContext.getSnapshot();

      const allowedAttributes = getAllowedAttributes(schema, tagName);
      const requiredAttributes = getRequiredAttributes(schema, tagName);

      for (const attribute of node.openingElement.attributes) {
        if (!isJsxAttribute(attribute)) {
          analysisReport.addIssue(
            "JSX_SPREAD_NOT_ALLOWED",
            "JSX spread attributes not allowed",
            getNodeRange(attribute),
            currentContext
          );
          continue;
        }

        const attributeName = attribute.name.name;
        const range = getNodeRange(attribute);

        if (!isAttributeAllowed(schema, tagName, attributeName)) {
          const suggestions = getAttributeSimilarityMatchers(attributeName, allowedAttributes);
          const suggestionMatch = getBestSimilarityMatcherSuggestion(attributeName, allowedAttributes);

          let message = `Attribute "${attributeName}" not allowed on <${tagName}>`;

          if (suggestionMatch) {
            message += `. Did you mean "${suggestionMatch}"?`;
          } else if (allowedAttributes.length > 0) {
            const displayAttrs = allowedAttributes.slice(0, 5);
            message += `. Available attributes: ${displayAttrs.join(", ")}`;
            if (allowedAttributes.length > 5) {
              message += ` (and ${allowedAttributes.length - 5} more)`;
            }
          }

          analysisReport.addIssue(
            "INVALID_ATTRIBUTE",
            message,
            range,
            currentContext,
            suggestions.map((suggestion) => suggestion.suggestion)
          );
          continue;
        }

        const attributeSchema = getAttributeSchema(schema, tagName, attributeName);
        const enumValues = attributeSchema ? getEnumValues(attributeSchema) : undefined;

        if (enumValues && enumValues.length > 0) {
          const literalValue = getAttributeLiteralValue(attribute);

          if (isEnumComparableValue(literalValue) && !enumValues.includes(literalValue)) {
            analysisReport.addIssue(
              "INVALID_ATTRIBUTE_VALUE",
              `Value ${JSON.stringify(
                literalValue
              )} is not allowed for attribute "${attributeName}" on <${tagName}>. Allowed values: ${enumValues
                .map((value) => JSON.stringify(value))
                .join(", ")}`,
              range,
              currentContext,
              enumValues.map((value) => String(value))
            );
          }
        }
      }

      // Check for missing required attributes
      const providedAttributes = node.openingElement.attributes.filter(isJsxAttribute).map((attr) => attr.name.name);

      for (const requiredAttribute of requiredAttributes) {
        if (!providedAttributes.includes(requiredAttribute)) {
          analysisReport.addIssue(
            "MISSING_REQUIRED_ATTRIBUTE",
            `Required attribute "${requiredAttribute}" missing on <${tagName}>`,
            getNodeRange(node.openingElement),
            currentContext,
            [requiredAttribute]
          );
        }
      }

      validationContext.exitElement();
    },
  });

  return analysisReport;
}

function isEnumComparableValue(value: unknown): value is string | number | boolean {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean";
}

function getAttributeLiteralValue(attribute: JSXAttribute): string | number | boolean | null | undefined {
  if (!attribute.value) {
    return true;
  }

  if (attribute.value.type === "Literal") {
    return attribute.value.value as string | number | boolean | null | undefined;
  }

  if (isJsxExpressionContainer(attribute.value)) {
    const expression = attribute.value.expression as { type?: string; value?: unknown };

    if (expression?.type === "Literal") {
      return expression.value as string | number | boolean | null | undefined;
    }
  }

  return undefined;
}
