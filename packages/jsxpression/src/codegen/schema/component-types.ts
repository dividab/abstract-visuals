import type { Schema } from "../../schema.js";
import { mapSchemaTypeToTypeScript } from "./utils.js";

export function declareComponentTypes(schema: Schema): string {
  let output = `declare global {\n`;

  if (schema.elements) {
    Object.entries(schema.elements).forEach(([elementName, element]) => {
      const interfaceName = `${elementName}Props`;
      output += generatePropsInterface(interfaceName, element, "  ");
      output += "\n";
    });
  }

  if (schema.elements) {
    Object.entries(schema.elements).forEach(([elementName, element]) => {
      const interfaceName = `${elementName}Props`;
      const componentComment = generateComponentComment(elementName, element, "  ");
      if (componentComment) {
        output += componentComment;
      }
      output += `  const ${elementName}: (props: ${interfaceName}) => JSX.Element;\n\n`;
    });
  }

  output += `}\n\n`;
  output += `export {};\n`;

  return output;
}

function generatePropsInterface(interfaceName: string, element: any, indent: string = ""): string {
  let output = `${indent}interface ${interfaceName} {\n`;

  Object.entries(element.props || {}).forEach(([propName, prop]: [string, any]) => {
    const optional = prop.required ? "" : "?";
    const type = mapSchemaTypeToTypeScript(prop);
    const comment = generatePropComment(prop, `${indent}  `);

    if (comment) {
      output += comment;
    }
    output += `${indent}  ${propName}${optional}: ${type};\n`;
  });

  if (element.content !== false) {
    output += `${indent}  children?: JSX.Node;\n`;
  }

  output += `${indent}}\n`;
  return output;
}

function generateComponentComment(elementName: string, element: any, indent: string = ""): string {
  const comments: string[] = [];

  if (element.description) {
    comments.push(element.description);
  } else if (element.doc) {
    comments.push(element.doc);
  } else {
    comments.push(`${elementName} component`);
  }

  if (element.props && Object.keys(element.props).length > 0) {
    comments.push("");
    comments.push(`@param props Component props`);

    Object.entries(element.props).forEach(([propName, prop]: [string, any]) => {
      if (prop.description) {
        comments.push(`@param props.${propName} ${prop.description}`);
      }
    });
  }

  comments.push("");
  comments.push(`@returns JSX.Element`);

  if (element.examples && element.examples.length > 0) {
    comments.push("");
    comments.push("@example");
    element.examples.forEach((example: string) => {
      comments.push(example);
    });
  }

  if (comments.length === 0) {
    return "";
  }

  if (comments.length === 1 && comments[0] && !comments[0].includes("\n")) {
    return `${indent}/** ${comments[0]} */\n`;
  }

  let output = `${indent}/**\n`;
  comments.forEach((comment) => {
    if (comment === "") {
      output += `${indent} *\n`;
    } else {
      comment.split("\n").forEach((line) => {
        output += `${indent} * ${line}\n`;
      });
    }
  });
  output += `${indent} */\n`;

  return output;
}

function generatePropComment(prop: any, indent: string): string {
  const comments: string[] = [];

  if (prop.description) {
    comments.push(prop.description);
  }

  if (prop.default !== undefined) {
    comments.push(`@default ${JSON.stringify(prop.default)}`);
  }

  if (prop.type === "enum" && prop.values) {
    comments.push(`@values ${prop.values.map((v: any) => `"${v}"`).join(", ")}`);
  }

  if (comments.length === 0) {
    return "";
  }

  if (comments.length === 1) {
    return `${indent}/** ${comments[0]} */\n`;
  }

  let output = `${indent}/**\n`;
  comments.forEach((comment) => {
    output += `${indent} * ${comment}\n`;
  });
  output += `${indent} */\n`;

  return output;
}
