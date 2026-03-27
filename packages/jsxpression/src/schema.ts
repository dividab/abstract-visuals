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

export type UnionPropertySchema = {
  type: "union";
  description?: string;
  required?: boolean;
  shape: ReadonlyArray<PropertySchema>;
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
  | ArrayPropertySchema
  | UnionPropertySchema;

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

type PropertyEnumValue = string | number | boolean;

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
