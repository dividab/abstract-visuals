import type { Expression, PrivateIdentifier, Program, Super, Identifier, Literal } from "acorn";

import {
  isJsxElement,
  isJsxFragment,
  isJsxRoot,
  isJsxText,
  isJsxExpressionContainer,
  isJsxEmptyExpression,
  type JSXRoot,
  type JSXElement,
  type JSXFragment,
  type JSXEmptyExpression,
  type JSXNode,
  type JSXAttribute,
  type JSXSpreadAttribute,
  type JSXNameNode,
} from "../jsx.js";
import { CompilationError } from "./compilation-error.js";

type CompilableExpression = Expression | PrivateIdentifier | Super | JSXElement | JSXFragment | JSXEmptyExpression;

export function compile(ast: Program): string {
  const root = getRoot(ast);
  const code = emitJsxRoot(root);

  return `"use strict";return ${code};`;
}

function getRoot(ast: Program): JSXRoot {
  for (const declaration of ast.body) {
    if (declaration.type === "ExpressionStatement" && isJsxRoot(declaration.expression)) {
      return declaration.expression;
    }
    if (declaration.type === "ReturnStatement" && declaration.argument && isJsxRoot(declaration.argument)) {
      return declaration.argument;
    }
    // Handle bare expressions like {data.user.name} which parse as BlockStatement
    if (declaration.type === "BlockStatement" && declaration.body.length === 1) {
      const innerStatement = declaration.body[0];
      if (innerStatement.type === "ExpressionStatement") {
        // Create a synthetic JSXExpressionContainer for the bare expression
        const syntheticContainer = {
          type: "JSXExpressionContainer" as const,
          expression: innerStatement.expression as CompilableExpression,
        };
        return syntheticContainer as JSXRoot;
      }
    }
  }

  throw CompilationError.fromNode("No root JSX element/fragment/expression found", ast);
}

function emitJsxRoot(node: JSXRoot): string {
  if (isJsxElement(node)) {
    return emitJsxElement(node);
  }
  if (isJsxFragment(node)) {
    return emitJsxFragment(node);
  }
  // Handle bare expression containers like {data.user.name}
  return emitExpression(node.expression);
}

function emitJsxElement(node: JSXElement): string {
  const name = emitJsxName(node.openingElement.name as JSXNameNode);
  const attributes = emitAttributes(node.openingElement.attributes);
  const children = emitJsxChildren(node.children);

  if (children.length > 0) {
    return `h(${name}, ${attributes}, ${children.join(", ")})`;
  }

  return `h(${name}, ${attributes})`;
}

function emitJsxFragment(node: JSXFragment): string {
  const children = emitJsxChildren(node.children);
  return `[${children.join(", ")}]`;
}

function emitJsxName(nameNode: JSXNameNode): string {
  switch (nameNode.type) {
    case "JSXIdentifier":
      return JSON.stringify(nameNode.name);
    case "JSXMemberExpression": {
      const left = emitJsxName(nameNode.object);
      const right = emitJsxName(nameNode.property);
      return JSON.stringify(JSON.parse(left) + "." + JSON.parse(right));
    }
    default:
      throw CompilationError.fromNode(`Unsupported JSX name: ${(nameNode as any).type}`, nameNode);
  }
}

function emitAttributes(attributes: (JSXAttribute | JSXSpreadAttribute)[]): string {
  const parts: string[] = [];
  let currentObj: string[] = [];

  const flushCurrent = (): void => {
    if (currentObj.length) {
      parts.push(`{ ${currentObj.join(", ")} }`);
      currentObj = [];
    }
  };

  for (const attribute of attributes) {
    if (attribute.type === "JSXSpreadAttribute") {
      flushCurrent();
      parts.push(`(${emitExpression(attribute.argument as CompilableExpression)})`);
      continue;
    }

    if (attribute.type !== "JSXAttribute") {
      throw CompilationError.fromNode("Only simple JSX attributes allowed", attribute);
    }

    const key = attribute.name?.name as string;

    let value: string;
    if (!attribute.value) {
      value = "true";
    } else if (attribute.value.type === "Literal") {
      value = JSON.stringify(attribute.value.value);
    } else if (attribute.value.type === "JSXExpressionContainer") {
      value = emitExpression(attribute.value.expression as CompilableExpression);
    } else {
      throw CompilationError.fromNode("Unsupported attribute value", attribute.value);
    }

    currentObj.push(`${key}: ${value}`);
  }

  flushCurrent();

  if (parts.length === 0) {
    return "null";
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return `Object.assign({}, ${parts.join(", ")})`;
}

function emitJsxChildren(children: JSXNode[]): string[] {
  const result: string[] = [];

  for (const child of children) {
    if (isJsxText(child)) {
      const text = normalizeJsxText(child.value);
      if (text) {
        result.push(JSON.stringify(text));
      }
    } else if (isJsxExpressionContainer(child)) {
      // Skip empty expressions {} - they don't contribute any content
      if (!isJsxEmptyExpression(child.expression)) {
        result.push(emitExpression(child.expression as CompilableExpression));
      }
    } else if (isJsxElement(child)) {
      result.push(emitJsxElement(child));
    } else if (isJsxFragment(child)) {
      result.push(emitJsxFragment(child));
    }
  }

  return result;
}

const TRAILING_PLUS_RX = /\+\s*\+\s*$/;

function emitExpression(node: CompilableExpression): string {
  switch (node.type) {
    case "Literal":
      return JSON.stringify(node.value);
    case "Identifier":
      return node.name;
    case "TemplateLiteral": {
      const bits: string[] = [];
      node.quasis.forEach((quasi, index) => {
        bits.push(JSON.stringify(quasi.value.cooked ?? ""));

        if (node.expressions.length > index) {
          bits.push(`+(${emitExpression(node.expressions[index])})+`);
        }
      });

      return bits.join("").replace(TRAILING_PLUS_RX, "") || '""';
    }
    case "ParenthesizedExpression":
      return `(${emitExpression(node.expression)})`;
    case "UnaryExpression":
      return `${node.operator}${emitExpression(node.argument)}`;
    case "BinaryExpression":
    case "LogicalExpression":
      return `(${emitExpression(node.left)} ${node.operator} ${emitExpression(node.right)})`;
    case "ConditionalExpression":
      return `(${emitExpression(node.test)}?${emitExpression(node.consequent)}:${emitExpression(node.alternate)})`;
    case "ArrayExpression":
      return `[${node.elements
        .map((element) => {
          if (!element) {
            return "undefined";
          }
          if (element.type === "SpreadElement") {
            return `...${emitExpression(element.argument as CompilableExpression)}`;
          }
          return emitExpression(element as CompilableExpression);
        })
        .join(", ")}]`;
    case "ObjectExpression": {
      const keyValuePairs = node.properties
        .map((property) => {
          if (property.type === "SpreadElement") {
            return `...${emitExpression(property.argument as CompilableExpression)}`;
          }
          // analyze() ensures these are simple properties
          const prop = property as any; // analyze() guarantees Property type
          const key = getAstKeyString(prop.key as Identifier | Literal);
          return `${key}: ${emitExpression(prop.value)}`;
        })
        .join(", ");
      return `{ ${keyValuePairs} }`;
    }
    case "MemberExpression": {
      const obj = emitExpression(node.object);
      let prop: string;
      if (node.computed) {
        prop = `[${emitExpression(node.property)}]`;
      } else {
        prop = `.${getAstKeyString(node.property as Identifier | Literal)}`;
      }
      return `${obj}${prop}`;
    }
    case "CallExpression": {
      const callee = emitExpression(node.callee);
      const args = node.arguments
        .map((argument) => {
          if (argument.type === "SpreadElement") {
            return `...${emitExpression(argument.argument as CompilableExpression)}`;
          }
          return emitExpression(argument as CompilableExpression);
        })
        .join(", ");
      return `${callee}(${args})`;
    }
    case "ArrowFunctionExpression": {
      const params = node.params.map((param) => emitExpression(param as CompilableExpression)).join(", ");
      // analyze() ensures this is not a BlockStatement
      const body = emitExpression(node.body as CompilableExpression);
      return `(${params}) => ${body}`;
    }
    case "JSXElement":
      return emitJsxElement(node);
    case "JSXFragment":
      return emitJsxFragment(node);
    case "JSXEmptyExpression":
      return "null";
    default:
      throw CompilationError.fromNode(`Unsupported expression: ${node?.type}`, node);
  }
}

function getAstKeyString(node: Identifier | Literal): string {
  if (node.type === "Identifier") {
    return node.name;
  } else if (node.type === "Literal") {
    return JSON.stringify(node.value);
  } else {
    // This should never happen due to type constraints but
    // if JSX ever changes this could be possible!
    throw CompilationError.fromNode("Unsupported key type", node);
  }
}

const WHITESPACE_COLLAPSER_RX = /\s+/g;

function normalizeJsxText(value: string): string {
  return value.replace(WHITESPACE_COLLAPSER_RX, " ").trim();
}
