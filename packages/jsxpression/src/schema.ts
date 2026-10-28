import type { JSONSchema7, JSONSchema7Definition, JSONSchema7Type } from "json-schema";
import { enumValues, isRequired, keys, property } from "./json-schema.js";

export type ElementSchema = {
  description?: string;
  /** The element's attributes, an object's JSON schema: each of its properties an attribute, those it requires the attributes it must have */
  props?: JSONSchema7;
  allowedChildren?: Array<string>;
};

export type ArgumentSchema = {
  name: string;
  description?: string;
  schema: JSONSchema7Definition;
};

/** A function's arguments and return value, whose $refs refer to the data's $defs */
export type FunctionSchema = {
  description?: string;
  args?: ReadonlyArray<ArgumentSchema>;
  ret: JSONSchema7Definition;
};

export type Schema = {
  /** The data's JSON schema, an object's: each of its properties a variable an expression can read, its $defs what $refs in it refer to */
  data?: JSONSchema7;
  elements?: Record<string, ElementSchema>;
  functions?: Record<string, FunctionSchema>;
};

/** The names of the variables the data has */
export function getDataKeys(schema: Schema): ReadonlyArray<string> {
  return schema.data === undefined ? [] : keys(schema.data, schema.data);
}

export function isElementAllowed(schema: Schema, tagName: string): boolean {
  return !!schema.elements?.[tagName];
}

export function getElementSchema(schema: Schema, tagName: string): ElementSchema | undefined {
  return schema.elements?.[tagName];
}

export function getAllowedAttributes(schema: Schema, tagName: string): ReadonlyArray<string> {
  const props = getElementSchema(schema, tagName)?.props;
  return props === undefined ? [] : keys(props, props);
}

export function isAttributeAllowed(schema: Schema, tagName: string, attributeName: string): boolean {
  return getAllowedAttributes(schema, tagName).includes(attributeName);
}

export function getAllowedChildren(schema: Schema, tagName: string): Array<string> | undefined {
  const elementConfig = getElementSchema(schema, tagName);
  return elementConfig?.allowedChildren;
}

export function canHaveChildren(schema: Schema, tagName: string): boolean {
  const allowedChildren = getAllowedChildren(schema, tagName);
  return allowedChildren === undefined || allowedChildren.length > 0;
}

export function isSelfClosing(schema: Schema, tagName: string): boolean {
  const allowedChildren = getAllowedChildren(schema, tagName);
  return allowedChildren?.length === 0;
}

export function isChildAllowed(schema: Schema, parentTag: string, childTag: string): boolean {
  const allowedChildren = getAllowedChildren(schema, parentTag);
  return allowedChildren === undefined || allowedChildren.includes(childTag);
}

// New schema utilities for enhanced validation
export function getAllElements(schema: Schema): Array<string> {
  return schema.elements ? Object.keys(schema.elements) : [];
}

export function getRequiredAttributes(schema: Schema, tagName: string): ReadonlyArray<string> {
  const props = getElementSchema(schema, tagName)?.props;
  return props === undefined ? [] : keys(props, props).filter((name) => isRequired(props, name, props));
}

/** The values an attribute allows, if its schema lists them */
export function getAttributeEnumValues(schema: Schema, tagName: string, attributeName: string): ReadonlyArray<JSONSchema7Type> | undefined {
  const props = getElementSchema(schema, tagName)?.props;
  const attribute = props === undefined ? undefined : property(props, attributeName, props);
  return props === undefined || attribute === undefined ? undefined : enumValues(attribute, props);
}
