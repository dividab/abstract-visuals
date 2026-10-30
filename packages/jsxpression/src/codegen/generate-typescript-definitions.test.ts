import type { JSONSchema7 } from "json-schema";
import { describe, it, expect } from "vitest";
import type { ElementSchema, Schema } from "../schema.js";
import { generateTypeScriptDefinitions } from "./generate-typescript-definitions.js";

describe("generateTypeScriptDefinitions", () => {
  describe("basic structure", () => {
    it("should generate valid TypeScript definitions for empty schema", () => {
      const schema: Schema = {
        data: {},
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("declare global");
      expect(result).toContain("namespace JSX");
      expect(result).toContain("export {};");
    });

    it("should include builtin types declarations", () => {
      const schema: Schema = {
        data: {},
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("namespace JSX");
      expect(result).toContain("type Element");
      expect(result).toContain("type Node");
      expect(result).toContain("interface IntrinsicElements");

      expect(result).toContain("Math");
      expect(result).toContain("String");
      expect(result).toContain("Array");
    });

    it("should generate variadic parameters with array types", () => {
      const schema: Schema = {
        data: {},
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("max(...values: number[]): number");
      expect(result).toContain("min(...values: number[]): number");
    });

    it("should generate call signatures for globals called as functions", () => {
      const schema: Schema = {
        data: {},
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toMatch(/const String: \{\n(?:\s+(?:\/\*\*| \*).*\n)*\s+\(value: any\): string;/);
      expect(result).toMatch(/const Number: \{\n(?:\s+(?:\/\*\*| \*).*\n)*\s+\(value: any\): number;/);
    });

    it("should generate an index signature for reading an array's elements", () => {
      const schema: Schema = {
        data: {},
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("  interface Array<T> {\n    [n: number]: T;\n");
    });
  });

  describe("element types generation", () => {
    it("should generate element with string prop", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Button: {
            props: {
              type: "object",
              properties: {
                label: { type: "string" },
              },
              required: ["label"],
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface ButtonProps");
      expect(result).toContain("label: string");
      expect(result).toContain("const Button: (props: ButtonProps) => JSX.Element");
    });

    it("should generate element with multiple prop types", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Input: {
            props: {
              type: "object",
              properties: {
                name: { type: "string" },
                value: { type: "string" },
                maxLength: { type: "number" },
                disabled: { type: "boolean" },
              },
              required: ["name"],
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface InputProps");
      expect(result).toContain("name: string");
      expect(result).toContain("value?: string");
      expect(result).toContain("maxLength?: number");
      expect(result).toContain("disabled?: boolean");
    });

    it("should generate element with enum prop", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Button: {
            props: {
              type: "object",
              properties: {
                size: { type: "string", enum: ["sm", "md", "lg"] },
              },
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface ButtonProps");
      expect(result).toContain('size?: "sm" | "md" | "lg"');
    });

    it("should generate element with object prop", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Card: {
            props: {
              type: "object",
              properties: {
                style: {
                  type: "object",
                  properties: {
                    color: { type: "string" },
                    backgroundColor: { type: "string" },
                  },
                  required: ["color", "backgroundColor"],
                },
              },
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface CardProps");
      expect(result).toContain("style?:");
      expect(result).toContain("color: string");
      expect(result).toContain("backgroundColor: string");
    });

    it("should generate element with record prop", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            rec: {
              type: "object",
              additionalProperties: {
                type: "number",
              },
            },
          },
          required: ["rec"],
        },
        elements: {},
      };
      const result = generateTypeScriptDefinitions(schema);
      expect(result).toContain("const rec: {\n    [key: string]: number;\n  };");
    });

    it("should generate element with record that has record as value", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            rec: {
              type: "object",
              additionalProperties: {
                type: "object",
                additionalProperties: {
                  type: "number",
                },
              },
            },
          },
          required: ["rec"],
        },
        elements: {},
      };
      const result = generateTypeScriptDefinitions(schema);
      expect(result).toContain("const rec: {\n    [key: string]: {\n      [key: string]: number;\n    };\n  };");
    });

    it("should generate element with array prop", () => {
      const schema: Schema = {
        data: {},
        elements: {
          List: {
            props: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface ListProps");
      expect(result).toContain("items?: string[]");
    });

    it("should generate element with function prop", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Button: {
            props: {
              type: "object",
              properties: {
                // JSON Schema has no function type, so a function prop allows any value
                onClick: {},
              },
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface ButtonProps");
      expect(result).toContain("onClick?: any;");
    });

    it("should include children prop by default", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Container: {
            props: {},
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface ContainerProps");
      expect(result).toContain("children?: JSX.Node");
    });

    it("should exclude children prop when content is false", () => {
      const schema: Schema = {
        data: {},
        elements: {
          // `content` isn't part of ElementSchema; this intersection type documents that it's a legacy/unmodeled field being tested here.
          Input: {
            props: {},
            content: false,
          } as ElementSchema & { content: boolean },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface InputProps");
      expect(result).not.toContain("children");
    });

    it("should include element description as JSDoc", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Button: {
            description: "A clickable button element",
            props: {
              type: "object",
              properties: {
                label: { type: "string", description: "The button text" },
              },
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("A clickable button element");
      expect(result).toContain("The button text");
    });

    it("should generate multiple components", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Button: {
            props: { type: "object", properties: { label: { type: "string" } } },
          },
          Input: {
            props: { type: "object", properties: { value: { type: "string" } } },
          },
          Container: {
            props: {},
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface ButtonProps");
      expect(result).toContain("interface InputProps");
      expect(result).toContain("interface ContainerProps");
      expect(result).toContain("const Button: (props: ButtonProps) => JSX.Element");
      expect(result).toContain("const Input: (props: InputProps) => JSX.Element");
      expect(result).toContain("const Container: (props: ContainerProps) => JSX.Element");
    });
  });

  describe("data types generation", () => {
    it("should generate data with string property", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            userName: { type: "string" },
          },
          required: ["userName"],
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const userName: string");
    });

    it("should generate data with multiple property types", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            name: { type: "string" },
            age: { type: "number" },
            active: { type: "boolean" },
          },
          required: ["name", "age", "active"],
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const name: string");
      expect(result).toContain("const age: number");
      expect(result).toContain("const active: boolean");
    });

    it("should generate data with object property", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
              },
              required: ["name", "email"],
            },
          },
          required: ["user"],
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const user:");
      expect(result).toContain("name: string");
      expect(result).toContain("email: string");
    });

    it("should generate data with nested object properties", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                name: { type: "string" },
                profile: {
                  type: "object",
                  properties: {
                    avatar: { type: "string" },
                    bio: { type: "string" },
                  },
                  required: ["avatar", "bio"],
                },
              },
              required: ["name", "profile"],
            },
          },
          required: ["user"],
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const user:");
      expect(result).toContain("profile:");
      expect(result).toContain("avatar: string");
      expect(result).toContain("bio: string");
    });

    it("should generate data with array of primitives", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            tags: {
              type: "array",
              items: { type: "string" },
            },
            scores: {
              type: "array",
              items: { type: "number" },
            },
          },
          required: ["tags", "scores"],
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const tags: string[]");
      expect(result).toContain("const scores: number[]");
    });

    it("should generate data with array of objects", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            users: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  age: { type: "number" },
                },
                required: ["name", "age"],
              },
            },
          },
          required: ["users"],
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const users:");
      expect(result).toContain("name: string");
      expect(result).toContain("age: number");
      expect(result).toContain("[]");
    });

    it("should include data property descriptions as JSDoc", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            userName: { type: "string", description: "The current user's name" },
            settings: {
              type: "object",
              description: "User preferences",
              properties: {
                theme: { type: "string", description: "UI theme preference" },
              },
              required: ["theme"],
            },
          },
          required: ["userName", "settings"],
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("The current user's name");
      expect(result).toContain("User preferences");
      expect(result).toContain("UI theme preference");
    });

    it("should generate data with enum values", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            status: { type: "string", enum: ["pending", "active", "completed"] },
            priority: { type: "number", enum: [1, 2, 3] },
          },
          required: ["status", "priority"],
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const status:");
      expect(result).toContain('"pending" | "active" | "completed"');
      expect(result).toContain("const priority:");
      expect(result).toContain("1 | 2 | 3");
    });
  });

  describe("combined schema", () => {
    it("should generate definitions for both components and data", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            userName: { type: "string" },
            count: { type: "number" },
          },
          required: ["userName", "count"],
        },
        elements: {
          Display: {
            props: {
              type: "object",
              properties: {
                text: { type: "string" },
              },
            },
          },
          Counter: {
            props: {
              type: "object",
              properties: {
                value: { type: "number" },
              },
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const userName: string");
      expect(result).toContain("const count: number");

      expect(result).toContain("interface DisplayProps");
      expect(result).toContain("interface CounterProps");
      expect(result).toContain("const Display: (props: DisplayProps) => JSX.Element");
      expect(result).toContain("const Counter: (props: CounterProps) => JSX.Element");

      expect(result).toContain("namespace JSX");
    });

    it("should generate union types", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            union: {
              anyOf: [
                {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      enum: ["TypeA"],
                    },
                    valueA: {
                      type: "string",
                    },
                  },
                  required: ["id", "valueA"],
                },
                {
                  type: "object",
                  properties: {
                    id: {
                      type: "string",
                      enum: ["TypeB"],
                    },
                    valueB: {
                      type: "number",
                    },
                  },
                  required: ["id", "valueB"],
                },
              ],
            },
          },
          required: ["union"],
        },
      };

      const result = generateTypeScriptDefinitions(schema);
      expect(result).toContain(`const union: {\n    id: "TypeA";\n    valueA: string;\n  } | {\n    id: "TypeB";\n    valueB: number;\n  };`);
    });

    it("should generate functions", () => {
      const schema: Schema = {
        functions: {
          test: {
            ret: {
              type: "string",
            },
            args: [
              {
                name: "arg1",
                schema: {
                  type: "number",
                },
              },
              {
                name: "arg2",
                schema: {
                  type: "string",
                },
              },
            ],
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);
      expect(result).toContain(`function test(arg1: number, arg2: string): string;`);
    });

    it("should generate valid TypeScript that can be parsed", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            user: {
              type: "object",
              properties: {
                name: { type: "string" },
                email: { type: "string" },
                settings: {
                  type: "object",
                  properties: {
                    theme: { type: "string", enum: ["light", "dark"] },
                    notifications: { type: "boolean" },
                  },
                  required: ["theme", "notifications"],
                },
              },
              required: ["name", "email", "settings"],
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  id: { type: "number" },
                  title: { type: "string" },
                  tags: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["id", "title", "tags"],
              },
            },
          },
          required: ["user", "items"],
        },
        elements: {
          Card: {
            description: "A card element for displaying content",
            props: {
              type: "object",
              properties: {
                title: { type: "string", description: "Card title" },
                subtitle: { type: "string", description: "Optional subtitle" },
                variant: { type: "string", enum: ["default", "outlined", "filled"] },
                // JSON Schema has no function type, so a function prop allows any value
                onClick: {},
              },
              required: ["title"],
            },
          },
          List: {
            props: {
              type: "object",
              properties: {
                items: {
                  type: "array",
                  items: { type: "string" },
                },
              },
            },
            // `content` isn't part of ElementSchema; this intersection type documents that it's a legacy/unmodeled field being tested here.
            content: false,
          } as ElementSchema & { content: boolean },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("declare global");
      expect(result).toContain("export {};");

      expect(result).toContain("const user:");
      expect(result).toContain("name: string");
      expect(result).toContain("email: string");
      expect(result).toContain("settings:");
      expect(result).toContain('theme: "light" | "dark"');
      expect(result).toContain("notifications: boolean");
      expect(result).toContain("items:");
      expect(result).toContain("id: number");
      expect(result).toContain("tags: string[]");

      expect(result).toContain("interface CardProps");
      expect(result).toContain("title: string");
      expect(result).toContain("subtitle?: string");
      expect(result).toContain('variant?: "default" | "outlined" | "filled"');
      expect(result).toContain("onClick?: any;");
      expect(result).toContain("children?: JSX.Node");
      expect(result).toContain("A card element for displaying content");

      expect(result).toContain("interface ListProps");
      expect(result).toContain("items?: string[]");
      expect(result).not.toMatch(/interface ListProps\s*{[^}]*children/);

      expect(result).toContain("namespace JSX");
      expect(result).toContain("Math");
      expect(result).toContain("const Card: (props: CardProps) => JSX.Element");
      expect(result).toContain("const List: (props: ListProps) => JSX.Element");
    });
  });

  describe("edge cases", () => {
    it("should handle empty props object", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Divider: {
            props: {},
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface DividerProps");
      expect(result).toContain("children?: JSX.Node");
      expect(result).toContain("const Divider: (props: DividerProps) => JSX.Element");
    });

    it("should handle element with only required props", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Label: {
            props: {
              type: "object",
              properties: {
                text: { type: "string" },
                id: { type: "string" },
              },
              required: ["text", "id"],
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface LabelProps");
      expect(result).toContain("text: string");
      expect(result).toContain("id: string");
      expect(result).not.toMatch(/text\?:/);
      expect(result).not.toMatch(/id\?:/);
    });

    it("should handle deeply nested object structures", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            config: {
              type: "object",
              properties: {
                level1: {
                  type: "object",
                  properties: {
                    level2: {
                      type: "object",
                      properties: {
                        level3: {
                          type: "object",
                          properties: {
                            value: { type: "string" },
                          },
                          required: ["value"],
                        },
                      },
                      required: ["level3"],
                    },
                  },
                  required: ["level2"],
                },
              },
              required: ["level1"],
            },
          },
          required: ["config"],
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("config:");
      expect(result).toContain("level1:");
      expect(result).toContain("level2:");
      expect(result).toContain("level3:");
      expect(result).toContain("value: string");
    });

    it("should handle array of arrays", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            matrix: {
              type: "array",
              items: {
                type: "array",
                items: { type: "number" },
              },
            },
          },
          required: ["matrix"],
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("matrix: number[][]");
    });

    it("should handle mixed required and optional props", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Form: {
            props: {
              type: "object",
              properties: {
                id: { type: "string" },
                name: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                // JSON Schema has no function type, so a function prop allows any value
                onSubmit: {},
                onCancel: {},
              },
              required: ["id", "name", "onSubmit"],
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface FormProps");
      expect(result).toContain("id: string");
      expect(result).toContain("name: string");
      expect(result).toContain("title?: string");
      expect(result).toContain("description?: string");
      expect(result).toContain("onSubmit: any;");
      expect(result).toContain("onCancel?: any;");
    });
  });

  describe("$defs", () => {
    const component: JSONSchema7 = {
      type: "object",
      properties: { name: { type: "string" }, children: { type: "array", items: { $ref: "#/$defs/Component" } } },
      required: ["name", "children"],
    };

    it("should declare a $def as a named type and refer to it by name", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: { components: { type: "array", items: { $ref: "#/$defs/Component" } } },
          required: ["components"],
          $defs: { Component: component },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("  type Component = {\n    name: string;\n");
      expect(result).toContain("    children: Component[];\n  };\n");
      expect(result).toContain("const components: Component[];");
    });

    it("should refer to the data's $defs by name in function arguments and return values", () => {
      const schema: Schema = {
        data: { type: "object", properties: {}, $defs: { Component: component } },
        functions: {
          first: {
            args: [{ name: "components", schema: { type: "array", items: { $ref: "#/$defs/Component" } } }],
            ret: { $ref: "#/$defs/Component" },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("function first(components: Component[]): Component;");
    });

    it("should name $defs whose keys aren't identifiers, or make the same identifier, apart", () => {
      const schema: Schema = {
        data: {
          type: "object",
          properties: { a: { $ref: "#/$defs/tree-node" }, b: { $ref: "#/$defs/tree_node" } },
          required: ["a", "b"],
          $defs: {
            "tree-node": { type: "object", properties: { next: { $ref: "#/$defs/tree-node" } }, required: ["next"] },
            tree_node: {
              type: "object",
              properties: { byKey: { type: "object", additionalProperties: { anyOf: [{ $ref: "#/$defs/tree_node" }, { type: "string" }] } } },
              required: ["byKey"],
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("type tree_node = {\n");
      expect(result).toContain(
        "    next: tree_node;\n  };\n  type tree_node2 = {\n    byKey: {\n      [key: string]: tree_node2 | string;\n    };\n  };"
      );
      expect(result).toContain("const a: tree_node;");
      expect(result).toContain("const b: tree_node2;");
    });

    it("should keep a schema used in several places, but not as a $def, inline", () => {
      const point: JSONSchema7 = { type: "object", properties: { x: { type: "number" } }, required: ["x"] };

      const result = generateTypeScriptDefinitions({ data: { type: "object", properties: { from: point, to: point }, required: ["from", "to"] } });

      expect(result).toContain("declare global {\n  const from: {\n    x: number;\n  };\n  const to: {\n    x: number;\n  };\n}");
    });
  });

  describe("propertyNames", () => {
    it("should declare the names propertyNames list as there, only those if it enumerates them, else besides an index signature", () => {
      const value: JSONSchema7 = { type: "string" };
      const schema: Schema = {
        data: {
          type: "object",
          properties: {
            images: { type: "object", propertyNames: { enum: ["front", "side"] }, additionalProperties: value },
            node: { type: "object", propertyNames: { anyOf: [{ enum: ["baseframe"] }, { type: "string" }] }, additionalProperties: value },
          },
          required: ["images", "node"],
        },
      };
      const result = generateTypeScriptDefinitions(schema);
      expect(result).toContain("  const images: {\n    front: string;\n    side: string;\n  };");
      expect(result).toContain("  const node: {\n    baseframe: string;\n    [key: string]: string;\n  };");
    });
  });
});
