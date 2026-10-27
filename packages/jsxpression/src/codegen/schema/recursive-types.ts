import type { PropertySchema } from "../../schema.js";
import { mapSchemaTypeToTypeScript } from "./utils.js";

/**
 * The schemas that contain themselves by name, e.g. a component whose children are components, which TypeScript can only declare as named types. A
 * schema is named by its `name`, else "Recursive", with a number added if another schema has that name.
 */
export function recursiveSchemaNames(schemas: ReadonlyArray<PropertySchema>): Record<string, PropertySchema> {
  const names: Record<string, PropertySchema> = {};
  const ancestors = new Set<PropertySchema>();
  const visited = new Set<PropertySchema>();

  const visit = (schema: PropertySchema): void => {
    if (ancestors.has(schema) && !Object.values(names).includes(schema)) {
      const base = ("name" in schema ? schema.name : undefined) ?? "Recursive";
      let name = base;
      for (let i = 2; name in names; i++) {
        name = `${base}${i}`;
      }
      names[name] = schema;
    }
    if (visited.has(schema)) {
      return;
    }
    visited.add(schema);
    ancestors.add(schema);
    const children =
      schema.type === "object"
        ? Object.values(schema.shape)
        : schema.type === "array" || schema.type === "record"
          ? [schema.shape]
          : schema.type === "union"
            ? schema.shape
            : [];
    children.forEach(visit);
    ancestors.delete(schema);
  };

  schemas.forEach(visit);
  return names;
}

export function declareRecursiveTypes(names: Readonly<Record<string, PropertySchema>>): string {
  let output = `declare global {\n`;

  Object.entries(names).forEach(([name, schema]) => {
    // A copy isn't in names, so the type is written out instead of referring to itself
    output += `  type ${name} = ${mapSchemaTypeToTypeScript({ ...schema }, 0, names)};\n`;
  });

  output += `}\n\n`;
  output += `export {};\n`;

  return output;
}
