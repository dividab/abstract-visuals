import type {
  AnyNode,
  ArrowFunctionExpression,
  FunctionDeclaration,
  Identifier,
  Program,
} from "acorn";
import { getBuiltinGlobals } from "../../builtins.js";
import type { Schema } from "../../schema.js";
import { traverse } from "../../traverse.js";
import { AnalysisReport } from "../analysis-report.js";
import { getNodeRange } from "../utils.js";
import type { ValidationContext } from "../validation-context.js";

export function analyzeIdentifiers(
  ast: Program,
  schema: Schema,
  validationContext: ValidationContext
): AnalysisReport {
  const analysisReport = new AnalysisReport();
  const arrowParamScopes = getArrowParamScopes(ast);
  const functionParamScopes = getFunctionParamScopes(ast);
  const functionLocalConsts = getFunctionLocalConsts(ast);
  const parentMap = buildParentMap(ast);

  const constNames = getTopLevelConstNames(ast);
  const functionNames = getTopLevelFunctionNames(ast);
  const schemaFunctionNames = Object.keys(schema.functions ?? {});

  traverse(ast, {
    Identifier(node: Identifier) {
      const { name } = node;

      const parent = parentMap.get(node);
      if (parent?.type === "MemberExpression" && parent.property === node && !parent.computed) {
        return;
      }
      if (parent?.type === "Property" && parent.key === node && !parent.computed) {
        return;
      }
      if (parent?.type === "VariableDeclarator" && parent.id === node) {
        return;
      }
      if (parent?.type === "FunctionDeclaration" && parent.id === node) {
        return;
      }

      const dataKeys = Object.keys(schema.data ?? {});
      const allowedRoots = [
        "props",
        ...dataKeys,
        ...getBuiltinGlobals(),
        ...constNames,
        ...functionNames,
        ...schemaFunctionNames,
      ];

      if (allowedRoots.includes(name)) {
        return;
      }

      const scopeParent = findScopeParent(node, ast);

      if (scopeParent) {
        const params =
          scopeParent.type === "ArrowFunctionExpression"
            ? arrowParamScopes.get(scopeParent)
            : functionParamScopes.get(scopeParent as FunctionDeclaration);
        if (params?.has(name)) {
          return;
        }

        if (scopeParent.type === "FunctionDeclaration") {
          const localConsts = functionLocalConsts.get(scopeParent as FunctionDeclaration);
          if (localConsts?.has(name)) {
            return;
          }
        }
      }

      analysisReport.addIssue(
        "IDENTIFIER_NOT_ALLOWED",
        `Identifier "${name}" not allowed`,
        getNodeRange(node),
        validationContext.getSnapshot(),
        allowedRoots
      );
    },
  });

  return analysisReport;
}

function getArrowParamScopes(ast: Program): Map<ArrowFunctionExpression, Set<string>> {
  const arrowParamScopes = new Map<ArrowFunctionExpression, Set<string>>();
  traverse(ast, {
    ArrowFunctionExpression(node) {
      const { params } = node;
      if (Array.isArray(params)) {
        const paramNames = new Set<string>();
        params.forEach((p) => {
          collectParamNames(p, paramNames);
        });
        arrowParamScopes.set(node, paramNames);
      }
    },
  });
  return arrowParamScopes;
}

function getFunctionParamScopes(ast: Program): Map<FunctionDeclaration, Set<string>> {
  const functionParamScopes = new Map<FunctionDeclaration, Set<string>>();
  traverse(ast, {
    FunctionDeclaration(node) {
      const paramNames = new Set<string>();
      for (const param of node.params) {
        collectParamNames(param, paramNames);
      }
      functionParamScopes.set(node as FunctionDeclaration, paramNames);
    },
  });
  return functionParamScopes;
}

function getFunctionLocalConsts(ast: Program): Map<FunctionDeclaration, Set<string>> {
  const map = new Map<FunctionDeclaration, Set<string>>();
  traverse(ast, {
    FunctionDeclaration(node) {
      const names = new Set<string>();
      const body = (node as FunctionDeclaration).body;
      if (body?.type === "BlockStatement") {
        for (const stmt of body.body) {
          if (stmt.type === "VariableDeclaration" && stmt.kind === "const") {
            for (const decl of stmt.declarations) {
              if (decl.id.type === "Identifier") {
                names.add(decl.id.name);
              }
            }
          }
        }
      }
      map.set(node as FunctionDeclaration, names);
    },
  });
  return map;
}

function collectParamNames(param: AnyNode, names: Set<string>): void {
  switch (param.type) {
    case "Identifier":
      names.add((param as Identifier).name);
      break;
    case "ObjectPattern":
      for (const prop of (param as any).properties) {
        if (prop.type === "RestElement") {
          collectParamNames(prop.argument, names);
        } else {
          collectParamNames(prop.value, names);
        }
      }
      break;
    case "ArrayPattern":
      for (const el of (param as any).elements) {
        if (el) collectParamNames(el, names);
      }
      break;
    case "AssignmentPattern":
      collectParamNames((param as any).left, names);
      break;
    case "RestElement":
      collectParamNames((param as any).argument, names);
      break;
  }
}

function getTopLevelConstNames(ast: Program): string[] {
  const names: string[] = [];
  for (const stmt of ast.body) {
    if (stmt.type === "VariableDeclaration" && stmt.kind === "const") {
      for (const decl of stmt.declarations) {
        if (decl.id.type === "Identifier") {
          names.push(decl.id.name);
        }
      }
    }
  }
  return names;
}

function getTopLevelFunctionNames(ast: Program): string[] {
  const names: string[] = [];
  for (const stmt of ast.body) {
    if (stmt.type === "FunctionDeclaration" && stmt.id) {
      names.push(stmt.id.name);
    }
  }
  return names;
}

function findScopeParent(
  targetNode: AnyNode,
  rootNode: AnyNode
): ArrowFunctionExpression | FunctionDeclaration | null {
  let found: ArrowFunctionExpression | FunctionDeclaration | null = null;

  function walk(node: AnyNode): boolean {
    if (node === targetNode) {
      return true;
    }

    const isScope =
      node.type === "ArrowFunctionExpression" ||
      node.type === "FunctionDeclaration";

    if (isScope) {
      found = node as ArrowFunctionExpression | FunctionDeclaration;
    }

    for (const key of Object.keys(node)) {
      const value = (node as any)[key];

      if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          for (const item of value) {
            if (item && typeof item === "object" && walk(item)) {
              return true;
            }
          }
        } else if (walk(value)) {
          return true;
        }
      }
    }

    if (isScope) {
      found = null;
    }

    return false;
  }

  walk(rootNode);
  return found;
}

function buildParentMap(ast: Program): Map<any, any> {
  const parentMap = new Map<any, any>();

  function visit(node: any, parent: any): void {
    if (!node || typeof node !== "object") return;
    if (node.type) {
      parentMap.set(node, parent);
    }
    for (const key of Object.keys(node)) {
      const value = node[key];
      if (value && typeof value === "object") {
        if (Array.isArray(value)) {
          for (const child of value) {
            if (child && typeof child === "object" && child.type) {
              visit(child, node);
            }
          }
        } else if (value.type) {
          visit(value, node);
        }
      }
    }
  }

  visit(ast, null);
  return parentMap;
}
