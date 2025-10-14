import type {
  ArrayExpression,
  ArrowFunctionExpression,
  BinaryExpression,
  CallExpression,
  ConditionalExpression,
  Identifier,
  Literal,
  LogicalExpression,
  MemberExpression,
  ObjectExpression,
  UnaryExpression,
} from "acorn";

export type JSXStringLiteral = {
  type: "Literal";
  value: string;
};

export type JSXNumberLiteral = {
  type: "Literal";
  value: number;
};

export type JSXBooleanLiteral = {
  type: "Literal";
  value: boolean;
};

export type JSXNullLiteral = {
  type: "Literal";
  value: null;
};

export type JSXLiteral = JSXStringLiteral | JSXNumberLiteral | JSXBooleanLiteral | JSXNullLiteral;

export type JSXAttributeValue = JSXLiteral | JSXExpressionContainer;

export type JSXNameNode =
  | { type: "JSXIdentifier"; name: string }
  | { type: "JSXMemberExpression"; object: JSXNameNode; property: JSXNameNode };

export type JSXAttribute = {
  type: "JSXAttribute";
  name: {
    name: string;
  };
  value?: JSXAttributeValue;
};

export type JSXSpreadAttribute = {
  type: "JSXSpreadAttribute";
  argument: JSXNode;
};

export type JSXOpeningElement = {
  type: "JSXOpeningElement";
  name: {
    name: string;
  };
  attributes: (JSXAttribute | JSXSpreadAttribute)[];
};

export type JSXClosingElement = {
  type: "JSXClosingElement";
  name: { name: string };
};

export type JSXElement = {
  type: "JSXElement";
  openingElement: JSXOpeningElement;
  closingElement?: JSXClosingElement;
  children: JSXNode[];
};

export type JSXFragment = {
  type: "JSXFragment";
  children: JSXNode[];
};

export type JSXText = {
  type: "JSXText";
  value: string;
};

export type JSXEmptyExpression = {
  type: "JSXEmptyExpression";
  start: number;
  end: number;
};

export type JSXExpression =
  | ArrayExpression
  | ArrowFunctionExpression
  | BinaryExpression
  | CallExpression
  | ConditionalExpression
  | Identifier
  | JSXElement
  | JSXFragment
  | Literal
  | LogicalExpression
  | MemberExpression
  | ObjectExpression
  | UnaryExpression;

export type JSXExpressionContainer = {
  type: "JSXExpressionContainer";
  expression: JSXExpression | JSXEmptyExpression;
};

export type JSXNode = JSXElement | JSXFragment | JSXText | JSXEmptyExpression | JSXExpressionContainer;

export type JSXRoot = JSXElement | JSXFragment | JSXExpressionContainer;

export type JSXNodeWithChildren = JSXElement | JSXFragment;
export type JSXLeafNode = JSXText | JSXEmptyExpression;

export type JSXExpressionHost = JSXExpressionContainer;

export type GetAttributeValue<T extends JSXAttribute> = T["value"];

export function isJsxElement(value: unknown): value is JSXElement {
  return (value as JSXElement)?.type === "JSXElement";
}

export function isJsxFragment(value: unknown): value is JSXFragment {
  return (value as JSXFragment)?.type === "JSXFragment";
}

export function isJsxRoot(value: unknown): value is JSXRoot {
  return isJsxElement(value) || isJsxFragment(value) || isJsxExpressionContainer(value);
}

export function isJsxAttribute(value: unknown): value is JSXAttribute {
  return (value as JSXAttribute)?.type === "JSXAttribute";
}

export function isJsxLiteral(value: unknown): value is JSXLiteral {
  return (value as JSXLiteral)?.type === "Literal";
}

export function isJsxExpressionContainer(value: unknown): value is JSXExpressionContainer {
  return (value as JSXExpressionContainer)?.type === "JSXExpressionContainer";
}

export function isJsxEmptyExpression(value: unknown): value is JSXEmptyExpression {
  return (value as JSXEmptyExpression)?.type === "JSXEmptyExpression";
}

export function isJsxText(value: unknown): value is JSXText {
  return (value as JSXText)?.type === "JSXText";
}

export function isJsxNodeWithChildren(value: JSXNode): value is JSXNodeWithChildren {
  return isJsxElement(value) || isJsxFragment(value);
}

export function isJsxLeafNode(value: JSXNode): value is JSXLeafNode {
  return (value as JSXText)?.type === "JSXText" || isJsxEmptyExpression(value);
}
