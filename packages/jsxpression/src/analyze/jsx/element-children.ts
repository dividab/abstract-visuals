import type { Program } from "acorn";
import { isJsxElement, isJsxFragment, isJsxLeafNode, isJsxText } from "../../jsx.js";
import { getAllowedChildren, isSelfClosing, type Schema } from "../../schema.js";
import { traverse } from "../../traverse.js";
import { AnalysisReport } from "../analysis-report.js";
import { getBestSimilarityMatcherSuggestion, getElementSimilarityMatchers, getNodeRange } from "../utils.js";
import type { ValidationContext } from "../validation-context.js";

export function analyzeElementChildren(
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

  traverse(ast, {
    JSXElement(node) {
      const parentTag = node.openingElement.name.name;

      validationContext.enterElement(parentTag);

      if (localFunctionNames.has(parentTag)) {
        validationContext.exitElement();
        return;
      }

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

          if (localFunctionNames.has(childTag)) {
            continue;
          }

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
          }
        }
      }

      validationContext.exitElement();
    },
  });

  return analysisReport;
}
