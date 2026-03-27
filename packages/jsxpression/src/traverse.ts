import type { Program } from "acorn";
import { base, type RecursiveVisitors, type SimpleVisitors, simple } from "acorn-walk";
import {
  isJsxEmptyExpression,
  isJsxText,
  type JSXAttribute,
  type JSXElement,
  type JSXExpressionContainer,
  type JSXFragment,
  type JSXOpeningElement,
  type JSXSpreadAttribute,
} from "./jsx.js";

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

const tsNodeTypes = [
  "TSInterfaceDeclaration",
  "TSInterfaceBody",
  "TSTypeAliasDeclaration",
  "TSTypeAnnotation",
  "TSTypeReference",
  "TSTypeParameterDeclaration",
  "TSTypeParameterInstantiation",
  "TSTypeParameter",
  "TSAsExpression",
  "TSSatisfiesExpression",
  "TSNonNullExpression",
  "TSTypeAssertion",
  "TSEnumDeclaration",
  "TSEnumMember",
  "TSModuleDeclaration",
  "TSModuleBlock",
  "TSImportEqualsDeclaration",
  "TSExportAssignment",
  "TSNamespaceExportDeclaration",
  "TSDeclareFunction",
  "TSDeclareMethod",
  "TSExternalModuleReference",
  "TSInstantiationExpression",
  "TSTypeCastExpression",
  "TSParameterProperty",
  "TSIndexSignature",
  "TSCallSignatureDeclaration",
  "TSConstructSignatureDeclaration",
  "TSPropertySignature",
  "TSMethodSignature",
  "TSTypePredicate",
  "TSTypeQuery",
  "TSTypeLiteral",
  "TSTypeOperator",
  "TSMappedType",
  "TSConditionalType",
  "TSInferType",
  "TSImportType",
  "TSExpressionWithTypeArguments",
  "TSQualifiedName",
  "TSFunctionType",
  "TSConstructorType",
  "TSUnionType",
  "TSIntersectionType",
  "TSTupleType",
  "TSNamedTupleMember",
  "TSArrayType",
  "TSOptionalType",
  "TSRestType",
  "TSLiteralType",
  "TSIndexedAccessType",
  "TSParenthesizedType",
  "TSAnyKeyword",
  "TSBooleanKeyword",
  "TSBigIntKeyword",
  "TSNeverKeyword",
  "TSNullKeyword",
  "TSNumberKeyword",
  "TSObjectKeyword",
  "TSStringKeyword",
  "TSSymbolKeyword",
  "TSUndefinedKeyword",
  "TSUnknownKeyword",
  "TSVoidKeyword",
  "TSThisType",
] as const;

const tsWalkers: Record<string, (node: any, state: any, c: any) => void> = {};
for (const nodeType of tsNodeTypes) {
  tsWalkers[nodeType] = () => {};
}

const jsxWalkers: ExtendedRecursiveVisitors = {
  JSXElement(node, state, visit) {
    const element = node as JSXElement;
    visit(element.openingElement, state);
    for (const child of element.children) {
      if (isJsxText(child) || isJsxEmptyExpression(child)) {
        continue;
      }
      visit(child as any, state);
    }
  },

  JSXFragment(node, state, visit) {
    const fragment = node as JSXFragment;
    for (const child of fragment.children) {
      if (isJsxText(child) || isJsxEmptyExpression(child)) {
        continue;
      }
      visit(child as any, state);
    }
  },

  JSXOpeningElement(node, state, visit) {
    const opening = node as JSXOpeningElement;
    for (const attr of opening.attributes) {
      visit(attr as any, state);
    }
  },

  JSXAttribute(node, state, visit) {
    const attr = node as JSXAttribute;
    if (attr.value) {
      visit(attr.value as any, state);
    }
  },

  JSXSpreadAttribute(node, state, visit) {
    const spread = node as JSXSpreadAttribute;
    visit(spread.argument as any, state);
  },

  JSXExpressionContainer(node, state, visit) {
    const container = node as JSXExpressionContainer;
    if (!isJsxEmptyExpression(container.expression)) {
      visit(container.expression as any, state);
    }
  },
};

export function traverse(ast: Program, visitors: ExtendedSimpleVisitors): void {
  simple(ast, visitors as SimpleVisitors<unknown>, {
    ...base,
    ...jsxWalkers,
    ...tsWalkers,
  });
}
