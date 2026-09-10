import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

type PackageManifest = {
  name: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
};

const root = fileURLToPath(new URL("../", import.meta.url));
const packagesDir = join(root, "packages");
const packages = readdirSync(packagesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => join(packagesDir, entry.name))
  .filter((dir) => existsSync(join(dir, "package.json")))
  .map((dir) => ({
    dir,
    manifest: JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as PackageManifest,
  }));
const projects = new Map(packages.filter(({ dir }) => existsSync(join(dir, "tsconfig.json"))).map(({ dir, manifest }) => [manifest.name, dir]));

function updateReferences(file: string, dirs: readonly string[]): void {
  const text = readFileSync(file, "utf8");
  const parsed = ts.parseConfigFileTextToJson(file, text);
  if (parsed.error) {
    throw new Error(ts.flattenDiagnosticMessageText(parsed.error.messageText, "\n"));
  }
  const references = [...new Set(dirs)]
    .map((dir) => relative(dirname(file), dir).replaceAll("\\", "/"))
    .sort()
    .map((path) => ({ path: path.startsWith(".") ? path : `./${path}` }));
  const current = parsed.config.references;
  if (
    Array.isArray(current) &&
    current.length === references.length &&
    references.every(({ path }) => current.some((ref) => ref.path.replace(/^\.\//, "") === path.replace(/^\.\//, "")))
  ) {
    return;
  }

  const source = ts.parseJsonText(file, text);
  const statement = source.statements[0];
  if (!statement || !ts.isExpressionStatement(statement) || !ts.isObjectLiteralExpression(statement.expression)) {
    throw new Error(`Expected a JSON object in ${file}`);
  }
  const object = statement.expression;
  const property = object.properties.find(
    (item): item is ts.PropertyAssignment => ts.isPropertyAssignment(item) && ts.isStringLiteral(item.name) && item.name.text === "references"
  );
  const value = JSON.stringify(references);
  const updated = property
    ? text.slice(0, property.initializer.getStart(source)) + value + text.slice(property.initializer.end)
    : text.slice(0, object.properties.end) +
      `${object.properties.length && !object.properties.hasTrailingComma ? "," : ""}\n  "references": ${value}` +
      text.slice(object.properties.end);
  writeFileSync(file, updated);
  console.log(`Updated ${relative(root, file)}`);
}

for (const { dir, manifest } of packages) {
  if (!projects.has(manifest.name)) continue;
  const dependencies = {
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies,
    ...manifest.optionalDependencies,
  };
  updateReferences(
    join(dir, "tsconfig.json"),
    Object.keys(dependencies)
      .filter((name) => name !== manifest.name)
      .map((name) => projects.get(name))
      .filter((dir): dir is string => dir !== undefined)
  );
}
updateReferences(join(packagesDir, "tsconfig.json"), [...projects.values()]);
