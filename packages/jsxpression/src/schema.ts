import { z } from "zod";

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

export type RecordPropertySchema = {
  type: "record";
  description?: string;
  required?: boolean;
  shape: PropertySchema;
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
  | RecordPropertySchema
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

export function serializePropertySchemaToJson(schema: PropertySchema): string {
  return JSON.stringify(schema, null, 2);
}

export function deserializePropertySchemaFromJson(json: string): PropertySchema | undefined {
  const zodSchema: z.ZodType<PropertySchema> = z.lazy(() =>
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("string"),
        format: z.literal("color").optional(),
        description: z.string().optional(),
        required: z.boolean().optional(),
        default: z.string().optional(),
        enum: z.array(z.string()).optional(),
      }),
      z.object({
        type: z.literal("number"),
        description: z.string().optional(),
        required: z.boolean().optional(),
        default: z.number().optional(),
        enum: z.array(z.number()).optional(),
      }),
      z.object({
        type: z.literal("boolean"),
        description: z.string().optional(),
        required: z.boolean().optional(),
        default: z.boolean().optional(),
        enum: z.array(z.boolean()).optional(),
      }),
      z.object({
        type: z.literal("function"),
        description: z.string().optional(),
        required: z.boolean().optional(),
      }),
      z.object({
        type: z.literal("object"),
        description: z.string().optional(),
        required: z.boolean().optional(),
        shape: z.record(z.string(), zodSchema),
      }),
      z.object({
        type: z.literal("record"),
        description: z.string().optional(),
        required: z.boolean().optional(),
        shape: zodSchema,
      }),
      z.object({
        type: z.literal("array"),
        description: z.string().optional(),
        required: z.boolean().optional(),
        shape: zodSchema,
      }),
      z.object({
        type: z.literal("union"),
        description: z.string(),
        required: z.boolean(),
        shape: z.array(zodSchema),
      }),
    ])
  );

  let parsed = {};
  try {
    parsed = JSON.parse(json);
  } catch {
    return undefined;
  }
  const validated = zodSchema.safeParse(parsed);
  if(!validated.success) {
    return undefined;
  }
  return validated.data;
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
