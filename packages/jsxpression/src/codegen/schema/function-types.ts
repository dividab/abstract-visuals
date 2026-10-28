import type { Schema } from "../../schema.js";
import { typeScriptType } from "./utils.js";

/** The functions, their arguments' and return values' $refs referring to the data's $defs, named as the data declares them */
export function declareFunctionTypes(schema: Schema, names: Readonly<Record<string, string>>): string {
  const root = schema.data ?? {};
  const functions = Object.entries(schema.functions ?? {}).map(([funcName, funcSchema]) => {
    const args = (funcSchema.args ?? []).map((arg) => `${arg.name}: ${typeScriptType(arg.schema, root, names)}`).join(", ");
    return `function ${funcName}(${args}): ${typeScriptType(funcSchema.ret, root, names)};\n`;
  });
  return `declare global {\n${functions.join("")}}\n\nexport {};\n`;
}
