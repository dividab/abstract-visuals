import type { PropertySchema, Schema } from "../../schema.js";
import { mapSchemaTypeToTypeScript } from "./utils.js";

export function declareFunctionTypes(schema: Schema, names: Readonly<Record<string, PropertySchema>>): string {
  let output = `declare global {\n`;

  if (schema.functions) {
    Object.entries(schema.functions).forEach(([funcName, funcSchema]) => {
      const args = funcSchema.args
        ? funcSchema.args.map((arg) => `${arg.name}: ${mapSchemaTypeToTypeScript(arg.property, 0, names)}`).join(", ")
        : "";
      const ret = mapSchemaTypeToTypeScript(funcSchema.ret, 0, names);
      output += `function ${funcName}(${args}): ${ret};\n`;
    });
  }

  output += `}\n\n`;
  output += `export {};\n`;

  return output;
}
