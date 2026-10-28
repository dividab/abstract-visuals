/* oxlint-disable unicorn/consistent-function-scoping -- each test's mock component is colocated with the test it belongs to; hoisting them to module scope would force artificial unique names and separate them from their usage */
import { describe, expect, it } from "vitest";
import { AnalysisError } from "./analyze/index.js";
import { EvaluationError } from "./evaluate/index.js";
import { ParseError } from "./parse/index.js";
import { render } from "./render.js";

/** A node the tests' components return, with the props the template gave them */
type TestNode<P = Record<string, unknown>> = {
  type: string;
  props: P;
  children: Array<unknown>;
};

describe("render", () => {
  it("should render complete JSX pipeline successfully", () => {
    const TestComponent = ({ children, ...props }: { x: number; y: number; children?: Array<unknown> }): TestNode => ({
      type: "TestComponent",
      props,
      children: children ?? [],
    });

    const result = render<TestNode>(
      "<Test x={x} y={Math.floor(y)}>Hello</Test>",
      {
        data: {
          type: "object",
          properties: {
            x: { type: "number" },
            y: { type: "number" },
          },
          required: ["x", "y"],
        },
        elements: {
          Test: {
            props: {
              type: "object",
              properties: {
                x: { type: "number" },
                y: { type: "number" },
              },
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

    const result = render<TestNode<{ values: string }>>(
      "<Test values={items.filter(x => x > 2).map(x => x * 2).join(', ')}>Text</Test>",
      {
        data: {
          type: "object",
          properties: {
            items: { type: "array", items: { type: "number" } },
          },
          required: ["items"],
        },
        elements: {
          Test: {
            props: {
              type: "object",
              properties: {
                values: { type: "string" },
              },
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
    const OuterComponent = ({ children, ...props }: { x: number; children?: Array<unknown> }): TestNode => ({
      type: "OuterComponent",
      props,
      children: children ?? [],
    });

    const InnerComponent = ({ children, ...props }: { y: number; children?: Array<unknown> }): TestNode => ({
      type: "InnerComponent",
      props,
      children: children ?? [],
    });

    const result = render<TestNode>(
      "<Outer x={10}><Inner y={20}>Nested</Inner></Outer>",
      {
        elements: {
          Outer: {
            props: {
              type: "object",
              properties: {
                x: { type: "number" },
              },
            },
          },
          Inner: {
            props: {
              type: "object",
              properties: {
                y: { type: "number" },
              },
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
    expect((result.children[0] as TestNode).type).toBe("InnerComponent");
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
      "{user.name}",
      {
        data: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                name: { type: "string" },
              },
              required: ["name"],
            },
          },
          required: ["user"],
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
      "{count * 2}",
      {
        data: {
          type: "object",
          properties: {
            count: { type: "number" },
          },
          required: ["count"],
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
      "{text.toUpperCase()}",
      {
        data: {
          type: "object",
          properties: {
            text: { type: "string" },
          },
          required: ["text"],
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
      "{numbers.map(x => x * 2).join(', ')}",
      {
        data: {
          type: "object",
          properties: {
            numbers: {
              type: "array",
              items: { type: "number" },
            },
          },
          required: ["numbers"],
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
    const TestComponent = (): TestNode => ({
      type: "Test",
      props: {},
      children: [],
    });

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

  it("should propagate EvaluationError for disallowed identifiers (analyzeIdentifiers disabled)", () => {
    const TestComponent = (): TestNode => ({
      type: "Test",
      props: {},
      children: [],
    });

    // analyzeIdentifiers is currently disabled in analyze.ts, so bare property access on an
    // undeclared global like `window` is no longer caught at analysis time — it now fails at
    // evaluation time instead, once the identifier turns out to be undefined at runtime.
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
    ).toThrow(EvaluationError);
  });

  it("should propagate AnalysisError for unknown JSX elements", () => {
    const TestComponent = (): TestNode => ({
      type: "Test",
      props: {},
      children: [],
    });

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
    const TestComponent = (): TestNode => ({
      type: "Test",
      props: {},
      children: [],
    });

    expect(() =>
      render(
        "<Test>{items.push(1)}</Test>",
        {
          data: {
            type: "object",
            properties: {
              items: {
                type: "array",
                items: { type: "number" },
              },
            },
            required: ["items"],
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
    const TestComponent = (): TestNode => ({
      type: "Test",
      props: {},
      children: [],
    });

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
    const TestComponent = (): TestNode => ({
      type: "Test",
      props: {},
      children: [],
    });

    expect(() =>
      render(
        "<Test value={missing.nested}>Hello</Test>",
        {
          data: {
            type: "object",
            properties: {
              missing: {
                type: "object",
                properties: {
                  nested: { type: "number" },
                },
                required: ["nested"],
              },
            },
            required: ["missing"],
          },
          elements: {
            Test: {
              props: {
                type: "object",
                properties: {
                  value: { type: "number" },
                },
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
    const TestComponent = (): TestNode => ({
      type: "TestComponent",
      props: {},
      children: [],
    });

    const result = render<TestNode>(
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

    const result = render<TestNode<{ msg: string }>>(
      "<Test msg={show ? 'visible' : 'hidden'}>Text</Test>",
      {
        data: {
          type: "object",
          properties: {
            show: { type: "boolean" },
          },
          required: ["show"],
        },
        elements: {
          Test: {
            props: {
              type: "object",
              properties: {
                msg: { type: "string" },
              },
            },
          },
        },
      },
      {
        data: { show: false },
        components: { Test: TestComponent },
      }
    );

    expect(result.props.msg).toBe("hidden");
  });

  it("should tolerate TypeScript syntax in templates", () => {
    const TestComponent = ({ children, ...props }: Record<string, unknown>): TestNode => ({
      type: "Test",
      props,
      children: children ? [children].flat() : [],
    });

    const result = render<TestNode<{ x: number }>>(
      "interface Nice {\n  semi: true\n}\n\nreturn <Test x={10}>Hello</Test>",
      {
        data: {},
        elements: {
          Test: {
            props: {
              type: "object",
              properties: {
                x: { type: "number" },
              },
            },
          },
        },
      },
      {
        data: {},
        components: { Test: TestComponent },
      }
    );

    expect(result.type).toBe("Test");
    expect(result.props.x).toBe(10);
  });

  describe("const declarations end-to-end", () => {
    it("should render with const used in prop", () => {
      const TestComponent = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Test",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode<{ value: number }>>(
        "const doubled = count * 2;\nreturn <Test value={doubled}>Text</Test>",
        {
          data: {
            type: "object",
            properties: {
              count: { type: "number" },
            },
            required: ["count"],
          },
          elements: {
            Test: {
              props: {
                type: "object",
                properties: {
                  value: { type: "number" },
                },
              },
            },
          },
        },
        {
          data: { count: 7 },
          components: { Test: TestComponent },
        }
      );

      expect(result.props.value).toBe(14);
    });

    it("should render with const used in children", () => {
      const TestComponent = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Test",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode>(
        "const upper = name.toUpperCase();\nreturn <Test>{upper}</Test>",
        {
          data: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
          elements: {
            Test: { props: {} },
          },
        },
        {
          data: { name: "alice" },
          components: { Test: TestComponent },
        }
      );

      expect(result.children).toEqual(["ALICE"]);
    });

    it("should render with multiple consts chained", () => {
      const TestComponent = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Test",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode<{ count: number }>>(
        "const filtered = items.filter(x => x > 2);\nconst total = filtered.length;\nreturn <Test count={total}>Text</Test>",
        {
          data: {
            type: "object",
            properties: {
              items: { type: "array", items: { type: "number" } },
            },
            required: ["items"],
          },
          elements: {
            Test: {
              props: {
                type: "object",
                properties: {
                  count: { type: "number" },
                },
              },
            },
          },
        },
        {
          data: { items: [1, 2, 3, 4, 5] },
          components: { Test: TestComponent },
        }
      );

      expect(result.props.count).toBe(3);
    });
  });

  describe("function declarations end-to-end", () => {
    it("should render with user-defined component", () => {
      const Span = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Span",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode>(
        'function Badge({ label }) {\n  return <Span>{label}</Span>\n}\nreturn <Badge label="hello" />',
        {
          data: {},
          elements: {
            Span: { props: {} },
          },
        },
        {
          data: {},
          components: { Span },
        }
      );

      expect(result.type).toBe("Span");
      expect(result.children).toEqual(["hello"]);
    });

    it("should render with nested user-defined components", () => {
      const Span = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Span",
        props,
        children: children ? [children].flat() : [],
      });

      const Div = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Div",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode>(
        'function Label({ text }) {\n  return <Span>{text}</Span>\n}\nfunction Card({ title }) {\n  return <Div><Label text={title} /></Div>\n}\nreturn <Card title="world" />',
        {
          data: {},
          elements: {
            Span: { props: {} },
            Div: { props: {} },
          },
        },
        {
          data: {},
          components: { Span, Div },
        }
      );

      expect(result.type).toBe("Div");
      expect(result.children).toHaveLength(1);
      expect((result.children[0] as TestNode).type).toBe("Span");
      expect((result.children[0] as TestNode).children).toEqual(["world"]);
    });

    it("should render function component with default props", () => {
      const Span = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Span",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode>(
        "function Tag({ label = 'default' }) {\n  return <Span>{label}</Span>\n}\nreturn <Tag />",
        {
          data: {},
          elements: {
            Span: { props: {} },
          },
        },
        {
          data: {},
          components: { Span },
        }
      );

      expect(result.children).toEqual(["default"]);
    });

    it("should render function component accessing data", () => {
      const Span = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Span",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode>(
        "function Greeting() {\n  return <Span>Hello {name}</Span>\n}\nreturn <Greeting />",
        {
          data: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
          elements: {
            Span: { props: {} },
          },
        },
        {
          data: { name: "World" },
          components: { Span },
        }
      );

      expect(result.children).toEqual(["Hello", "World"]);
    });

    it("should render function component with children", () => {
      const Div = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Div",
        props,
        children: children ? [children].flat() : [],
      });

      const Span = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Span",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode>(
        "function Wrapper({ children }) {\n  return <Div>{children}</Div>\n}\nreturn <Wrapper><Span>inside</Span></Wrapper>",
        {
          data: {},
          elements: {
            Div: { props: {} },
            Span: { props: {} },
          },
        },
        {
          data: {},
          components: { Div, Span },
        }
      );

      expect(result.type).toBe("Div");
      expect(result.children).toHaveLength(1);
      expect((result.children[0] as TestNode).type).toBe("Span");
    });
  });

  describe("const + function combined end-to-end", () => {
    it("should render template with const and function together", () => {
      const Span = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Span",
        props,
        children: children ? [children].flat() : [],
      });

      const Div = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Div",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode>(
        "const title = name.toUpperCase();\nfunction Header({ text }) {\n  return <Span>{text}</Span>\n}\nreturn <Div><Header text={title} /></Div>",
        {
          data: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
          elements: {
            Span: { props: {} },
            Div: { props: {} },
          },
        },
        {
          data: { name: "hello" },
          components: { Span, Div },
        }
      );

      expect(result.type).toBe("Div");
      expect(result.children).toHaveLength(1);
      expect((result.children[0] as TestNode).children).toEqual(["HELLO"]);
    });

    it("should render with map over data using function component", () => {
      const Span = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Span",
        props,
        children: children ? [children].flat() : [],
      });

      const Div = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Div",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode>(
        "function Item({ label }) {\n  return <Span>{label}</Span>\n}\nreturn <Div>{items.map(i => <Item label={i} />)}</Div>",
        {
          data: {
            type: "object",
            properties: {
              items: { type: "array", items: { type: "string" } },
            },
            required: ["items"],
          },
          elements: {
            Span: { props: {} },
            Div: { props: {} },
          },
        },
        {
          data: { items: ["a", "b", "c"] },
          components: { Span, Div },
        }
      );

      expect(result.type).toBe("Div");
      expect(result.children).toHaveLength(3);
      expect((result.children[0] as TestNode).children).toEqual(["a"]);
      expect((result.children[1] as TestNode).children).toEqual(["b"]);
      expect((result.children[2] as TestNode).children).toEqual(["c"]);
    });
  });

  describe("String builtin end-to-end", () => {
    it("should render with String() conversion", () => {
      const TestComponent = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Test",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode<{ value: string }>>(
        "<Test value={String(count)}>Text</Test>",
        {
          data: {
            type: "object",
            properties: {
              count: { type: "number" },
            },
            required: ["count"],
          },
          elements: {
            Test: {
              props: {
                type: "object",
                properties: {
                  value: { type: "string" },
                },
              },
            },
          },
        },
        {
          data: { count: 42 },
          components: { Test: TestComponent },
        }
      );

      expect(result.props.value).toBe("42");
    });
  });

  describe("return requirement end-to-end", () => {
    it("should throw AnalysisError for template with const but no return", () => {
      const TestComponent = (): TestNode => ({
        type: "Test",
        props: {},
        children: [],
      });

      expect(() =>
        render(
          "const x = 1;\n<Test>hello</Test>",
          {
            data: {},
            elements: {
              Test: { props: {} },
            },
          },
          {
            data: {},
            components: { Test: TestComponent },
          }
        )
      ).toThrow(AnalysisError);
    });

    it("should work with const + explicit return", () => {
      const TestComponent = ({ children, ...props }: Record<string, unknown>): TestNode => ({
        type: "Test",
        props,
        children: children ? [children].flat() : [],
      });

      const result = render<TestNode<{ value: number }>>(
        "const x = 1;\nreturn <Test value={x}>hello</Test>",
        {
          data: {},
          elements: {
            Test: {
              props: {
                type: "object",
                properties: {
                  value: { type: "number" },
                },
              },
            },
          },
        },
        {
          data: {},
          components: { Test: TestComponent },
        }
      );

      expect(result.props.value).toBe(1);
    });
  });
});
