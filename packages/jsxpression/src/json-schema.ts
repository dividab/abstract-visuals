import type { JSONSchema7, JSONSchema7Definition, JSONSchema7Type, JSONSchema7TypeName } from "json-schema";

/** A JSON schema, `true` allowing any value and `false` none */
export type Schema = JSONSchema7Definition;

const ANY: JSONSchema7 = {};
const NOTHING: JSONSchema7 = { not: {} };

/**
 * The schema a schema's $ref leads to, following $refs in turn, within root: "#" is the root and "#/…" a JSON pointer into it, like
 * "#/$defs/component". The referring schema's description and title are kept. A $ref that leads nowhere, or only to $refs back to itself, allows any
 * value.
 */
export function resolve(schema: Schema, root: Schema): JSONSchema7 {
  return resolveVisited(schema, root, new Set());
}

function resolveVisited(schema: Schema, root: Schema, visited: Set<string>): JSONSchema7 {
  if (typeof schema === "boolean") {
    return schema ? ANY : NOTHING;
  }
  const ref = schema.$ref;
  if (ref === undefined) {
    return schema;
  }
  if (visited.has(ref)) {
    return ANY;
  }
  visited.add(ref);
  const target = pointer(root, ref);
  const resolved = target === undefined ? ANY : resolveVisited(target, root, visited);
  const annotations = {
    ...(schema.description !== undefined ? { description: schema.description } : {}),
    ...(schema.title !== undefined ? { title: schema.title } : {}),
  };
  return Object.keys(annotations).length > 0 ? { ...resolved, ...annotations } : resolved;
}

/** The schema at a "#/…" JSON pointer into root, its segments' "~1" and "~~0" being "/" and "~~" */
function pointer(root: Schema, ref: string): Schema | undefined {
  if (!ref.startsWith("#")) {
    return undefined;
  }
  const segments = ref
    .slice(1)
    .split("/")
    .slice(1)
    .map((segment) => decodeURIComponent(segment).replaceAll("~1", "/").replaceAll("~0", "~"));
  return segments.reduce<unknown>(
    (node, segment) => (typeof node === "object" && node !== null && segment in node ? (node as Record<string, unknown>)[segment] : undefined),
    root
  ) as Schema | undefined;
}

// A property an object with properties but without additionalProperties doesn't have, which another of allOf's schemas may have
const CLOSED = Symbol("closed");

/**
 * The schema of a property, or undefined if the schema doesn't allow it: one of its properties, else, if its propertyNames allow the name, its
 * additionalProperties. An object with properties but without additionalProperties doesn't allow other names, as a zod object's schema, while one
 * with neither allows any. One of anyOf's or oneOf's schemas must allow it, and one of allOf's have it while none forbids it, with
 * additionalProperties false or propertyNames, as zod's intersection of two objects.
 */
export function property(schema: Schema, name: string, root: Schema): Schema | undefined {
  const found = propertyOrClosed(schema, name, root);
  return found === CLOSED ? undefined : found;
}

function propertyOrClosed(schema: Schema, name: string, root: Schema): Schema | undefined | typeof CLOSED {
  const resolved = resolve(schema, root);
  const { allOf, anyOf, oneOf, ...own } = resolved;
  const alternatives = anyOf ?? oneOf;
  if (alternatives !== undefined) {
    const found = alternatives.map((s) => property(s, name, root)).filter((s) => s !== undefined);
    return found.length === 0 ? undefined : combine("anyOf", found);
  }
  if (allOf !== undefined) {
    // The schema beside allOf counts only if it says anything
    const members = [...(Object.keys(own).some((key) => !ANNOTATIONS.has(key)) ? [own] : []), ...allOf];
    const found = members.map((s) => propertyOrClosed(s, name, root));
    // A schema that allows any value doesn't add to what the others allow
    const limits = found.filter((s): s is Schema => s !== undefined && s !== CLOSED && s !== ANY && s !== true);
    if (found.some((s) => s === undefined)) {
      return undefined;
    }
    return limits.length > 0 ? combine("allOf", limits) : found.every((s) => s === CLOSED) ? CLOSED : ANY;
  }
  return ownProperty(resolved, name, root);
}

const ANNOTATIONS = new Set(["description", "title", "default", "examples", "$id", "$defs", "$comment"]);

function ownProperty(schema: JSONSchema7, name: string, root: Schema): Schema | undefined | typeof CLOSED {
  const known = schema.properties?.[name];
  if (known !== undefined) {
    return known;
  }
  const typeNames = types(schema, root);
  if ((typeNames.size > 0 && !typeNames.has("object")) || schema === NOTHING) {
    return undefined;
  }
  if (schema.propertyNames !== undefined && !accepts(schema.propertyNames, name, root)) {
    return undefined;
  }
  if (schema.additionalProperties === undefined) {
    return schema.properties === undefined ? ANY : CLOSED;
  }
  return schema.additionalProperties === false ? undefined : schema.additionalProperties;
}

/** Whether a property name is one the schema allows, as far as its enum and const say, a listed number allowing it as text, as JSON's keys are */
function accepts(schema: Schema, value: string, root: Schema): boolean {
  return enumValues(schema, root)?.some((v) => (typeof v === "number" ? String(v) : v) === value) ?? true;
}

/**
 * The known names of an object's properties: its properties' and those its propertyNames list, of each of allOf's, anyOf's and oneOf's schemas. The
 * propertyNames may list names only some of their anyOf's or oneOf's schemas allow, like a table's names, `{ anyOf: [{ $ref: "#/$defs/names" }, {
 * type: "string" }] }`, which allows any name and suggests the table's.
 */
export function keys(schema: Schema, root: Schema): ReadonlyArray<string> {
  const resolved = resolve(schema, root);
  const names = [
    ...Object.keys(resolved.properties ?? {}),
    ...(resolved.propertyNames === undefined
      ? []
      : listedValues(resolved.propertyNames, root).flatMap((v) => (typeof v === "string" ? [v] : typeof v === "number" ? [String(v)] : []))),
    ...[...(resolved.allOf ?? []), ...(resolved.anyOf ?? []), ...(resolved.oneOf ?? [])].flatMap((s) => keys(s, root)),
  ];
  return [...new Set(names)];
}

/** The values a schema lists, or any of its anyOf's or oneOf's schemas, even if another allows any */
function listedValues(schema: Schema, root: Schema): ReadonlyArray<JSONSchema7Type> {
  const resolved = resolve(schema, root);
  return (
    enumValues(resolved, root) ??
    [...(resolved.anyOf ?? []), ...(resolved.oneOf ?? []), ...(resolved.allOf ?? [])].flatMap((s) => listedValues(s, root))
  );
}

/** The schema of an array's items, undefined if the schema isn't an array's; a tuple's items may be any of its items' schemas */
export function items(schema: Schema, root: Schema): Schema | undefined {
  const resolved = resolve(schema, root);
  const { allOf, anyOf, oneOf } = resolved;
  const alternatives = anyOf ?? oneOf;
  if (alternatives !== undefined) {
    const found = alternatives.map((s) => items(s, root)).filter((s) => s !== undefined);
    return found.length === 0 ? undefined : combine("anyOf", found);
  }
  if (allOf !== undefined) {
    const found = allOf.map((s) => items(s, root)).filter((s) => s !== undefined);
    return found.length === 0 ? undefined : combine("allOf", found);
  }
  if (Array.isArray(resolved.items)) {
    return combine("anyOf", resolved.items);
  }
  if (resolved.items !== undefined) {
    return resolved.items;
  }
  return types(resolved, root).has("array") ? ANY : undefined;
}

/**
 * The JSON types a schema's values can have, empty if it doesn't say: its type, else what its keywords imply, like properties an object and an enum
 * its values' types. The types of anyOf's or oneOf's schemas are all possible, of allOf's only those they share.
 */
export function types(schema: Schema, root: Schema): ReadonlySet<JSONSchema7TypeName> {
  const resolved = resolve(schema, root);
  const { allOf, anyOf, oneOf } = resolved;
  const alternatives = anyOf ?? oneOf;
  if (alternatives !== undefined) {
    const each = alternatives.map((s) => types(s, root));
    return each.some((t) => t.size === 0) ? new Set() : new Set(each.flatMap((t) => [...t]));
  }
  const own = ownTypes(resolved);
  if (allOf !== undefined) {
    return (
      [own, ...allOf.map((s) => types(s, root))]
        .filter((t) => t.size > 0)
        .reduce<ReadonlySet<JSONSchema7TypeName> | undefined>(
          (shared, t) => (shared === undefined ? t : new Set([...shared].filter((n) => t.has(n)))),
          undefined
        ) ?? new Set()
    );
  }
  return own;
}

function ownTypes(schema: JSONSchema7): ReadonlySet<JSONSchema7TypeName> {
  if (schema.type !== undefined) {
    return new Set(Array.isArray(schema.type) ? schema.type : [schema.type]);
  }
  const values = schema.enum ?? (schema.const !== undefined ? [schema.const] : undefined);
  if (values !== undefined) {
    return new Set(values.map(typeOf));
  }
  if (schema.properties !== undefined || schema.additionalProperties !== undefined || schema.propertyNames !== undefined) {
    return new Set(["object"]);
  }
  return schema.items !== undefined ? new Set(["array"]) : new Set();
}

function typeOf(value: JSONSchema7Type): JSONSchema7TypeName {
  if (value === null) {
    return "null";
  }
  if (Array.isArray(value)) {
    return "array";
  }
  const type = typeof value;
  return type === "string" || type === "number" || type === "boolean" ? type : "object";
}

/**
 * The values a schema allows if it lists them, with enum or const, those of all of anyOf's or oneOf's schemas, or the first of allOf's that lists
 * them
 */
export function enumValues(schema: Schema, root: Schema): ReadonlyArray<JSONSchema7Type> | undefined {
  const resolved = resolve(schema, root);
  const own = resolved.enum ?? (resolved.const !== undefined ? [resolved.const] : undefined);
  if (own !== undefined) {
    return own;
  }
  const alternatives = resolved.anyOf ?? resolved.oneOf;
  if (alternatives !== undefined) {
    const each = alternatives.map((s) => enumValues(s, root));
    return each.some((v) => v === undefined) ? undefined : [...new Set(each.flatMap((v) => v ?? []))];
  }
  return resolved.allOf?.map((s) => enumValues(s, root)).find((v) => v !== undefined);
}

/** Whether an object's schema requires a property, its own required or one of allOf's schemas' */
export function isRequired(schema: Schema, name: string, root: Schema): boolean {
  const resolved = resolve(schema, root);
  return resolved.required?.includes(name) === true || (resolved.allOf ?? []).some((s) => isRequired(s, name, root));
}

function combine(keyword: "anyOf" | "allOf", schemas: ReadonlyArray<Schema>): Schema {
  const distinct = [...new Set(schemas)];
  return distinct.length === 1 && distinct[0] !== undefined ? distinct[0] : { [keyword]: distinct };
}
