import { getBuiltins } from "../../builtins.js";
import type {
  BuiltinSchema,
  BuiltinMethodSchema,
  BuiltinParamSchema,
  BuiltinPropertySchema,
  BuiltinCallbackParamSchema,
} from "../../builtins.js";

function generateJSDoc(description?: string, indent: string = ""): string {
  if (!description) return "";
  return `${indent}/**\n${indent} * ${description}\n${indent} */\n`;
}

function generateCallbackSignature(signature: { params: BuiltinCallbackParamSchema[]; returnType: string }): string {
  const params = signature.params.map((p) => `${p.name}: ${p.type}`).join(", ");
  return `(${params}) => ${signature.returnType}`;
}

function extractGenerics(method: BuiltinMethodSchema): string {
  for (const param of method.params) {
    if (param.kind === "function") {
      const usesU = param.signature.returnType === "U" || param.signature.params.some((p) => p.type === "U");
      if (usesU) return "<U>";
    }
  }
  return "";
}

function generateParam(param: BuiltinParamSchema): string {
  let typeStr: string;

  if (param.kind === "function") {
    typeStr = generateCallbackSignature(param.signature);
  } else {
    typeStr = param.types.join(" | ");
    // The type should be an array for variadic parameters
    if (param.variadic) {
      typeStr = `${typeStr}[]`;
    }
  }

  const optional = param.required || param.variadic ? "" : "?";
  const variadic = param.variadic ? "..." : "";
  return `${variadic}${param.name}${optional}: ${typeStr}`;
}

function generateMethod(methodName: string, method: BuiltinMethodSchema, indent: string = "  "): string {
  let result = "";

  if (method.description || method.params.some((p) => p.description)) {
    result += `${indent}/**\n`;

    if (method.description) {
      result += `${indent} * ${method.description}\n`;
      if (method.params.some((p) => p.description)) {
        result += `${indent} *\n`;
      }
    }

    for (const param of method.params) {
      if (param.description) {
        result += `${indent} * @param ${param.name} ${param.description}\n`;
      }
    }

    result += `${indent} * @returns ${method.returnType}\n`;
    result += `${indent} */\n`;
  }

  const generics = extractGenerics(method);
  const params = method.params.map((p: BuiltinParamSchema) => generateParam(p)).join(", ");
  result += `${indent}${methodName}${generics}(${params}): ${method.returnType};`;

  return result;
}

function generateProperty(propertyName: string, property: BuiltinPropertySchema, indent: string = "  "): string {
  let result = "";

  if (property.description) {
    result += generateJSDoc(property.description, indent);
  }

  const readonly = property.readonly ? "readonly " : "";
  result += `${indent}${readonly}${propertyName}: ${property.type};`;

  return result;
}

function generateNamespaceDeclaration(namespace: string, schema: BuiltinSchema): string {
  let result = "";

  if (schema.intrinsic) {
    const interfaceName = namespace.replace(".prototype", "");
    const genericParam = schema.generic || "";

    result += `interface ${interfaceName}${genericParam} {\n`;

    if (schema.properties) {
      for (const [propName, prop] of Object.entries(schema.properties)) {
        result += generateProperty(propName, prop) + "\n";
      }
    }

    if (schema.methods) {
      for (const [methodName, method] of Object.entries(schema.methods)) {
        result += generateMethod(methodName, method) + "\n";
      }
    }

    result += "}\n";
  } else {
    result += `declare const ${namespace}: {\n`;

    if (schema.properties) {
      for (const [propName, prop] of Object.entries(schema.properties)) {
        result += generateProperty(propName, prop) + "\n";
      }
    }

    if (schema.methods) {
      for (const [methodName, method] of Object.entries(schema.methods)) {
        result += generateMethod(methodName, method) + "\n";
      }
    }

    result += "};\n";
  }

  return result;
}

export function declareBuiltinTypes(): string {
  const builtins = getBuiltins();

  let declarations = `
declare global {
  namespace JSX {
    type Element = {
      type: any;
      props: any;
      key?: string | number | null;
    };
    type Node = Element | string | number | boolean | null | undefined | Node[];
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }

  interface Iterator<T> {
    next(): IteratorResult<T>;
  }

  interface IteratorResult<T> {
    done: boolean;
    value: T;
  }

`;

  for (const [namespace, schema] of Object.entries(builtins)) {
    declarations +=
      "  " +
      generateNamespaceDeclaration(namespace, schema)
        .replace(/\n/g, "\n  ")
        .replace(/\n {2}\n/g, "\n\n")
        .replace(/\n {2}$/, "\n");
  }

  declarations += `}\n\nexport {};\n`;

  return declarations;
}
