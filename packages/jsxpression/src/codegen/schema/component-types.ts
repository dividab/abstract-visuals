import type { JSONSchema7 } from "json-schema";
import { isRequired, keys, property } from "../../json-schema.js";
import type { ElementSchema, Schema } from "../../schema.js";
import { jsDoc, typeScriptType } from "./utils.js";

// ElementSchema fields the generator supports that aren't (yet) part of the shared schema type.
type ElementSchemaExtras = ElementSchema & {
  content?: boolean;
  doc?: string;
  examples?: ReadonlyArray<string>;
};

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

/** The attributes and their schemas, each written within the element's props schema */
function attributes(props: JSONSchema7 | undefined): ReadonlyArray<readonly [string, JSONSchema7]> {
  return props === undefined
    ? []
    : keys(props, props).map((name) => {
        const attribute = property(props, name, props) ?? true;
        return [name, typeof attribute === "boolean" ? {} : attribute] as const;
      });
}

function generatePropsInterface(interfaceName: string, element: ElementSchemaExtras, indent: string = ""): string {
  let output = `${indent}interface ${interfaceName} {\n`;
  const props = element.props ?? {};

  attributes(element.props).forEach(([propName, prop]) => {
    const optional = isRequired(props, propName, props) ? "" : "?";
    output += `${jsDoc(prop, props, `${indent}  `)}${indent}  ${propName}${optional}: ${typeScriptType(prop, props, {})};\n`;
  });

  if (element.content !== false) {
    output += `${indent}  children?: JSX.Node;\n`;
  }

  output += `${indent}}\n`;
  return output;
}

function generateComponentComment(elementName: string, element: ElementSchemaExtras, indent: string = ""): string {
  const comments: Array<string> = [];

  if (element.description) {
    comments.push(element.description);
  } else if (element.doc) {
    comments.push(element.doc);
  } else {
    comments.push(`${elementName} component`);
  }

  if (attributes(element.props).length > 0) {
    comments.push("");
    comments.push(`@param props Component props`);

    attributes(element.props).forEach(([propName, prop]) => {
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
    element.examples.forEach((example) => {
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
