import type { JSONSchema7, JSONSchema7Definition } from "json-schema";
import { enumValues, keys, resolve, types } from "../../json-schema.js";

/** The TypeScript names of a schema's $defs by their keys: each key made an identifier, numbered if another one is the same */
export function definitionNames(root: JSONSchema7Definition | undefined): Readonly<Record<string, string>> {
  const defs = typeof root === "object" ? Object.keys(root.$defs ?? {}) : [];
  return defs.reduce<Record<string, string>>((names, key) => {
    const identifier = key.replace(/[^\w$]/g, "_");
    const base = /^[A-Za-z_$]/.test(identifier) ? identifier : `_${identifier}`;
    const taken = new Set(Object.values(names));
    const name = taken.has(base) ? `${base}${[...Array(taken.size + 2).keys()].find((i) => i >= 2 && !taken.has(`${base}${i}`))}` : base;
    return { ...names, [key]: name };
  }, {});
}

/**
 * The TypeScript type of a JSON schema within root: a $ref to one of root's $defs its name in names, any other $ref written out, anyOf and oneOf a
 * union, allOf an intersection, an object's properties its keys, optional unless required, and its additionalProperties an index signature, or with
 * propertyNames that list them, the keys they list
 */
export function typeScriptType(
  schema: JSONSchema7Definition,
  root: JSONSchema7Definition,
  names: Readonly<Record<string, string>>,
  depth: number = 0,
  refs: ReadonlySet<string> = new Set()
): string {
  if (typeof schema === "boolean") {
    return schema ? "any" : "never";
  }
  if (schema.$ref !== undefined) {
    const name = schema.$ref.startsWith("#/$defs/") ? names[decodeSegment(schema.$ref.slice("#/$defs/".length))] : undefined;
    if (name !== undefined) {
      return name;
    }
    // A $ref back to a schema being written, which only a $def's name could refer to
    return refs.has(schema.$ref) ? "any" : typeScriptType(resolve(schema, root), root, names, depth, new Set([...refs, schema.$ref]));
  }

  const alternatives = schema.anyOf ?? schema.oneOf;
  if (alternatives !== undefined) {
    return [...new Set(alternatives.map((s) => typeScriptType(s, root, names, depth, refs)))].join(" | ");
  }
  if (schema.allOf !== undefined) {
    const { allOf, ...own } = schema;
    const members = [...(hasConstraints(own) ? [own] : []), ...allOf].map((s) => typeScriptType(s, root, names, depth, refs));
    return [...new Set(members)].map(parenthesize).join(" & ");
  }
  if (schema.const !== undefined) {
    return JSON.stringify(schema.const);
  }
  if (schema.enum !== undefined) {
    return schema.enum.map((value) => JSON.stringify(value)).join(" | ");
  }

  const typeNames = [...types(schema, root)];
  if (typeNames.length === 0) {
    return "any";
  }
  const typeOf = (typeName: string): string => {
    switch (typeName) {
      case "string":
      case "boolean":
      case "null":
        return typeName;
      case "number":
      case "integer":
        return "number";
      case "array":
        return Array.isArray(schema.items)
          ? `[${schema.items.map((s) => typeScriptType(s, root, names, depth, refs)).join(", ")}]`
          : `${parenthesize(schema.items === undefined ? "any" : typeScriptType(schema.items, root, names, depth, refs))}[]`;
      case "object":
        return objectType(schema, root, names, depth, refs);
      default:
        return "any";
    }
  };
  return [...new Set(typeNames.map(typeOf))].join(" | ");
}

function objectType(
  schema: JSONSchema7,
  root: JSONSchema7Definition,
  names: Readonly<Record<string, string>>,
  depth: number,
  refs: ReadonlySet<string>
): string {
  const indent = "  ".repeat(depth + 2);
  // An object with neither properties nor additionalProperties can have any, one with properties only those, as json-schema.ts reads it
  const additional = schema.additionalProperties ?? (schema.properties === undefined ? true : undefined);
  const additionalType = additional === undefined || additional === false ? undefined : typeScriptType(additional, root, names, depth + 1, refs);
  // The names propertyNames list, only those if it enumerates them, else besides any other, declared as there, like a product's properties in a
  // node, while any other name is through the index signature, which an editor with noUncheckedIndexedAccess types as possibly undefined
  const listed = schema.propertyNames === undefined ? [] : keys({ propertyNames: schema.propertyNames }, root);
  const closed = schema.propertyNames !== undefined && enumValues(schema.propertyNames, root) !== undefined;
  const properties = Object.entries(schema.properties ?? {}).map(
    ([key, value]) =>
      `${jsDoc(value, root, indent)}${indent}${formatKey(key)}${schema.required?.includes(key) === true ? "" : "?"}: ${typeScriptType(value, root, names, depth + 1, refs)};\n`
  );
  const additionalLines =
    additionalType === undefined
      ? []
      : [
          ...listed.filter((key) => schema.properties?.[key] === undefined).map((key) => `${indent}${formatKey(key)}: ${additionalType};\n`),
          ...(closed ? [] : [`${indent}[key: string]: ${additionalType};\n`]),
        ];
  return `{\n${[...properties, ...additionalLines].join("")}${"  ".repeat(depth + 1)}}`;
}

/** A JSDoc comment of a schema's description and default, empty if it has neither */
export function jsDoc(schema: JSONSchema7Definition, root: JSONSchema7Definition, indent: string): string {
  if (typeof schema === "boolean") {
    return "";
  }
  const resolved = resolve(schema, root);
  const comments = [
    ...(resolved.description !== undefined ? [resolved.description] : []),
    ...(resolved.default !== undefined ? [`@default ${JSON.stringify(resolved.default)}`] : []),
  ];
  if (comments.length === 0) {
    return "";
  }
  return comments.length === 1
    ? `${indent}/** ${comments[0]} */\n`
    : `${indent}/**\n${comments.map((c) => `${indent} * ${c}\n`).join("")}${indent} */\n`;
}

function hasConstraints(schema: JSONSchema7): boolean {
  return Object.keys(schema).some((key) => key !== "description" && key !== "title" && key !== "default" && key !== "$id" && key !== "$defs");
}

function parenthesize(type: string): string {
  return type.includes("|") || type.includes("&") ? `(${type})` : type;
}

function decodeSegment(segment: string): string {
  return decodeURIComponent(segment).replaceAll("~1", "/").replaceAll("~0", "~");
}

export function formatKey(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : JSON.stringify(key);
}
