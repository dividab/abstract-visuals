import type { JSONSchema7 } from "json-schema";
import { describe, expect, test } from "vitest";
import { enumValues, isRequired, items, keys, property, resolve, types } from "./json-schema.js";

// A component that contains components, as zod writes a recursive schema, and a product with a record of images whose names a lookup limits
const root = {
  type: "object",
  properties: {
    component: { $ref: "#/$defs/component", description: "The unit's first component" },
    product: {
      type: "object",
      properties: {
        images: { type: "object", propertyNames: { enum: ["front", "side"] }, additionalProperties: { type: "string" } },
        resultVisualizers: { type: "object", additionalProperties: { type: "string" } },
      },
      required: ["images"],
    },
    value: { anyOf: [{ type: "string" }, { type: "number" }, { type: "object", properties: { v: { type: "number" } } }] },
    anything: {},
  },
  $defs: {
    component: {
      type: "object",
      properties: { name: { type: "string" }, children: { type: "array", items: { $ref: "#/$defs/component" } } },
    },
    "a/b~c": { type: "boolean" },
    loop: { $ref: "#/$defs/loop" },
  },
} satisfies JSONSchema7;

describe("resolve", () => {
  test("follows a $ref, keeping the referring schema's description", () => {
    expect(resolve({ $ref: "#/$defs/component" }, root)).toBe(root.$defs.component);
    expect(resolve(root.properties.component, root)).toMatchObject({ type: "object", description: "The unit's first component" });
    expect(resolve({ $ref: "#" }, root)).toBe(root);
  });

  test("unescapes a pointer's segments, and allows anything where a $ref leads nowhere or back to itself", () => {
    expect(resolve({ $ref: "#/$defs/a~1b~0c" }, root)).toEqual({ type: "boolean" });
    expect(resolve({ $ref: "#/$defs/missing" }, root)).toEqual({});
    expect(resolve({ $ref: "#/$defs/loop" }, root)).toEqual({});
  });
});

describe("property", () => {
  test("finds a property, through $refs and a recursive schema's items", () => {
    const component = property(root, "component", root) ?? {};
    const children = property(component, "children", root) ?? {};
    expect(property(items(children, root) ?? {}, "name", root)).toEqual({ type: "string" });
  });

  test("limits additionalProperties to the propertyNames, and closes an object with properties", () => {
    const product = property(root, "product", root) ?? {};
    const images = property(product, "images", root) ?? {};
    expect(property(images, "front", root)).toEqual({ type: "string" });
    expect(property(images, "back", root)).toBeUndefined();
    expect(property(property(product, "resultVisualizers", root) ?? {}, "any", root)).toEqual({ type: "string" });
    expect(property(product, "nope", root)).toBeUndefined();
    expect(property(property(root, "anything", root) ?? {}, "x", root)).toEqual({});
    expect(property({ type: "string" }, "length", root)).toBeUndefined();
  });

  test("finds a property in any of anyOf's schemas, and in one of allOf's that none forbids, as zod's intersection of objects", () => {
    expect(property(property(root, "value", root) ?? {}, "v", root)).toEqual({ type: "number" });
    const both: JSONSchema7 = { allOf: [{ properties: { a: { type: "string" } } }, { additionalProperties: { minLength: 1 } }] };
    expect(property(both, "a", root)).toEqual({ allOf: [{ type: "string" }, { minLength: 1 }] });
    const intersection: JSONSchema7 = { allOf: [{ properties: { a: { type: "string" } } }, { properties: { b: { type: "number" } } }] };
    expect(property(intersection, "a", root)).toEqual({ type: "string" });
    expect(property(intersection, "b", root)).toEqual({ type: "number" });
    expect(property(intersection, "c", root)).toBeUndefined();
    expect(property({ allOf: [{ properties: { a: {} } }, { properties: { b: {} }, additionalProperties: false }] }, "a", root)).toBeUndefined();
  });
});

describe("keys", () => {
  test("lists the properties and the names propertyNames enumerates", () => {
    expect(keys(root, root)).toEqual(["component", "product", "value", "anything"]);
    expect(keys(property(property(root, "product", root) ?? {}, "images", root) ?? {}, root)).toEqual(["front", "side"]);
    expect(keys(property(root, "value", root) ?? {}, root)).toEqual(["v"]);
  });

  test("suggests the names propertyNames list where another of its schemas allows any, and allows a listed number as text", () => {
    const node = {
      type: "object",
      propertyNames: {
        anyOf: [
          {
            oneOf: [
              { type: "number", enum: [1] },
              { type: "string", enum: ["airflow"] },
            ],
          },
          { type: "string" },
        ],
      },
      additionalProperties: { type: "string" },
    } satisfies JSONSchema7;
    expect(keys(node, root)).toEqual(["1", "airflow"]);
    expect(property(node, "other", root)).toEqual({ type: "string" });
    expect(property({ ...node, propertyNames: { enum: [1] } }, "1", root)).toEqual({ type: "string" });
  });
});

describe("types, enumValues and isRequired", () => {
  test("say what values a schema allows", () => {
    expect([...types(property(root, "value", root) ?? {}, root)]).toEqual(["string", "number", "object"]);
    expect([...types({ enum: ["a", 1] }, root)]).toEqual(["string", "number"]);
    expect([...types({ allOf: [{ type: ["string", "null"] }, { type: "string" }] }, root)]).toEqual(["string"]);
    expect(types({}, root).size).toBe(0);
    expect(enumValues({ anyOf: [{ const: "a" }, { enum: ["b"] }] }, root)).toEqual(["a", "b"]);
    expect(enumValues({ type: "string" }, root)).toBeUndefined();
    expect(isRequired(property(root, "product", root) ?? {}, "images", root)).toBe(true);
    expect(isRequired(property(root, "product", root) ?? {}, "resultVisualizers", root)).toBe(false);
  });
});
