import { describe, expect, it } from "vitest";
import { parse } from "../parse/index.js";
import type { Schema } from "../schema.js";
import { analyze } from "./analyze.js";

describe("analyze - what a template returns", () => {
  const baseSchema: Schema = { elements: { Text: {}, div: {} } };

  describe("return requirement", () => {
    it("should allow bare JSX without return (no declarations)", () => {
      const ast = parse("<Text>hello</Text>");
      const result = analyze(ast, baseSchema);
      expect(result.issues.filter((i) => i.code === "RETURN_REQUIRED")).toHaveLength(0);
    });

    it("should require return when const is present", () => {
      const ast = parse("const x = 1;\n<Text>hello</Text>");
      const result = analyze(ast, baseSchema);
      expect(result.issues.some((i) => i.code === "RETURN_REQUIRED")).toBe(true);
    });

    it("should allow const + return", () => {
      const ast = parse("const x = 1\nreturn <Text>hello</Text>");
      const result = analyze(ast, baseSchema);
      expect(result.issues.filter((i) => i.code === "RETURN_REQUIRED")).toHaveLength(0);
    });

    it("should require return when function is present", () => {
      const ast = parse("function Foo() {\n  return <Text>hi</Text>\n}\n<Foo />");
      const result = analyze(ast, baseSchema);
      expect(result.issues.some((i) => i.code === "RETURN_REQUIRED")).toBe(true);
    });

    it("should allow function + return", () => {
      const ast = parse("function Foo() {\n  return <Text>hi</Text>\n}\nreturn <Foo />");
      const result = analyze(ast, baseSchema);
      expect(result.issues.filter((i) => i.code === "RETURN_REQUIRED")).toHaveLength(0);
    });

    it("should give helpful message for bare JSX after declarations", () => {
      const ast = parse("const x = 1;\n<Text>hello</Text>");
      const result = analyze(ast, baseSchema);
      const issue = result.issues.find((i) => i.code === "RETURN_REQUIRED");
      expect(issue?.message).toContain("Add 'return' before the JSX");
    });
  });

  describe("root requirement", () => {
    const schema: Schema = { ...baseSchema, root: "div" };
    const rootErrors = (source: string): ReadonlyArray<string> =>
      analyze(parse(source), schema)
        .issues.filter((i) => i.code === "ROOT_REQUIRED")
        .map((i) => i.message);

    it("should allow returning the root, or what can't be known not to be it", () => {
      expect(rootErrors("<div />")).toEqual([]);
      expect(rootErrors("const big = true; return big ? <div /> : (<div>Small</div>);")).toEqual([]);
      expect(rootErrors("function Foo() { return <div />; } return <Foo />;")).toEqual([]);
      expect(rootErrors("function foo() { return <div />; } const d = <div />; return d && foo();")).toEqual([]);
    });

    it("should require returning the root", () => {
      expect(rootErrors("")).toEqual(["Templates must return <div>"]);
      expect(rootErrors("<Text>hello</Text>")).toEqual(["Templates must return <div>"]);
      expect(rootErrors("const x = 1; return x > 1 ? <div /> : <Text>small</Text>;")).toEqual(["Templates must return <div>"]);
      expect(rootErrors("const x = 1; return 5;")).toEqual(["Templates must return <div>"]);
      expect(rootErrors("const x = 1; return;")).toEqual(["Templates must return <div>"]);
      expect(rootErrors("<><div /></>")).toEqual(["Templates must return <div>"]);
    });

    it("should leave a template's return to the schema without a root", () => {
      expect(analyze(parse("<Text>hello</Text>"), baseSchema).issues.filter((i) => i.code === "ROOT_REQUIRED")).toEqual([]);
    });
  });
});
