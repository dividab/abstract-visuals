import { describe, it, expect } from "vitest";
import { generateTypeScriptDefinitions } from "./generate-typescript-definitions.js";
import type { Schema } from "../schema.js";

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
  });

  describe("element types generation", () => {
    it("should generate element with string prop", () => {
      const schema: Schema = {
        data: {},
        elements: {
          Button: {
            props: {
              label: { type: "string", required: true },
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
              name: { type: "string", required: true },
              value: { type: "string" },
              maxLength: { type: "number" },
              disabled: { type: "boolean" },
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
              size: { type: "string", enum: ["sm", "md", "lg"] as const },
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
              style: {
                type: "object",
                shape: {
                  color: { type: "string" },
                  backgroundColor: { type: "string" },
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

    it("should generate element with array prop", () => {
      const schema: Schema = {
        data: {},
        elements: {
          List: {
            props: {
              items: {
                type: "array",
                shape: { type: "string" },
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
              onClick: { type: "function" },
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("interface ButtonProps");
      expect(result).toContain("onClick?: (...args: any[]) => any");
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
          Input: {
            props: {},
            content: false,
          } as any,
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
              label: { type: "string", description: "The button text" },
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
            props: { label: { type: "string" } },
          },
          Input: {
            props: { value: { type: "string" } },
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
          userName: { type: "string" },
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const data:");
      expect(result).toContain("userName: string");
    });

    it("should generate data with multiple property types", () => {
      const schema: Schema = {
        data: {
          name: { type: "string" },
          age: { type: "number" },
          active: { type: "boolean" },
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const data:");
      expect(result).toContain("name: string");
      expect(result).toContain("age: number");
      expect(result).toContain("active: boolean");
    });

    it("should generate data with object property", () => {
      const schema: Schema = {
        data: {
          user: {
            type: "object",
            shape: {
              name: { type: "string" },
              email: { type: "string" },
            },
          },
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const data:");
      expect(result).toContain("user:");
      expect(result).toContain("name: string");
      expect(result).toContain("email: string");
    });

    it("should generate data with nested object properties", () => {
      const schema: Schema = {
        data: {
          user: {
            type: "object",
            shape: {
              name: { type: "string" },
              profile: {
                type: "object",
                shape: {
                  avatar: { type: "string" },
                  bio: { type: "string" },
                },
              },
            },
          },
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const data:");
      expect(result).toContain("user:");
      expect(result).toContain("profile:");
      expect(result).toContain("avatar: string");
      expect(result).toContain("bio: string");
    });

    it("should generate data with array of primitives", () => {
      const schema: Schema = {
        data: {
          tags: {
            type: "array",
            shape: { type: "string" },
          },
          scores: {
            type: "array",
            shape: { type: "number" },
          },
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const data:");
      expect(result).toContain("tags: string[]");
      expect(result).toContain("scores: number[]");
    });

    it("should generate data with array of objects", () => {
      const schema: Schema = {
        data: {
          users: {
            type: "array",
            shape: {
              type: "object",
              shape: {
                name: { type: "string" },
                age: { type: "number" },
              },
            },
          },
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const data:");
      expect(result).toContain("users:");
      expect(result).toContain("name: string");
      expect(result).toContain("age: number");
      expect(result).toContain("[]");
    });

    it("should include data property descriptions as JSDoc", () => {
      const schema: Schema = {
        data: {
          userName: { type: "string", description: "The current user's name" },
          settings: {
            type: "object",
            description: "User preferences",
            shape: {
              theme: { type: "string", description: "UI theme preference" },
            },
          },
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
          status: { type: "string", enum: ["pending", "active", "completed"] as const },
          priority: { type: "number", enum: [1, 2, 3] as const },
        },
        elements: {},
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const data:");
      expect(result).toContain('status: "pending" | "active" | "completed"');
      expect(result).toContain("priority: 1 | 2 | 3");
    });
  });

  describe("combined schema", () => {
    it("should generate definitions for both components and data", () => {
      const schema: Schema = {
        data: {
          userName: { type: "string" },
          count: { type: "number" },
        },
        elements: {
          Display: {
            props: {
              text: { type: "string" },
            },
          },
          Counter: {
            props: {
              value: { type: "number" },
            },
          },
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("const data:");
      expect(result).toContain("userName: string");
      expect(result).toContain("count: number");

      expect(result).toContain("interface DisplayProps");
      expect(result).toContain("interface CounterProps");
      expect(result).toContain("const Display: (props: DisplayProps) => JSX.Element");
      expect(result).toContain("const Counter: (props: CounterProps) => JSX.Element");

      expect(result).toContain("namespace JSX");
    });

    it("should generate union types", () => {
      const schema: Schema = {
        data: {
          union: {
            type: "union",
            shape: [
              {
                type: "object",
                shape: {
                  id: {
                    type: "string",
                    enum: ["TypeA"],
                  },
                  valueA: {
                    type: "string"
                  }
                }
              },
              {
                type: "object",
                shape: {
                  id: {
                    type: "string",
                    enum: ["TypeB"],
                  },
                  valueB: {
                    type: "number"
                  }
                }
              }
            ]
          }
        }
      };

       

      const result = generateTypeScriptDefinitions(schema);
      expect(result).toContain(`id: "TypeA";\n        valueA: string;\n      } | {\n        id: "TypeB";\n        valueB: number;\n      };`);
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
                property: {
                  type: "number",
                }
              },
              {
                name: "arg2",
                property: {
                  type: "string"
                }
              }
            ]
          }
        }
      };

      const result = generateTypeScriptDefinitions(schema);
      expect(result).toContain(`function test(arg1: number, arg2: string): string;`);
    });

    it("should generate valid TypeScript that can be parsed", () => {
      const schema: Schema = {
        data: {
          user: {
            type: "object",
            shape: {
              name: { type: "string" },
              email: { type: "string" },
              settings: {
                type: "object",
                shape: {
                  theme: { type: "string", enum: ["light", "dark"] as const },
                  notifications: { type: "boolean" },
                },
              },
            },
          },
          items: {
            type: "array",
            shape: {
              type: "object",
              shape: {
                id: { type: "number" },
                title: { type: "string" },
                tags: {
                  type: "array",
                  shape: { type: "string" },
                },
              },
            },
          },
        },
        elements: {
          Card: {
            description: "A card element for displaying content",
            props: {
              title: { type: "string", required: true, description: "Card title" },
              subtitle: { type: "string", description: "Optional subtitle" },
              variant: { type: "string", enum: ["default", "outlined", "filled"] as const },
              onClick: { type: "function" },
            },
          },
          List: {
            props: {
              items: {
                type: "array",
                shape: { type: "string" },
              },
            },
            content: false,
          } as any,
        },
      };

      const result = generateTypeScriptDefinitions(schema);

      expect(result).toContain("declare global");
      expect(result).toContain("export {};");

      expect(result).toContain("const data:");
      expect(result).toContain("user:");
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
      expect(result).toContain("onClick?: (...args: any[]) => any");
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
              text: { type: "string", required: true },
              id: { type: "string", required: true },
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
          config: {
            type: "object",
            shape: {
              level1: {
                type: "object",
                shape: {
                  level2: {
                    type: "object",
                    shape: {
                      level3: {
                        type: "object",
                        shape: {
                          value: { type: "string" },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
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
          matrix: {
            type: "array",
            shape: {
              type: "array",
              shape: { type: "number" },
            },
          },
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
              id: { type: "string", required: true },
              name: { type: "string", required: true },
              title: { type: "string" },
              description: { type: "string" },
              onSubmit: { type: "function", required: true },
              onCancel: { type: "function" },
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
      expect(result).toContain("onSubmit: (...args: any[]) => any");
      expect(result).toContain("onCancel?: (...args: any[]) => any");
    });
  });
});
