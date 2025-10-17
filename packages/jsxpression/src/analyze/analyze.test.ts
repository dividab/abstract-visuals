import { describe, it, expect } from "vitest";
import { analyze } from "./analyze";
import { parse } from "../parse";
import { type Schema } from "../schema";
import { getBuiltins } from "../builtins";

describe("analyze - consolidated tests", () => {
  const baseSchema = {
    data: {
      user: {
        type: "object",
        shape: {
          name: { type: "string" },
          age: { type: "number" },
          profile: {
            type: "object",
            shape: {
              avatar: { type: "string" },
              bio: { type: "string" },
            },
          },
        },
      },
      text: { type: "string" },
      items: {
        type: "array",
        shape: { type: "string" },
      },
      numbers: {
        type: "array",
        shape: { type: "number" },
      },
      products: {
        type: "array",
        shape: {
          type: "object",
          shape: {
            name: { type: "string" },
            price: { type: "number" },
            tags: {
              type: "array",
              shape: { type: "string" },
            },
          },
        },
      },
      departments: {
        type: "array",
        shape: {
          type: "object",
          shape: {
            name: { type: "string" },
            employees: {
              type: "array",
              shape: {
                type: "object",
                shape: {
                  name: { type: "string" },
                  role: { type: "string" },
                  salary: { type: "number" },
                },
              },
            },
          },
        },
      },
    },
    elements: {
      Text: { props: {} },
      div: { props: {} },
      span: { props: {} },
    },
  } satisfies Schema;

  describe("data access validation", () => {
    describe("basic data access", () => {
      it("should allow valid data access", () => {
        const ast = parse("<Text>{data.user.name}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should allow nested object access", () => {
        const ast = parse("<Text>{data.user.profile.avatar}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should block invalid data properties", () => {
        const ast = parse("<Text>{data.user.invalid}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("Property 'data.user.invalid' does not exist in schema");
      });

      it("should block invalid nested properties", () => {
        const ast = parse("<Text>{data.user.profile.invalid}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("Property 'data.user.profile.invalid' does not exist in schema");
      });
    });

    describe("array access", () => {
      it("should allow array access with valid methods", () => {
        const ast = parse("<Text>{data.items.map(item => item)}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should allow numeric array index access", () => {
        const ast = parse("<Text>{data.items[0]}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should allow various numeric array indices", () => {
        const ast = parse("<Text>{data.items[42]} and {data.numbers[1]}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should allow nested array access with indices", () => {
        const ast = parse("<Text>{data.products[0].tags[1]}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should require array indices for nested object access", () => {
        const ast = parse("<Text>{data.products.tags}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("data.products.tags");
      });

      it("should detect typos on array properties", () => {
        const ast = parse("<Text>{data.departments.lengdth}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].code).toBe("INVALID_DATA_ACCESS");
        expect(result.errors[0].suggestions).toContain("length");
      });

      it("should allow string members on array elements", () => {
        const ast = parse("<Text>{data.items[0].length}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should allow array.at() method with positive index", () => {
        const ast = parse("<Text>{data.items.at(0)}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should allow array.at() method with negative index", () => {
        const ast = parse("<Text>{data.items.at(-1)}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should allow array.at() method in complex expressions", () => {
        const ast = parse("<Text>{data.products.at(-1).name}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should block dynamic array access with variables", () => {
        const ast = parse("<Text>{data.items[variable]}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors.some((e) => e.message.includes("variable") || e.message.includes("not allowed"))).toBe(
          true
        );
      });

      it("should block string-based computed access on objects", () => {
        const ast = parse("<Text>{data.user['name']}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors.some((e) => e.message.includes("computed member access not allowed"))).toBe(true);
      });

      it("should block mutating array methods", () => {
        const ast = parse("<Text>{data.items.push('new')}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("method .push not allowed");
      });
    });

    describe("arrow function parameter validation", () => {
      it("should validate arrow function parameters - valid access", () => {
        const ast = parse("<Text>{data.products.map((product, i) => product.name)}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should validate arrow function parameters - invalid property", () => {
        const ast = parse("<Text>{data.products.map((product, i) => product.invalid)}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("Property 'invalid' does not exist on parameter 'product'");
      });

      it("should validate nested arrow functions", () => {
        const ast = parse("<Text>{data.products.map(product => product.tags.map(tag => tag))}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should catch errors in nested arrow functions", () => {
        const ast = parse("<Text>{data.products.map(product => product.tags.map(tag => tag.invalid))}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("Cannot access property 'invalid' on string type");
      });

      it("should validate index parameters", () => {
        const ast = parse("<Text>{data.items.map((item, i) => i + 1)}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should catch invalid index parameter access", () => {
        const ast = parse("<Text>{data.items.map((item, i) => i.invalid)}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("Cannot access property 'invalid' on number type");
      });

      it("should handle complex nested scenarios", () => {
        const ast = parse(
          "<Text>{data.departments.map((dept) => dept.employees.map((employee) => employee.salary))}</Text>"
        );
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should detect typos in complex nested scenarios", () => {
        const ast = parse(
          "<Text>{data.departments.map((dept) => dept.employees.map((employee) => employee.saladry))}</Text>"
        );
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("Property 'saladry' does not exist on parameter 'employee'");
        expect(result.errors[0].suggestions).toEqual(["name", "role", "salary"]);
      });
    });
  });

  describe("method calls validation", () => {
    // Dynamic builtin schema tests - generates tests for all methods in BUILTINS
    describe("builtin methods - dynamic validation", () => {
      const builtins = getBuiltins();

      // Test each builtin object (Math, Array.prototype, String.prototype)
      Object.entries(builtins).forEach(([objectName, schema]) => {
        if (!schema.methods) return;

        describe(`${objectName} methods`, () => {
          Object.entries(schema.methods!).forEach(([methodName, methodDef]) => {
            const displayName = objectName === "Math" ? `Math.${methodName}` : methodName;

            it(`should allow ${displayName} with valid parameters`, () => {
              let testExpression: string;

              if (objectName === "Math") {
                // Math methods
                if (methodDef.params[0]?.variadic) {
                  // Variadic methods like max/min
                  testExpression = `<Text>{Math.${methodName}(1, 2, 3)}</Text>`;
                } else {
                  // Fixed parameter methods like floor/ceil
                  testExpression = `<Text>{Math.${methodName}(3.14)}</Text>`;
                }
              } else if (objectName === "Array.prototype") {
                // Array methods
                if (methodName === "map" || methodName === "filter") {
                  testExpression = `<Text>{data.items.${methodName}(x => x)}</Text>`;
                } else if (methodName === "reduce") {
                  testExpression = `<Text>{data.numbers.${methodName}((a, b) => a + b, 0)}</Text>`;
                } else if (methodName === "slice") {
                  testExpression = `<Text>{data.items.${methodName}(0, 2)}</Text>`;
                } else if (methodName === "join") {
                  testExpression = `<Text>{data.items.${methodName}(", ")}</Text>`;
                } else if (methodName === "includes" || methodName === "indexOf") {
                  testExpression = `<Text>{data.items.${methodName}("test")}</Text>`;
                } else if (methodName === "find" || methodName === "some" || methodName === "every") {
                  // These methods need proper boolean-returning callbacks
                  testExpression = `<Text>{data.items.${methodName}(x => x === "test")}</Text>`;
                } else {
                  // Other array methods with basic usage
                  testExpression = `<Text>{data.items.${methodName}(x => x.length > 0)}</Text>`;
                }
              } else if (objectName === "String.prototype") {
                // String methods
                if (methodName === "charAt" || methodName === "charCodeAt") {
                  testExpression = `<Text>{data.text.${methodName}(0)}</Text>`;
                } else if (methodName === "slice" || methodName === "substring") {
                  testExpression = `<Text>{data.text.${methodName}(0, 5)}</Text>`;
                } else if (methodName === "indexOf" || methodName === "lastIndexOf") {
                  testExpression = `<Text>{data.text.${methodName}("test")}</Text>`;
                } else if (methodName === "split") {
                  testExpression = `<Text>{data.text.${methodName}(",")}</Text>`;
                } else if (methodName === "concat") {
                  testExpression = `<Text>{data.text.${methodName}(" world")}</Text>`;
                } else if (methodName === "includes" || methodName === "startsWith" || methodName === "endsWith") {
                  testExpression = `<Text>{data.text.${methodName}("test")}</Text>`;
                } else {
                  // Methods with no parameters like trim, toLowerCase
                  testExpression = `<Text>{data.text.${methodName}()}</Text>`;
                }
              } else {
                // Fallback
                testExpression = `<Text>{${objectName}.${methodName}()}</Text>`;
              }

              const ast = parse(testExpression);
              const result = analyze(ast, baseSchema);
              expect(result.hasErrors).toBe(false);
            });

            // Test parameter validation for methods that have parameter constraints
            const requiredParams = methodDef.params.filter((p) => p.required);
            const nonVariadicParams = methodDef.params.filter((p) => !p.variadic);

            if (requiredParams.length > 0) {
              it(`should validate ${displayName} minimum parameters`, () => {
                let testExpression: string;

                if (objectName === "Math") {
                  testExpression = `<Text>{Math.${methodName}()}</Text>`;
                } else if (objectName === "Array.prototype") {
                  testExpression = `<Text>{data.items.${methodName}()}</Text>`;
                } else if (objectName === "String.prototype") {
                  testExpression = `<Text>{data.text.${methodName}()}</Text>`;
                } else {
                  testExpression = `<Text>{${objectName}.${methodName}()}</Text>`;
                }

                const ast = parse(testExpression);
                const result = analyze(ast, baseSchema);
                expect(result.hasWarnings).toBe(true);
                expect(result.warnings[0].message).toContain(
                  `${displayName} expects at least ${requiredParams.length} parameter`
                );
              });
            }

            // Test maximum parameters for non-variadic methods
            if (nonVariadicParams.length === methodDef.params.length && methodDef.params.length > 0) {
              it(`should validate ${displayName} maximum parameters`, () => {
                // Create a call with too many parameters
                const maxParams = methodDef.params.length;
                const extraParams = Array(maxParams + 2)
                  .fill("1")
                  .join(", ");

                let testExpression: string;

                if (objectName === "Math") {
                  testExpression = `<Text>{Math.${methodName}(${extraParams})}</Text>`;
                } else if (objectName === "Array.prototype") {
                  if (methodName === "map" || methodName === "filter") {
                    testExpression = `<Text>{data.items.${methodName}(x => x, {}, ${extraParams})}</Text>`;
                  } else {
                    testExpression = `<Text>{data.items.${methodName}(${extraParams})}</Text>`;
                  }
                } else if (objectName === "String.prototype") {
                  testExpression = `<Text>{data.text.${methodName}(${extraParams})}</Text>`;
                } else {
                  testExpression = `<Text>{${objectName}.${methodName}(${extraParams})}</Text>`;
                }

                const ast = parse(testExpression);
                const result = analyze(ast, baseSchema);
                expect(result.hasWarnings).toBe(true);
                expect(result.warnings[0].message).toContain(`${displayName} expects at most ${maxParams} parameter`);
              });
            }
          });
        });
      });
    });

    describe("builtin properties - dynamic validation", () => {
      const builtins = getBuiltins();

      Object.entries(builtins).forEach(([objectName, schema]) => {
        if (!schema.properties) return;

        describe(`${objectName} properties`, () => {
          Object.entries(schema.properties!).forEach(([propName, propDef]) => {
            it(`should allow ${objectName}.${propName} property access`, () => {
              let testExpression: string;

              if (objectName === "Array.prototype") {
                testExpression = `<Text>{data.items.${propName}}</Text>`;
              } else if (objectName === "String.prototype") {
                testExpression = `<Text>{data.text.${propName}}</Text>`;
              } else {
                testExpression = `<Text>{${objectName}.${propName}}</Text>`;
              }

              const ast = parse(testExpression);
              const result = analyze(ast, baseSchema);
              expect(result.hasErrors).toBe(false);
            });
          });
        });
      });
    });

    describe("blocked methods", () => {
      it("should block mutating array methods", () => {
        const blockedMethods = ["push", "pop", "shift", "unshift", "splice", "reverse", "sort"];

        blockedMethods.forEach((method) => {
          const ast = parse(`<Text>{data.items.${method}()}</Text>`);
          const result = analyze(ast, baseSchema);
          expect(result.hasErrors).toBe(true);
          expect(result.errors[0].message).toContain(`method .${method} not allowed`);
        });
      });

      it("should block Math.random (non-deterministic)", () => {
        const ast = parse("<Text>{Math.random()}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("method Math.random not allowed");
      });

      it("should block unknown methods", () => {
        const ast = parse("<Text>{Math.unknownMethod()}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("method Math.unknownMethod not allowed");
      });
    });

    describe("custom builtin schema", () => {
      it("should work with custom builtin schema", () => {
        const customSchema: Schema = {
          data: {
            value: { type: "number" },
          },
          elements: {
            Text: { props: {} },
          },
        };

        // Math.max should work with default builtins
        const ast1 = parse("<Text>{Math.max(data.value, 10)}</Text>");
        const result1 = analyze(ast1, customSchema);
        expect(result1.hasErrors).toBe(false);

        // Math.min should also work since we use BUILTINS
        const ast2 = parse("<Text>{Math.min(data.value, 10)}</Text>");
        const result2 = analyze(ast2, customSchema);
        expect(result2.hasErrors).toBe(false);
      });

      it("should allow custom String methods in builtin schema", () => {
        const customSchema: Schema = {
          data: {
            text: { type: "string" },
          },
          elements: {
            Text: { props: {} },
          },
        };

        const ast1 = parse("<Text>{data.text.toUpperCase()}</Text>");
        const result1 = analyze(ast1, customSchema);
        expect(result1.hasErrors).toBe(false);

        const ast2 = parse("<Text>{data.text.toLowerCase()}</Text>");
        const result2 = analyze(ast2, customSchema);
        expect(result2.hasErrors).toBe(false);
      });

      it("should fall back to default builtin schema when not specified", () => {
        const schemaWithoutBuiltins: Schema = {
          data: {
            x: { type: "number" },
          },
          elements: {
            Text: { props: {} },
          },
          // No builtins specified - should use default
        };

        // Should work with default builtin schema
        const ast = parse("<Text>{Math.max(data.x, 10)}</Text>");
        const result = analyze(ast, schemaWithoutBuiltins);
        expect(result.hasErrors).toBe(false);
      });
    });
  });

  describe("JSX validation", () => {
    describe("elements", () => {
      it("should allow valid elements", () => {
        const ast = parse("<Text>Hello</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should accept enum-constrained attribute values", () => {
        const schema: Schema = {
          ...baseSchema,
          elements: {
            ...baseSchema.elements,
            Badge: {
              props: {
                variant: { type: "string", enum: ["primary", "secondary"] },
              },
            },
          },
        };

        const ast = parse('<Badge variant="primary" />');
        const result = analyze(ast, schema);
        expect(result.hasWarnings).toBe(false);
        expect(result.hasErrors).toBe(false);
      });

      it("should report invalid enum attribute values", () => {
        const schema: Schema = {
          ...baseSchema,
          elements: {
            ...baseSchema.elements,
            Badge: {
              props: {
                variant: { type: "string", enum: ["primary", "secondary"] },
              },
            },
          },
        };

        const ast = parse('<Badge variant="danger" />');
        const result = analyze(ast, schema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].code).toBe("INVALID_ATTRIBUTE_VALUE");
        expect(result.errors[0].suggestions).toEqual(["primary", "secondary"]);
      });

      it("should block invalid elements", () => {
        const ast = parse("<InvalidElement>Hello</InvalidElement>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain("Element <InvalidElement> not allowed");
      });

      it("should allow nested valid elements", () => {
        const ast = parse(`
          <div>
            <Text>Hello</Text>
            <span>World</span>
          </div>
        `);
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });
    });

    describe("empty expressions", () => {
      it("should allow empty JSX expressions {} in children", () => {
        const ast = parse("<Text>{}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should allow multiple empty expressions in children", () => {
        const ast = parse("<Text>{}{}{}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should allow empty expressions mixed with content in children", () => {
        const ast = parse("<Text>Hello {}{data.user.name}{} World</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
      });

      it("should handle empty expressions without compile errors", () => {
        const ast = parse("<Text>{}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(false);
        expect(ast).toBeDefined();
        expect(ast.body).toHaveLength(1);
      });
    });
  });

  describe("security validation", () => {
    describe("disallowed identifiers", () => {
      it("should block window access", () => {
        const ast = parse("<Text>{window.alert('hack')}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain('Identifier "window" not allowed');
      });

      it("should block document access", () => {
        const ast = parse("<Text>{document.body}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain('Identifier "document" not allowed');
      });
    });

    describe("dangerous expressions", () => {
      it("should block eval", () => {
        const ast = parse("<Text>{eval('alert(1)')}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain('Identifier "eval" not allowed');
      });

      it("should block Function constructor", () => {
        const ast = parse("<Text>{new Function('return 1')()}</Text>");
        const result = analyze(ast, baseSchema);
        expect(result.hasErrors).toBe(true);
        expect(result.errors[0].message).toContain('Identifier "Function" not allowed');
      });
    });
  });

  describe("integration scenarios", () => {
    it("should catch multiple errors in complex expressions", () => {
      const ast = parse(`
        <InvalidElement>
          <Text>{data.user.invalid}</Text>
          <span>{window.location}</span>
        </InvalidElement>
      `);
      const result = analyze(ast, baseSchema);
      expect(result.hasErrors).toBe(true);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
