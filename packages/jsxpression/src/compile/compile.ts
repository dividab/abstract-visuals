import type {
  BlockStatement,
  Expression,
  FunctionDeclaration,
  Identifier,
  Literal,
  Pattern,
  PrivateIdentifier,
  Program,
  Statement,
  Super,
  VariableDeclaration,
} from "acorn";

import {
  isJsxElement,
  isJsxEmptyExpression,
  isJsxExpressionContainer,
  isJsxFragment,
  isJsxRoot,
  isJsxText,
  type JSXAttribute,
  type JSXElement,
  type JSXEmptyExpression,
  type JSXFragment,
  type JSXNameNode,
  type JSXNode,
  type JSXRoot,
  type JSXSpreadAttribute,
} from "../jsx.js";
import { CompilationError } from "./compilation-error.js";

type CompilableExpression = Expression | PrivateIdentifier | Super | JSXElement | JSXFragment | JSXEmptyExpression;

export function compile(ast: Program): string {
  const localFunctions = new Set<string>();
  for (const stmt of ast.body) {
    if (stmt.type === "FunctionDeclaration" && stmt.id) {
      localFunctions.add(stmt.id.name);
    }
  }

  const parts: string[] = ['"use strict";'];

  const hasDeclarations = ast.body.some((s) => s.type === "VariableDeclaration" || s.type === "FunctionDeclaration");

  for (const statement of ast.body) {
    if (statement.type === "VariableDeclaration") {
      parts.push(emitVariableDeclaration(statement, localFunctions));
    } else if (statement.type === "FunctionDeclaration") {
      parts.push(emitFunctionDeclaration(statement as FunctionDeclaration, localFunctions));
    } else if (statement.type === "ReturnStatement" && statement.argument && isJsxRoot(statement.argument)) {
      parts.push(`return ${emitJsxRoot(statement.argument, localFunctions)};`);
    } else if (!hasDeclarations && statement.type === "ExpressionStatement" && isJsxRoot(statement.expression)) {
      parts.push(`return ${emitJsxRoot(statement.expression, localFunctions)};`);
    } else if (!hasDeclarations && statement.type === "BlockStatement" && statement.body.length === 1) {
      const innerStatement = statement.body[0];
      if (innerStatement.type === "ExpressionStatement") {
        const syntheticContainer = {
          type: "JSXExpressionContainer" as const,
          expression: innerStatement.expression as CompilableExpression,
        };
        parts.push(`return ${emitJsxRoot(syntheticContainer as JSXRoot, localFunctions)};`);
      }
    }
  }

  return parts.join("");
}

function emitJsxRoot(node: JSXRoot, localFunctions: Set<string>): string {
  if (isJsxElement(node)) {
    return emitJsxElement(node, localFunctions);
  }
  if (isJsxFragment(node)) {
    return emitJsxFragment(node, localFunctions);
  }
  return emitExpression(node.expression, localFunctions);
}

function emitJsxElement(node: JSXElement, localFunctions: Set<string>): string {
  const name = emitJsxName(node.openingElement.name as JSXNameNode, localFunctions);
  const attributes = emitAttributes(node.openingElement.attributes, localFunctions);
  const children = emitJsxChildren(node.children, localFunctions);

  if (children.length > 0) {
    return `h(${name}, ${attributes}, ${children.join(", ")})`;
  }

  return `h(${name}, ${attributes})`;
}

function emitJsxFragment(node: JSXFragment, localFunctions: Set<string>): string {
  const children = emitJsxChildren(node.children, localFunctions);
  return `[${children.join(", ")}]`;
}

function emitJsxName(nameNode: JSXNameNode, localFunctions: Set<string>): string {
  switch (nameNode.type) {
    case "JSXIdentifier":
      if (localFunctions.has(nameNode.name)) {
        return nameNode.name;
      }
      return JSON.stringify(nameNode.name);
    case "JSXMemberExpression": {
      const left = emitJsxName(nameNode.object, localFunctions);
      const right = emitJsxName(nameNode.property, localFunctions);
      return JSON.stringify(JSON.parse(left) + "." + JSON.parse(right));
    }
    default:
      throw CompilationError.fromNode(`Unsupported JSX name: ${(nameNode as any).type}`, nameNode);
  }
}

function emitAttributes(attributes: (JSXAttribute | JSXSpreadAttribute)[], localFunctions: Set<string>): string {
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
      parts.push(`(${emitExpression(attribute.argument as CompilableExpression, localFunctions)})`);
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
      value = emitExpression(attribute.value.expression as CompilableExpression, localFunctions);
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

function emitJsxChildren(children: JSXNode[], localFunctions: Set<string>): string[] {
  const result: string[] = [];

  for (const child of children) {
    if (isJsxText(child)) {
      const text = normalizeJsxText(child.value);
      if (text) {
        result.push(JSON.stringify(text));
      }
    } else if (isJsxExpressionContainer(child)) {
      if (!isJsxEmptyExpression(child.expression)) {
        result.push(emitExpression(child.expression as CompilableExpression, localFunctions));
      }
    } else if (isJsxElement(child)) {
      result.push(emitJsxElement(child, localFunctions));
    } else if (isJsxFragment(child)) {
      result.push(emitJsxFragment(child, localFunctions));
    }
  }

  return result;
}

const TRAILING_PLUS_RX = /\+\s*\+\s*$/;

function emitExpression(node: CompilableExpression, localFunctions: Set<string>): string {
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
          bits.push(`+(${emitExpression(node.expressions[index], localFunctions)})+`);
        }
      });
      return bits.join("").replace(TRAILING_PLUS_RX, "") || '""';
    }
    case "ParenthesizedExpression":
      return `(${emitExpression(node.expression, localFunctions)})`;
    case "UnaryExpression":
      return `${node.operator}${emitExpression(node.argument, localFunctions)}`;
    case "BinaryExpression":
    case "LogicalExpression":
      return `(${emitExpression(node.left, localFunctions)} ${node.operator} ${emitExpression(
        node.right,
        localFunctions
      )})`;
    case "ConditionalExpression":
      return `(${emitExpression(node.test, localFunctions)}?${emitExpression(
        node.consequent,
        localFunctions
      )}:${emitExpression(node.alternate, localFunctions)})`;
    case "ArrayExpression":
      return `[${node.elements
        .map((element) => {
          if (!element) {
            return "undefined";
          }
          if (element.type === "SpreadElement") {
            return `...${emitExpression(element.argument as CompilableExpression, localFunctions)}`;
          }
          return emitExpression(element as CompilableExpression, localFunctions);
        })
        .join(", ")}]`;
    case "ObjectExpression": {
      const keyValuePairs = node.properties
        .map((property) => {
          if (property.type === "SpreadElement") {
            return `...${emitExpression(property.argument as CompilableExpression, localFunctions)}`;
          }
          const key = getAstKeyString(property.key as Identifier | Literal);
          return `${key}: ${emitExpression(property.value, localFunctions)}`;
        })
        .join(", ");
      return `{ ${keyValuePairs} }`;
    }
    case "MemberExpression": {
      const obj = emitExpression(node.object, localFunctions);
      let prop: string;
      if (node.computed) {
        prop = `[${emitExpression(node.property, localFunctions)}]`;
      } else {
        prop = `.${getAstKeyString(node.property as Identifier | Literal)}`;
      }
      return `${obj}${prop}`;
    }
    case "CallExpression": {
      const callee = emitExpression(node.callee, localFunctions);
      const args = node.arguments
        .map((argument) => {
          if (argument.type === "SpreadElement") {
            return `...${emitExpression(argument.argument as CompilableExpression, localFunctions)}`;
          }
          return emitExpression(argument as CompilableExpression, localFunctions);
        })
        .join(", ");
      return `${callee}(${args})`;
    }
    case "ArrowFunctionExpression": {
      const params = node.params
        .map((param) => emitExpression(param as CompilableExpression, localFunctions))
        .join(", ");
      const body = emitExpression(node.body as CompilableExpression, localFunctions);
      return `(${params}) => ${body}`;
    }
    case "JSXElement":
      return emitJsxElement(node, localFunctions);
    case "JSXFragment":
      return emitJsxFragment(node, localFunctions);
    case "JSXEmptyExpression":
      return "null";
    default:
      throw CompilationError.fromNode(`Unsupported expression: ${node?.type}`, node);
  }
}

function emitVariableDeclaration(node: VariableDeclaration, localFunctions: Set<string>): string {
  const decls = node.declarations
    .map((d) => {
      const name = (d.id as Identifier).name;
      const init = d.init ? emitExpression(d.init as CompilableExpression, localFunctions) : "undefined";
      return `${name} = ${init}`;
    })
    .join(", ");
  return `const ${decls};`;
}

function emitFunctionDeclaration(node: FunctionDeclaration, localFunctions: Set<string>): string {
  const name = node.id!.name;
  const params = node.params.map((p) => emitParam(p, localFunctions)).join(", ");
  const body = emitFunctionBody(node.body as BlockStatement, localFunctions);
  return `function ${name}(${params}) ${body}`;
}

function emitFunctionBody(body: BlockStatement, localFunctions: Set<string>): string {
  const statements = body.body.map((s) => emitStatement(s, localFunctions));
  return `{ ${statements.join(" ")} }`;
}

function emitStatement(statement: Statement, localFunctions: Set<string>): string {
  switch (statement.type) {
    case "ReturnStatement":
      if (!statement.argument) {
        return "return;";
      }
      return `return ${emitExpression(statement.argument as CompilableExpression, localFunctions)};`;
    case "VariableDeclaration":
      return emitVariableDeclaration(statement, localFunctions);
    case "ExpressionStatement":
      return `${emitExpression(statement.expression as CompilableExpression, localFunctions)};`;
    default:
      throw CompilationError.fromNode(`Unsupported statement: ${statement.type}`, statement);
  }
}

function emitParam(param: Pattern, localFunctions: Set<string>): string {
  switch (param.type) {
    case "Identifier":
      return (param as Identifier).name;
    case "ObjectPattern": {
      const props = (param as any).properties.map((p: any) => {
        if (p.type === "RestElement") {
          return `...${emitParam(p.argument, localFunctions)}`;
        }
        const key = (p.key as Identifier).name;
        if (p.value.type === "AssignmentPattern") {
          return `${key} = ${emitExpression(p.value.right as CompilableExpression, localFunctions)}`;
        }
        if (p.value !== p.key && p.value.type === "Identifier" && p.value.name !== key) {
          return `${key}: ${emitParam(p.value, localFunctions)}`;
        }
        return key;
      });
      return `{ ${props.join(", ")} }`;
    }
    case "AssignmentPattern":
      return `${emitParam((param as any).left, localFunctions)} = ${emitExpression(
        (param as any).right as CompilableExpression,
        localFunctions
      )}`;
    case "RestElement":
      return `...${emitParam((param as any).argument, localFunctions)}`;
    default:
      throw CompilationError.fromNode(`Unsupported parameter: ${param.type}`, param);
  }
}

function getAstKeyString(node: Identifier | Literal): string {
  if (node.type === "Identifier") {
    return node.name;
  } else if (node.type === "Literal") {
    return JSON.stringify(node.value);
  } else {
    throw CompilationError.fromNode("Unsupported key type", node);
  }
}

const WHITESPACE_COLLAPSER_RX = /\s+/g;

function normalizeJsxText(value: string): string {
  return value.replace(WHITESPACE_COLLAPSER_RX, " ").trim();
}
