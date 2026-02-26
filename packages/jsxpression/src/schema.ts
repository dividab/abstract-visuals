export type StringPropertySchema = {
  type: "string";
  format?: "color";
  description?: string;
  required?: boolean;
  default?: string;
  enum?: readonly string[];
};

export type NumberPropertySchema = {
  type: "number";
  description?: string;
  required?: boolean;
  default?: number;
  enum?: readonly number[];
};

export type BooleanPropertySchema = {
  type: "boolean";
  description?: string;
  required?: boolean;
  default?: boolean;
  enum?: readonly boolean[];
};

export type FunctionPropertySchema = {
  type: "function";
  description?: string;
  required?: boolean;
};

export type ObjectPropertySchema = {
  type: "object";
  description?: string;
  required?: boolean;
  shape: Record<string, PropertySchema>;
};

export type ArrayPropertySchema = {
  type: "array";
  description?: string;
  required?: boolean;
  shape: PropertySchema;
};

export type PropertySchema =
  | StringPropertySchema
  | NumberPropertySchema
  | BooleanPropertySchema
  | FunctionPropertySchema
  | ObjectPropertySchema
  | ArrayPropertySchema;

export type ElementSchema = {
  description?: string;
  props?: Record<string, PropertySchema>;
  allowedChildren?: string[];
};

export type ArgumentSchema = {
  name: string;
  description?: string;
  property: PropertySchema;
};

export type FunctionSchema = {
  description?: string;
  args?: ReadonlyArray<ArgumentSchema>;
  ret: PropertySchema;
};

export interface Schema {
  data?: Record<string, PropertySchema>;
  elements?: Record<string, ElementSchema>;
  functions?: Record<string, FunctionSchema>;
}

export function isElementAllowed(schema: Schema, tagName: string): boolean {
  return !!schema.elements?.[tagName];
}

export function getElementSchema(schema: Schema, tagName: string): ElementSchema | undefined {
  return schema.elements?.[tagName];
}

export function getAllowedAttributes(schema: Schema, tagName: string): string[] {
  const elementConfig = getElementSchema(schema, tagName);
  return elementConfig?.props ? Object.keys(elementConfig.props) : [];
}

export function isAttributeAllowed(schema: Schema, tagName: string, attributeName: string): boolean {
  const allowedAttributes = getAllowedAttributes(schema, tagName);
  return allowedAttributes.includes(attributeName);
}

export function getAllowedChildren(schema: Schema, tagName: string): string[] | undefined {
  const elementConfig = getElementSchema(schema, tagName);
  return elementConfig?.allowedChildren;
}

export function canHaveChildren(schema: Schema, tagName: string): boolean {
  const allowedChildren = getAllowedChildren(schema, tagName);
  return allowedChildren === undefined || allowedChildren.length > 0;
}

export function isSelfClosing(schema: Schema, tagName: string): boolean {
  const allowedChildren = getAllowedChildren(schema, tagName);
  return allowedChildren !== undefined && allowedChildren.length === 0;
}

export function isChildAllowed(schema: Schema, parentTag: string, childTag: string): boolean {
  const allowedChildren = getAllowedChildren(schema, parentTag);
  return allowedChildren === undefined || allowedChildren.includes(childTag);
}

// New schema utilities for enhanced validation
export function getAllElements(schema: Schema): string[] {
  return schema.elements ? Object.keys(schema.elements) : [];
}

export function getElementConfig(schema: Schema, tagName: string): ElementSchema | undefined {
  return getElementSchema(schema, tagName);
}

export function getAttributeSchema(schema: Schema, tagName: string, attributeName: string): PropertySchema | undefined {
  const elementSchema = getElementSchema(schema, tagName);
  return elementSchema?.props?.[attributeName];
}

export function getRequiredAttributes(schema: Schema, tagName: string): string[] {
  const elementSchema = getElementSchema(schema, tagName);
  if (!elementSchema?.props) {
    return [];
  }

  const required: string[] = [];
  for (const [attrName, attrSchema] of Object.entries(elementSchema.props)) {
    if (attrSchema.required === true) {
      required.push(attrName);
    }
  }

  return required;
}

export function getOptionalAttributes(schema: Schema, tagName: string): string[] {
  const allAttributes = getAllowedAttributes(schema, tagName);
  const requiredAttributes = getRequiredAttributes(schema, tagName);
  return allAttributes.filter((attr) => !requiredAttributes.includes(attr));
}

export function isAttributeRequired(schema: Schema, tagName: string, attributeName: string): boolean {
  const requiredAttributes = getRequiredAttributes(schema, tagName);
  return requiredAttributes.includes(attributeName);
}

export function getDataSchema(schema: Schema): Record<string, PropertySchema> | undefined {
  return schema.data;
}

export function getPropertyAtPath(schema: Schema, path: string[]): PropertySchema | undefined {
  if (!schema.data || path.length === 0) {
    return undefined;
  }

  let current: PropertySchema | undefined = path[0] !== undefined ? schema.data[path[0]] : undefined;

  for (let i = 1; i < path.length && current; i++) {
    if (current.type === "object" && current.shape) {
      current = current.shape[path[i]!];
    } else {
      return undefined;
    }
  }

  return current;
}

export function getAvailablePropertiesAtPath(schema: Schema, path: string[]): string[] {
  if (!schema.data) {
    return [];
  }

  if (path.length === 0) {
    return Object.keys(schema.data);
  }

  const parentProperty = getPropertyAtPath(schema, path);
  if (parentProperty?.type === "object" && parentProperty.shape) {
    return Object.keys(parentProperty.shape);
  }

  return [];
}

export type PropertyEnumValue = string | number | boolean;

export function getEnumValues(property: PropertySchema): readonly PropertyEnumValue[] | undefined {
  switch (property.type) {
    case "string":
      return property.enum;
    case "number":
      return property.enum;
    case "boolean":
      return property.enum;
    default:
      return undefined;
  }
}
