import type { Schema } from "../../schema.js";
import { mapSchemaTypeToTypeScript } from "./utils.js";

export function declareDataTypes(schema: Schema): string {
  let output = `declare global {\n`;

  if (schema.data) {
    output += generateDataObjectComment(schema.data, "  ");
    output += `  const data: {\n`;
    Object.entries(schema.data).forEach(([dataKey, dataSchema]) => {
      output += generateNestedPropertyJSDoc(dataKey, dataSchema, "    ");

      const type = mapSchemaTypeToTypeScript(dataSchema);

      const indentedType = type.includes("\n") ? type.replace(/\n/g, "\n    ").replace(/\n {4}$/, "\n  ") : type;
      output += `    ${dataKey}: ${indentedType};\n`;
    });
    output += `  };\n`;
  }

  output += `}\n\n`;
  output += `export {};\n`;

  return output;
}

function generateNestedPropertyJSDoc(propertyName: string, propertySchema: any, indent: string = ""): string {
  const comments: string[] = [];

  if (propertySchema.description) {
    comments.push(propertySchema.description);
  } else {
    const desc =
      propertyName.charAt(0).toUpperCase() +
      propertyName
        .slice(1)
        .replace(/([A-Z])/g, " $1")
        .toLowerCase();
    comments.push(desc);
  }

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
    comments.push("");
    Object.entries(propertySchema.shape.shape).forEach(([key, value]: [string, any]) => {
      if (value.description) {
        comments.push(`@property ${key} ${value.description}`);
        hasNestedProperties = true;
      }
    });
  }

  if (comments.length === 1 && !hasNestedProperties) {
    return `${indent}/** ${comments[0]} */\n`;
  }

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

function generateDataObjectComment(dataSchema: any, indent: string = ""): string {
  const comments: string[] = [];

  comments.push("Data object for JSX expressions");
  comments.push("");

  Object.entries(dataSchema).forEach(([dataKey, schema]: [string, any]) => {
    if (schema.description) {
      comments.push(`@property ${dataKey} ${schema.description}`);
    } else {
      const desc =
        dataKey.charAt(0).toUpperCase() +
        dataKey
          .slice(1)
          .replace(/([A-Z])/g, " $1")
          .toLowerCase();
      comments.push(`@property ${dataKey} ${desc}`);
    }
  });

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
