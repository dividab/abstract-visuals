import type { Schema } from "../../schema.js";
import { mapSchemaTypeToTypeScript } from "./utils.js";

export function declareFunctionTypes(schema: Schema): string {
  let output = `declare global {\n`;

  if (schema.functions) {
    Object.entries(schema.functions).forEach(([funcName, funcSchema]) => {
      const args = funcSchema.args ? funcSchema.args.map((arg) => `${arg.name}: ${mapSchemaTypeToTypeScript(arg.property)}`).join(", ") : "";
      const ret = funcSchema.ret ? mapSchemaTypeToTypeScript(funcSchema.ret) : "void";
      output += `function ${funcName}(${args}): ${ret};\n`;
    })
  }

  output += `}\n\n`;
  output += `export {};\n`;

  return output;
}
