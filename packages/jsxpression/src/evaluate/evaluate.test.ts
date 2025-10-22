import { describe, it, expect, vi } from "vitest";
import { evaluate, type EvaluateOptions } from "./evaluate.js";
import { compile } from "../compile/index.js";
import { parse } from "../parse/index.js";

import { EvaluationError } from "./evaluation-error.js";

type Node = {
  type: string;
  props: Record<string, unknown>;
  children: Node[];
};

describe("evaluate", () => {
  const compileAndEvaluate = (source: string, options: EvaluateOptions = {}): Node => {
    return evaluate(compile(parse(source)), options);
  };

  it("should evaluate JSX with props", () => {
    const TestComponent = (props: any): Node => ({
      type: "TestComponent",
      props: { x: props.x, y: props.y },
      children: props.children,
    });

    const result = compileAndEvaluate("<Test x={data.x} y={data.y}>Hello</Test>", {
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

    const result = compileAndEvaluate("<Test value={Math.floor(data.x * Math.PI)}>Text</Test>", {
      data: { x: 5 },
      components: {
        Test: TestComponent,
      },
    });

    expect(result.props!.value).toBe(15); // floor(5 * 3.14159...) = 15
  });

  it("should throw EvaluationError for unknown component", () => {
    const compiled = compile(parse("<UnknownComponent>Hello</UnknownComponent>"));

    expect(() => evaluate(compiled, { components: {} })).toThrow(EvaluationError);
    expect(() => evaluate(compiled, { components: {} })).toThrow('component "UnknownComponent" is not allowed');
  });

  it("should deep-freeze props to prevent mutations", () => {
    const TestComponent = (props: any): Node => {
      expect(() => {
        props.nested.value = 999;
      }).toThrow();
      return { type: "Test", props, children: [] };
    };

    const compiled = compile(parse("<Test>Hello</Test>"));

    evaluate(compiled, {
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

    const result = compileAndEvaluate("<Outer x={data.x}><Inner y={data.y}>Text</Inner></Outer>", {
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

    const result = compileAndEvaluate("<Test msg={data.show ? 'visible' : 'hidden'}>Text</Test>", {
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

    const result = compileAndEvaluate("<Test values={data.items.filter(x => x > 2).map(x => x * 2)}>Text</Test>", {
      data: { items: [1, 2, 3, 4, 5] },
      components: {
        Test: TestComponent,
      },
    });

    expect(result.props!.values).toEqual([6, 8, 10]);
  });

  it("should handle runtime errors gracefully", () => {
    const compiled = compile(parse("<Test value={data.missing.nested}>Text</Test>"));
    const TestComponent = (): Node => ({ type: "Test", props: {}, children: [] });

    expect(() =>
      evaluate(compiled, {
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

    const result = compileAndEvaluate("<Test msg={data.name || 'Anonymous'}>Text</Test>", {
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

    const result = compileAndEvaluate("<Test>{data.show && 'Visible'}{false}{'Always'}</Test>", {
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

    const result = compileAndEvaluate("<Test>{}{data.value}{}</Test>", {
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
      "<Test values={data.items.filter(x => x > 2).map(x => x * 2).join(', ')}>Text</Test>",
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

    const result = compileAndEvaluate('<Test msg={"Hello " + data.name}>Text</Test>', {
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

    const result = compileAndEvaluate("<Test value={data.x + data.y * 2}>Text</Test>", {
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

    const result = compileAndEvaluate("<Test>Hello {data.name}!</Test>", {
      data: { name: "World" },
      components: { Test: TestComponent },
    });

    expect(result.children).toEqual(["Hello", "World", "!"]);
  });
});
