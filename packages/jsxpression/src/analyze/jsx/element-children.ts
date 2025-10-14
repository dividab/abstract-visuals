import type { Program } from "acorn";
import { traverse } from "../../traverse";
import { type Schema, getAllowedChildren, isSelfClosing } from "../../schema";
import { isJsxElement, isJsxFragment, isJsxText, isJsxLeafNode } from "../../jsx";
import { ValidationContext } from "../validation-context";
import { AnalysisReport } from "../analysis-report";
import { getNodeRange, getElementSimilarityMatchers, getBestSimilarityMatcherSuggestion } from "../utils";

export function analyzeElementChildren(
  ast: Program,
  schema: Schema,
  validationContext: ValidationContext
): AnalysisReport {
  const analysisReport = new AnalysisReport();

  traverse(ast, {
    JSXElement(node) {
      const parentTag = node.openingElement.name.name;

      validationContext.enterElement(parentTag);

      const currentContext = validationContext.getSnapshot();

      const allowedChildren = getAllowedChildren(schema, parentTag);

      if (!allowedChildren) {
        validationContext.exitElement();
        return;
      }

      if (isSelfClosing(schema, parentTag) && node.children.length > 0) {
        const hasNonWhitespaceContent = node.children.some((child) => {
          if (isJsxText(child)) {
            return child.value.trim().length > 0;
          }
          return !isJsxLeafNode(child) || !isJsxText(child);
        });

        if (hasNonWhitespaceContent) {
          const firstMeaningfulChild = node.children.find((child) => {
            if (isJsxText(child)) {
              return child.value.trim().length > 0;
            }
            return true;
          });

          analysisReport.addIssue(
            "SELF_CLOSING_WITH_CHILDREN",
            `Element <${parentTag}> cannot have children. It is self-closing.`,
            getNodeRange(firstMeaningfulChild || node.children[0]),
            currentContext
          );
        }
      }

      for (const child of node.children) {
        if (isJsxElement(child)) {
          const childTag = child.openingElement.name.name;

          if (!allowedChildren.includes(childTag)) {
            const elementSimilarityMatchers = getElementSimilarityMatchers(childTag, allowedChildren);
            const bestSimilarityMatcherSuggestion = getBestSimilarityMatcherSuggestion(childTag, allowedChildren);

            let message = `Element <${childTag}> not allowed in <${parentTag}>`;

            if (bestSimilarityMatcherSuggestion) {
              message += `. Did you mean <${bestSimilarityMatcherSuggestion}>?`;
            }

            message += `. Allowed children: ${allowedChildren.join(", ")}`;

            analysisReport.addIssue(
              "INVALID_CHILD_ELEMENT",
              message,
              getNodeRange(child),
              currentContext,
              elementSimilarityMatchers.map((similarityMatcher) => similarityMatcher.suggestion)
            );
          }
        } else if (isJsxFragment(child)) {
          // TODO: Recursively validate fragment children
          // For now, we allow fragments but should add more specific validation in the future
        } else if (isJsxText(child)) {
          const hasContent = child.value.trim().length > 0;
          if (!hasContent) {
            // Allow whitespace-only text nodes (very common in JSX formatting)
            continue;
          }
        }
      }

      validationContext.exitElement();
    },
  });

  return analysisReport;
}
