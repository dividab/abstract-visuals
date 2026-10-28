import { keys, property } from "../../json-schema.js";
import type { Schema } from "../../schema.js";
import { jsDoc, typeScriptType } from "./utils.js";

/** The data's variables, each a const of its property's type, and the types of its $defs, named as their $refs are written */
export function declareDataTypes(schema: Schema, names: Readonly<Record<string, string>>): string {
  const data = schema.data;
  if (data === undefined) {
    return `declare global {\n}\n\nexport {};\n`;
  }
  const definitions = Object.entries(data.$defs ?? {}).map(
    ([key, definition]) => `  type ${names[key]} = ${typeScriptType(definition, data, names)};\n`
  );
  const variables = keys(data, data).map((key) => {
    const variable = property(data, key, data) ?? true;
    return `${jsDoc(variable, data, "  ")}  const ${key}: ${typeScriptType(variable, data, names)};\n`;
  });
  return `declare global {\n${[...definitions, ...variables].join("")}}\n\nexport {};\n`;
}
