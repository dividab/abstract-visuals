export function mapSchemaTypeToTypeScript(prop: any, depth: number = 0): string {
  switch (prop.type) {
    case "string":
      if (prop.enum && Array.isArray(prop.enum)) {
        return prop.enum.map((value: any) => `"${value}"`).join(" | ");
      }
      return "string";
    case "number":
      if (prop.enum && Array.isArray(prop.enum)) {
        return prop.enum.map((value: any) => String(value)).join(" | ");
      }
      return "number";
    case "boolean":
      if (prop.enum && Array.isArray(prop.enum)) {
        return prop.enum.map((value: any) => String(value)).join(" | ");
      }
      return "boolean";
    case "array":
      const itemType = prop.shape ? mapSchemaTypeToTypeScript(prop.shape, depth) : "any";
      return `${itemType}[]`;
    case "object":
      if (prop.shape && typeof prop.shape === "object") {
        return generateObjectTypeWithJSDoc(prop.shape, depth);
      }
      if (prop.properties && typeof prop.properties === "object") {
        return generateObjectTypeWithJSDoc(prop.properties, depth);
      }
      return "object";
    case "function":
      return "(...args: any[]) => any";
    case "union": {
      return `${prop.shape.map((p: any) => mapSchemaTypeToTypeScript(p)).join(" | ")}`;
    }
    default:
      console.warn(`Unknown schema type: ${prop.type}`);
      return "any";
  }
}

export function generateObjectTypeWithJSDoc(properties: any, depth: number = 0): string {
  let result = "{\n";

  // Generate each property with inline JSDoc
  Object.entries(properties).forEach(([key, value]: [string, any]) => {
    // Generate comprehensive JSDoc for this property
    const propertyJSDoc = generatePropertyJSDoc(key, value, "    ", depth);
    result += propertyJSDoc;

    const nestedType = mapSchemaTypeToTypeScript(value, depth + 1);
    const required = value.required !== false ? "" : "?";
    result += `    ${key}${required}: ${nestedType};\n`;
  });

  result += "  }";
  return result;
}

export function generatePropertyJSDoc(
  propertyName: string,
  propertySchema: any,
  indent: string = "",
  depth: number = 0
): string {
  const comments: string[] = [];

  // Main description
  if (propertySchema.description) {
    comments.push(propertySchema.description);
  }

  // Add @property tags for nested object properties (recursive!)
  let hasNestedProperties = false;
  if (propertySchema.type === "object" && propertySchema.shape) {
    comments.push("");
    Object.entries(propertySchema.shape).forEach(([key, value]: [string, any]) => {
      if (value.description) {
        comments.push(`@property ${key} ${value.description}`);
        hasNestedProperties = true;
      }
    });
  } else if (propertySchema.type === "array" && propertySchema.shape?.type === "object" && propertySchema.shape.shape) {
    // For arrays of objects, document the object structure
    comments.push("");
    Object.entries(propertySchema.shape.shape).forEach(([key, value]: [string, any]) => {
      if (value.description) {
        comments.push(`@property ${key} ${value.description}`);
        hasNestedProperties = true;
      }
    });
  }

  // No comments needed
  if (comments.length === 0) {
    return "";
  }

  // Single-line JSDoc
  if (comments.length === 1 && !hasNestedProperties) {
    return `${indent}/** ${comments[0]} */\n`;
  }

  // Multi-line JSDoc with @property tags
  let output = `${indent}/**\n`;
  comments.forEach((comment) => {
    if (comment === "") {
      output += `${indent} *\n`;
    } else {
      output += `${indent} * ${comment}\n`;
    }
  });
  output += `${indent} */\n`;

  return output;
}
