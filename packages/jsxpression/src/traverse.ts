import { Program } from "acorn";
import { simple, base, SimpleVisitors, RecursiveVisitors } from "acorn-walk";
import {
  JSXAttribute,
  JSXElement,
  JSXExpressionContainer,
  JSXFragment,
  JSXOpeningElement,
  JSXSpreadAttribute,
  isJsxText,
  isJsxEmptyExpression,
} from "./jsx";

type Visit = (node: unknown, state: unknown) => void;
type RecursiveVisitor<T> = (node: T, state: unknown, visit: Visit) => void;
type SimpleVisitor<T> = (node: T, state: unknown) => void;

type ExtendedRecursiveVisitors = RecursiveVisitors<unknown> & {
  JSXAttribute?: RecursiveVisitor<JSXAttribute>;
  JSXElement?: RecursiveVisitor<JSXElement>;
  JSXExpressionContainer?: RecursiveVisitor<JSXExpressionContainer>;
  JSXFragment?: RecursiveVisitor<JSXFragment>;
  JSXOpeningElement?: RecursiveVisitor<JSXOpeningElement>;
  JSXSpreadAttribute?: RecursiveVisitor<JSXSpreadAttribute>;
};

type ExtendedSimpleVisitors = SimpleVisitors<unknown> & {
  JSXAttribute?: SimpleVisitor<JSXAttribute>;
  JSXElement?: SimpleVisitor<JSXElement>;
  JSXExpressionContainer?: SimpleVisitor<JSXExpressionContainer>;
  JSXFragment?: SimpleVisitor<JSXFragment>;
  JSXOpeningElement?: SimpleVisitor<JSXOpeningElement>;
  JSXSpreadAttribute?: SimpleVisitor<JSXSpreadAttribute>;
};

export function traverse(ast: Program, visitors: Partial<ExtendedSimpleVisitors>): void {
  simple(ast, visitors, {
    ...base,
    JSXAttribute(node, state, visit) {
      if (node.value) {
        visit(node.value, state);
      }
    },
    JSXElement(node, state, visit) {
      const { openingElement } = node;
      if (openingElement && Array.isArray(openingElement.attributes)) {
        for (const attribute of openingElement.attributes) {
          visit(attribute, state);
        }
      }
      for (const child of node.children) {
        if (!isJsxText(child)) {
          visit(child, state);
        }
      }
    },
    JSXExpressionContainer(node, state, visit) {
      if (!isJsxEmptyExpression(node.expression)) {
        visit(node.expression, state);
      }
    },
    JSXFragment(node, state, visit) {
      for (const child of node.children) {
        if (!isJsxText(child)) {
          visit(child, state);
        }
      }
    },
    JSXOpeningElement(node, state, visit) {
      for (const attribute of node.attributes) {
        visit(attribute, state);
      }
    },
    JSXSpreadAttribute(node, state, visit) {
      visit(node.argument, state);
    },
  } as ExtendedRecursiveVisitors);
}
