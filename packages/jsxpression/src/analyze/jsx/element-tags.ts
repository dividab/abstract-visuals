import type { Program } from "acorn";
import { traverse } from "../../traverse";
import { type Schema, isElementAllowed, getAllElements } from "../../schema";
import { ValidationContext } from "../validation-context";
import { AnalysisReport } from "../analysis-report";
import { getNodeRange, getElementSimilarityMatchers, getBestSimilarityMatcherSuggestion } from "../utils";

export function analyzeElementTags(ast: Program, schema: Schema, validationContext: ValidationContext): AnalysisReport {
  const analysisReport = new AnalysisReport();

  traverse(ast, {
    JSXElement(node) {
      const tagName = node.openingElement.name.name;

      validationContext.enterElement(tagName);

      const snapshot = validationContext.getSnapshot();
      const range = getNodeRange(node);

      if (!isElementAllowed(schema, tagName)) {
        const availableElements = getAllElements(schema);
        const elementSimilarityMatchers = getElementSimilarityMatchers(tagName, availableElements);
        const bestSuggestionMatch = getBestSimilarityMatcherSuggestion(tagName, availableElements);

        let message = `Element <${tagName}> not allowed`;

        if (snapshot.elements.length > 1) {
          message += ` in ${validationContext.currentPath}`;
        }

        if (bestSuggestionMatch) {
          message += `. Did you mean <${bestSuggestionMatch}>?`;
        } else if (availableElements.length > 0) {
          const displayElements = availableElements.slice(0, 5);
          message += `. Available elements: ${displayElements.join(", ")}`;
          if (availableElements.length > 5) {
            message += ` (and ${availableElements.length - 5} more)`;
          }
        }

        analysisReport.addIssue(
          "INVALID_ELEMENT",
          message,
          range,
          snapshot,
          elementSimilarityMatchers.map((similarityMatcher) => similarityMatcher.suggestion)
        );
      }

      validationContext.exitElement();
    },
  });

  return analysisReport;
}
