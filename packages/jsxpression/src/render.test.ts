import { describe, it, expect } from "vitest";
import { render } from "./render.js";
import { ParseError } from "./parse/index.js";
import { AnalysisError } from "./analyze/index.js";
import { EvaluationError } from "./evaluate/index.js";

type TestNode = {
  type: string;
  props?: Record<string, unknown>;
  children: unknown[];
};

describe("render", () => {
  it("should render complete JSX pipeline successfully", () => {
    const TestComponent = (props: { x: number; y: number }, ...children: any[]): TestNode => ({
      type: "TestComponent",
      props,
      children,
    });

    const result = render(
      "<Test x={data.x} y={Math.floor(data.y)}>Hello</Test>",
      {
        data: {
          x: { type: "number" },
          y: { type: "number" },
        },
        elements: {
          Test: {
            props: {
              x: { type: "number" },
              y: { type: "number" },
            },
          },
        },
      },
      {
        data: { x: 10, y: 3.7 },
        components: { Test: TestComponent },
      }
    );

    expect(result.type).toBe("TestComponent");
    expect(result.props).toEqual({ x: 10, y: 3 });
    expect(result.children).toEqual(["Hello"]);
  });

  it("should render complex expressions end-to-end", () => {
    const TestComponent = (props: { values: string }): TestNode => ({
      type: "TestComponent",
      props,
      children: [],
    });

    const result = render(
      "<Test values={data.items.filter(x => x > 2).map(x => x * 2).join(', ')}>Text</Test>",
      {
        data: {
          items: { type: "array", shape: { type: "number" } },
        },
        elements: {
          Test: {
            props: {
              values: { type: "string" },
            },
          },
        },
      },
      {
        data: { items: [1, 2, 3, 4, 5] },
        components: { Test: TestComponent },
      }
    );

    expect(result.props.values).toBe("6, 8, 10");
  });

  it("should render nested JSX elements", () => {
    const OuterComponent = (props: { x: number }, ...children: any[]): TestNode => ({
      type: "OuterComponent",
      props,
      children,
    });

    const InnerComponent = (props: { y: number }): TestNode => ({
      type: "InnerComponent",
      props,
      children: [],
    });

    const result = render(
      "<Outer x={10}><Inner y={20}>Nested</Inner></Outer>",
      {
        elements: {
          Outer: {
            props: {
              x: { type: "number" },
            },
          },
          Inner: {
            props: {
              y: { type: "number" },
            },
          },
        },
      },
      {
        data: {},
        components: {
          Outer: OuterComponent,
          Inner: InnerComponent,
        },
      }
    );

    expect(result.type).toBe("OuterComponent");
    expect(result.props).toEqual({ x: 10 });
    expect(result.children).toHaveLength(1);
    expect(result.children[0].type).toBe("InnerComponent");
  });

  it("should render JSX fragments", () => {
    const TestComponent = (): TestNode => ({
      type: "Test",
      props: {},
      children: [],
    });

    const result = render(
      "<><Test>A</Test><Test>B</Test></>",
      {
        elements: {
          Test: {
            props: {},
          },
        },
      },
      {
        data: {},
        components: { Test: TestComponent },
      }
    );

    expect(result).toBeDefined();
  });

  it("should render bare expression containers", () => {
    const result = render(
      "{data.user.name}",
      {
        data: {
          user: {
            type: "object",
            shape: {
              name: { type: "string" },
            },
          },
        },
        elements: {},
      },
      {
        data: { user: { name: "Alice" } },
        components: {},
      }
    );

    expect(result).toBe("Alice");
  });

  it("should render bare mathematical expressions", () => {
    const result = render(
      "{data.count * 2}",
      {
        data: {
          count: { type: "number" },
        },
        elements: {},
      },
      {
        data: { count: 42 },
        components: {},
      }
    );

    expect(result).toBe(84);
  });

  it("should render bare method calls", () => {
    const result = render(
      "{data.text.toUpperCase()}",
      {
        data: {
          text: { type: "string" },
        },
        elements: {},
      },
      {
        data: { text: "hello world" },
        components: {},
      }
    );

    expect(result).toBe("HELLO WORLD");
  });

  it("should render bare complex expressions", () => {
    const result = render(
      "{data.numbers.map(x => x * 2).join(', ')}",
      {
        data: {
          numbers: {
            type: "array",
            shape: { type: "number" },
          },
        },
        elements: {},
      },
      {
        data: { numbers: [1, 2, 3, 4] },
        components: {},
      }
    );

    expect(result).toBe("2, 4, 6, 8");
  });

  it("should propagate ParseError for syntax errors", () => {
    const TestComponent = (): TestNode => ({ type: "Test", props: {}, children: [] });

    expect(() =>
      render(
        "<Text>Unclosed",
        {
          elements: {
            Text: {
              props: {},
            },
          },
        },
        {
          components: { Text: TestComponent },
        }
      )
    ).toThrow(ParseError);
  });

  it("should propagate AnalysisError for disallowed identifiers", () => {
    const TestComponent = (): TestNode => ({ type: "Test", props: {}, children: [] });

    expect(() =>
      render(
        "<Text>{window.location}</Text>",
        {
          elements: {
            Text: {
              props: {},
            },
          },
        },
        {
          components: { Text: TestComponent },
        }
      )
    ).toThrow(AnalysisError);
  });

  it("should propagate AnalysisError for unknown JSX elements", () => {
    const TestComponent = (): TestNode => ({ type: "Test", props: {}, children: [] });

    expect(() =>
      render(
        "<UnknownElement>Hello</UnknownElement>",
        {
          elements: {
            Text: {
              props: {},
            },
          },
        },
        {
          components: { Text: TestComponent },
        }
      )
    ).toThrow(AnalysisError);
  });

  it("should propagate AnalysisError for disallowed methods", () => {
    const TestComponent = (): TestNode => ({ type: "Test", props: {}, children: [] });

    expect(() =>
      render(
        "<Test>{data.items.push(1)}</Test>",
        {
          data: {
            items: {
              type: "array",
              shape: { type: "number" },
            },
          },
          elements: {
            Test: {
              props: {},
            },
          },
        },
        {
          data: { items: [1, 2, 3] },
          components: { Test: TestComponent },
        }
      )
    ).toThrow(AnalysisError);
  });

  it("should propagate AnalysisError for unknown components", () => {
    const TestComponent = (): TestNode => ({ type: "Test", props: {}, children: [] });

    expect(() =>
      render(
        "<Test>Hello</Test>",
        {
          elements: {
            Test: {
              props: {},
            },
          },
        },
        {
          data: {},
          components: { Test: TestComponent },
        }
      )
    ).not.toThrow();

    expect(() =>
      render("<Other>Hello</Other>", {
        elements: {},
      })
    ).toThrow(AnalysisError);
  });

  it("should propagate EvaluationError for runtime errors", () => {
    const TestComponent = (): TestNode => ({ type: "Test", props: {}, children: [] });

    expect(() =>
      render(
        "<Test value={data.missing.nested}>Hello</Test>",
        {
          data: {
            missing: {
              type: "object",
              shape: {
                nested: { type: "number" },
              },
            },
          },
          elements: {
            Test: {
              props: {
                value: { type: "number" },
              },
            },
          },
        },
        {
          data: {},
          components: { Test: TestComponent },
        }
      )
    ).toThrow(EvaluationError);
  });

  it("should handle empty options", () => {
    expect(() => render("<Test>Hello</Test>", { elements: {} })).toThrow(AnalysisError);
  });

  it("should handle empty props", () => {
    const TestComponent = (): TestNode => ({ type: "TestComponent", props: {}, children: [] });

    const result = render(
      "<Test>Hello</Test>",
      {
        elements: {
          Test: {
            props: {},
          },
        },
      },
      {
        components: { Test: TestComponent },
      }
    );

    expect(result.type).toBe("TestComponent");
  });

  it("should handle conditional rendering with props", () => {
    const TestComponent = (props: { msg: string }): TestNode => ({
      type: "Test",
      props,
      children: [],
    });

    const result = render(
      "<Test msg={data.show ? 'visible' : 'hidden'}>Text</Test>",
      {
        data: {
          show: { type: "boolean" },
        },
        elements: {
          Test: {
            props: {
              msg: { type: "string" },
            },
          },
        },
      },
      {
        data: { show: false },
        components: { Test: TestComponent },
      }
    );

    expect(result.props!.msg).toBe("hidden");
  });
});
