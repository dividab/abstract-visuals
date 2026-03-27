import { describe, it, expect, vi } from "vitest";
import { evaluate, type EvaluateOptions } from "./evaluate.js";
import { compile } from "../compile/index.js";
import { parse } from "../parse/index.js";
import type { Schema } from "../schema.js";

import { EvaluationError } from "./evaluation-error.js";

type Node = {
  type: string;
  props: Record<string, unknown>;
  children: Node[];
};

function createPermissiveSchema(componentNames: string[]): Schema {
  return {
    elements: Object.fromEntries(componentNames.map((name) => [name, {}])),
  };
}

describe("evaluate", () => {
  const compileAndEvaluate = (source: string, options: EvaluateOptions = {}): Node => {
    const componentNames = Object.keys(options.components || {});
    const schema = createPermissiveSchema(componentNames);
    return evaluate(compile(parse(source)), schema, options);
  };

  it("should evaluate JSX with props", () => {
    const TestComponent = (props: any): Node => ({
      type: "TestComponent",
      props: { x: props.x, y: props.y },
      children: props.children,
    });

    const result = compileAndEvaluate("<Test x={x} y={y}>Hello</Test>", {
      data: { x: 10, y: 20 },
      components: {
        Test: TestComponent,
      },
    });

    expect(result).toEqual({
      type: "TestComponent",
      props: { x: 10, y: 20 },
      children: ["Hello"],
    });
  });

  it("should evaluate JSX with Math operations", () => {
    const TestComponent = (props: any): Node => ({
      type: "TestComponent",
      props,
      children: [],
    });

    const result = compileAndEvaluate("<Test value={Math.floor(x * Math.PI)}>Text</Test>", {
      data: { x: 5 },
      components: {
        Test: TestComponent,
      },
    });

    expect(result.props!.value).toBe(15); // floor(5 * 3.14159...) = 15
  });

  it("should throw EvaluationError for unknown component", () => {
    const compiled = compile(parse("<UnknownComponent>Hello</UnknownComponent>"));
    const emptySchema = createPermissiveSchema([]);

    expect(() => evaluate(compiled, emptySchema, { components: {} })).toThrow(EvaluationError);
    expect(() => evaluate(compiled, emptySchema, { components: {} })).toThrow(
      'component "UnknownComponent" is not allowed'
    );
  });

  it("should deep-freeze props to prevent mutations", () => {
    const TestComponent = (props: any): Node => {
      expect(() => {
        props.nested.value = 999;
      }).toThrow();
      return { type: "Test", props, children: [] };
    };

    const compiled = compile(parse("<Test>Hello</Test>"));
    const schema = createPermissiveSchema(["Test"]);

    evaluate(compiled, schema, {
      data: { nested: { value: 42 } },
      components: {
        Test: TestComponent,
      },
    });
  });

  it("should evaluate nested elements", () => {
    const OuterComponent = (props: any): Node => ({
      type: "Outer",
      props: { x: props.x },
      children: props.children,
    });

    const InnerComponent = (props: any): Node => ({
      type: "Inner",
      props: { y: props.y },
      children: props.children,
    });

    const result = compileAndEvaluate("<Outer x={x}><Inner y={y}>Text</Inner></Outer>", {
      data: { x: 10, y: 20 },
      components: {
        Outer: OuterComponent,
        Inner: InnerComponent,
      },
    });

    expect(result.type).toBe("Outer");
    expect(result.props).toEqual({ x: 10 });
    expect(result.children).toHaveLength(1);
    const innerNode = result.children[0] as Node;
    expect(innerNode.type).toBe("Inner");
    expect(innerNode.props).toEqual({ y: 20 });
    expect(innerNode.children).toEqual(["Text"]);
  });

  it("should use custom createElement when provided", () => {
    const customCreateElement = (type: any, props: any, ...children: any[]): Node => ({
      type: type.name || "Unknown",
      props: { ...props, custom: true },
      children,
    });

    const TestComponent = (): Node => ({ type: "Test", props: {}, children: [] });

    const result = compileAndEvaluate("<Test x={10}>Hello</Test>", {
      components: {
        Test: TestComponent,
      },
      createElement: customCreateElement,
    });

    expect(result).toEqual({
      type: "TestComponent",
      props: { x: 10, custom: true },
      children: ["Hello"],
    });
  });

  it("should evaluate conditional expressions with props", () => {
    const TestComponent = (props: any): Node => ({
      type: "TestComponent",
      props,
      children: [],
    });

    const result = compileAndEvaluate("<Test msg={show ? 'visible' : 'hidden'}>Text</Test>", {
      data: { show: true },
      components: {
        Test: TestComponent,
      },
    });

    expect(result.props!.msg).toBe("visible");
  });

  it("should evaluate array methods on props", () => {
    const TestComponent = (props: any): Node => ({
      type: "TestComponent",
      props,
      children: [],
    });

    const result = compileAndEvaluate("<Test values={items.filter(x => x > 2).map(x => x * 2)}>Text</Test>", {
      data: { items: [1, 2, 3, 4, 5] },
      components: {
        Test: TestComponent,
      },
    });

    expect(result.props!.values).toEqual([6, 8, 10]);
  });

  it("should handle runtime errors gracefully", () => {
    const compiled = compile(parse("<Test value={missing.nested}>Text</Test>"));
    const TestComponent = (): Node => ({ type: "Test", props: {}, children: [] });
    const schema = createPermissiveSchema(["Test"]);

    expect(() =>
      evaluate(compiled, schema, {
        data: {},
        components: {
          Test: TestComponent,
        },
      })
    ).toThrow(EvaluationError);
  });

  it("should evaluate logical operators with props", () => {
    const TestComponent = (props: any): Node => ({
      type: "TestComponent",
      props,
      children: [],
    });

    const result = compileAndEvaluate("<Test msg={name || 'Anonymous'}>Text</Test>", {
      data: { name: "" },
      components: {
        Test: TestComponent,
      },
    });

    expect(result.props!.msg).toBe("Anonymous");
  });

  it("should flatten and filter children correctly", () => {
    const TestComponent = (props: any): Node => ({
      type: "Test",
      props: {},
      children: props.children,
    });

    const result = compileAndEvaluate("<Test>{show && 'Visible'}{false}{'Always'}</Test>", {
      data: { show: true },
      components: {
        Test: TestComponent,
      },
    });

    expect(result.children).toEqual(["Visible", "Always"]);
  });

  it("should handle JSX fragments", () => {
    const TestComponent = (): Node => ({ type: "Test", props: {}, children: [] });

    const result = compileAndEvaluate("<><Test /><Test /></>", {
      components: { Test: TestComponent },
    });

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
  });

  it("should handle empty JSX expressions", () => {
    const TestComponent = (props: any): Node => ({
      type: "Test",
      props: {},
      children: props.children,
    });

    const result = compileAndEvaluate("<Test>{}{value}{}</Test>", {
      data: { value: "hello" },
      components: { Test: TestComponent },
    });

    expect(result.children).toEqual(["hello"]);
  });

  it("should evaluate complex nested expressions", () => {
    const TestComponent = (props: any): Node => ({
      type: "Test",
      props,
      children: [],
    });

    const result = compileAndEvaluate(
      "<Test values={items.filter(x => x > 2).map(x => x * 2).join(', ')}>Text</Test>",
      {
        data: { items: [1, 2, 3, 4, 5] },
        components: { Test: TestComponent },
      }
    );

    expect(result.props!.values).toBe("6, 8, 10");
  });

  it("should pass correct parameters to custom createElement", () => {
    const mockCreateElement = vi.fn();

    compileAndEvaluate("<Test x={10}>Hello</Test>", {
      components: { Test: () => ({ type: "Test", props: {}, children: [] }) },
      createElement: mockCreateElement,
    });

    expect(mockCreateElement).toHaveBeenCalledWith(expect.any(Function), { x: 10 }, "Hello");
  });

  it("should handle string literals in expressions", () => {
    const TestComponent = (props: any): Node => ({
      type: "Test",
      props,
      children: [],
    });

    const result = compileAndEvaluate('<Test msg={"Hello " + name}>Text</Test>', {
      data: { name: "World" },
      components: { Test: TestComponent },
    });

    expect(result.props!.msg).toBe("Hello World");
  });

  it("should handle numeric operations", () => {
    const TestComponent = (props: any): Node => ({
      type: "Test",
      props,
      children: [],
    });

    const result = compileAndEvaluate("<Test value={x + y * 2}>Text</Test>", {
      data: { x: 5, y: 3 },
      components: { Test: TestComponent },
    });

    expect(result.props!.value).toBe(11); // 5 + (3 * 2)
  });

  it("should handle data access in children", () => {
    const TestComponent = (props: any): Node => ({
      type: "Test",
      props: {},
      children: props.children,
    });

    const result = compileAndEvaluate("<Test>Hello {name}!</Test>", {
      data: { name: "World" },
      components: { Test: TestComponent },
    });

    expect(result.children).toEqual(["Hello", "World", "!"]);
  });

  describe("const declarations", () => {
    it("should evaluate const with literal value", () => {
      const TestComponent = (props: any): Node => ({
        type: "Test",
        props,
        children: [],
      });

      const result = compileAndEvaluate("const x = 42;\nreturn <Test value={x}>Text</Test>", {
        components: { Test: TestComponent },
      });

      expect(result.props!.value).toBe(42);
    });

    it("should evaluate const with computed expression", () => {
      const TestComponent = (props: any): Node => ({
        type: "Test",
        props,
        children: [],
      });

      const result = compileAndEvaluate("const a = x + 1;\nconst b = a * 2;\nreturn <Test value={b}>Text</Test>", {
        data: { x: 3 },
        components: { Test: TestComponent },
      });

      expect(result.props!.value).toBe(8); // (3+1)*2
    });

    it("should evaluate const referencing data", () => {
      const TestComponent = (props: any): Node => ({
        type: "Test",
        props,
        children: [],
      });

      const result = compileAndEvaluate("const greeting = 'Hello ' + name;\nreturn <Test msg={greeting}>Text</Test>", {
        data: { name: "World" },
        components: { Test: TestComponent },
      });

      expect(result.props!.msg).toBe("Hello World");
    });

    it("should evaluate const with computed array", () => {
      const TestComponent = (props: any): Node => ({
        type: "Test",
        props,
        children: [],
      });

      const result = compileAndEvaluate(
        "const filtered = items.filter(x => x > 2);\nreturn <Test count={filtered.length}>Text</Test>",
        {
          data: { items: [1, 2, 3, 4, 5] },
          components: { Test: TestComponent },
        }
      );

      expect(result.props!.count).toBe(3);
    });
  });

  describe("function declarations", () => {
    it("should evaluate user-defined component", () => {
      const Span = (props: any): Node => ({
        type: "Span",
        props: {},
        children: props.children,
      });

      const result = compileAndEvaluate(
        'function Badge({ label }) {\n  return <Span>{label}</Span>\n}\nreturn <Badge label="hello" />',
        {
          components: { Span },
        }
      );

      expect(result.type).toBe("Span");
      expect(result.children).toEqual(["hello"]);
    });

    it("should evaluate function with const inside", () => {
      const Span = (props: any): Node => ({
        type: "Span",
        props,
        children: [],
      });

      const result = compileAndEvaluate(
        "function Doubled({ value }) {\n  const d = value * 2;\n  return <Span result={d} />\n}\nreturn <Doubled value={5} />",
        {
          components: { Span },
        }
      );

      expect(result.props!.result).toBe(10);
    });

    it("should evaluate nested user-defined components", () => {
      const Span = (props: any): Node => ({
        type: "Span",
        props: {},
        children: props.children,
      });

      const Div = (props: any): Node => ({
        type: "Div",
        props: {},
        children: props.children,
      });

      const result = compileAndEvaluate(
        'function Label({ text }) {\n  return <Span>{text}</Span>\n}\nfunction Card({ title }) {\n  return <Div><Label text={title} /></Div>\n}\nreturn <Card title="hi" />',
        {
          components: { Span, Div },
        }
      );

      expect(result.type).toBe("Div");
      expect(result.children).toHaveLength(1);
      expect((result.children[0] as Node).type).toBe("Span");
      expect((result.children[0] as Node).children).toEqual(["hi"]);
    });

    it("should evaluate function with children", () => {
      const Div = (props: any): Node => ({
        type: "Div",
        props: {},
        children: props.children,
      });

      const Span = (props: any): Node => ({
        type: "Span",
        props: {},
        children: props.children,
      });

      const result = compileAndEvaluate(
        "function Wrapper({ children }) {\n  return <Div>{children}</Div>\n}\nreturn <Wrapper><Span>inside</Span></Wrapper>",
        {
          components: { Div, Span },
        }
      );

      expect(result.type).toBe("Div");
      expect(result.children).toHaveLength(1);
      expect((result.children[0] as Node).type).toBe("Span");
    });

    it("should evaluate function with default parameter values", () => {
      const Span = (props: any): Node => ({
        type: "Span",
        props: {},
        children: props.children,
      });

      const result = compileAndEvaluate(
        "function Badge({ label = 'default' }) {\n  return <Span>{label}</Span>\n}\nreturn <Badge />",
        {
          components: { Span },
        }
      );

      expect(result.children).toEqual(["default"]);
    });

    it("should evaluate function with data access", () => {
      const Span = (props: any): Node => ({
        type: "Span",
        props: {},
        children: props.children,
      });

      const result = compileAndEvaluate(
        "function Greeting() {\n  return <Span>Hello {name}</Span>\n}\nreturn <Greeting />",
        {
          data: { name: "World" },
          components: { Span },
        }
      );

      expect(result.children).toEqual(["Hello", "World"]);
    });
  });

  describe("const and function combined", () => {
    it("should evaluate const used in function body", () => {
      const Span = (props: any): Node => ({
        type: "Span",
        props,
        children: [],
      });

      const result = compileAndEvaluate(
        "const multiplier = 3;\nfunction Calc({ value }) {\n  return <Span result={value * multiplier} />\n}\nreturn <Calc value={4} />",
        {
          components: { Span },
        }
      );

      expect(result.props!.result).toBe(12);
    });

    it("should evaluate function used in map with const", () => {
      const Div = (props: any): Node => ({
        type: "Div",
        props: {},
        children: props.children,
      });

      const Span = (props: any): Node => ({
        type: "Span",
        props: {},
        children: props.children,
      });

      const result = compileAndEvaluate(
        "function Item({ text }) {\n  return <Span>{text}</Span>\n}\nconst labels = items.map(i => i.name);\nreturn <Div>{labels.map(l => <Item text={l} />)}</Div>",
        {
          data: { items: [{ name: "a" }, { name: "b" }] },
          components: { Div, Span },
        }
      );

      expect(result.type).toBe("Div");
      expect(result.children).toHaveLength(2);
    });
  });

  describe("String builtin", () => {
    it("should evaluate String() conversion", () => {
      const TestComponent = (props: any): Node => ({
        type: "Test",
        props,
        children: [],
      });

      const result = compileAndEvaluate("<Test value={String(42)}>Text</Test>", {
        components: { Test: TestComponent },
      });

      expect(result.props!.value).toBe("42");
    });

    it("should evaluate String() with boolean", () => {
      const TestComponent = (props: any): Node => ({
        type: "Test",
        props,
        children: [],
      });

      const result = compileAndEvaluate("<Test value={String(flag)}>Text</Test>", {
        data: { flag: true },
        components: { Test: TestComponent },
      });

      expect(result.props!.value).toBe("true");
    });
  });
});
