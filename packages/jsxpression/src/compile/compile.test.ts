import { describe, it, expect } from "vitest";
import { compile } from "../compile/index.js";
import { parse } from "../parse/index.js";

describe("compile", () => {
  it("should compile ternary expression", () => {
    const ast = parse("<div>{props.show ? 'Yes' : 'No'}</div>");
    const result = compile(ast);
    expect(result).toBe('"use strict";return h("div", null, (props.show?"Yes":"No"));');
  });

  it("should compile logical OR expression", () => {
    const ast = parse("<div>{props.value || 'default'}</div>");
    const result = compile(ast);
    expect(result).toBe('"use strict";return h("div", null, (props.value || "default"));');
  });

  it("should compile array operations", () => {
    const ast = parse("<div>{props.items.filter(x => x.length > 2).join(', ')}</div>");
    const result = compile(ast);
    expect(result).toBe('"use strict";return h("div", null, props.items.filter((x) => (x.length > 2)).join(", "));');
  });

  it("should compile object literals in props", () => {
    const ast = parse("<div style={{ color: 'red' }}>Text</div>");
    const result = compile(ast);
    expect(result).toBe('"use strict";return h("div", { style: { color: "red" } }, "Text");');
  });

  it("should compile nested ternary expressions", () => {
    const ast = parse("<div>{props.level > 2 ? 'high' : props.level > 1 ? 'medium' : 'low'}</div>");
    const result = compile(ast);
    expect(result).toBe(
      '"use strict";return h("div", null, ((props.level > 2)?"high":((props.level > 1)?"medium":"low")));'
    );
  });

  it("should compile nested JSX elements", () => {
    const ast = parse("<div><span><strong>Nested</strong></span></div>");
    const result = compile(ast);
    expect(result).toBe('"use strict";return h("div", null, h("span", null, h("strong", null, "Nested")));');
  });

  it("should compile nested array operations", () => {
    const ast = parse("<div>{props.items.map(x => x.split(',').map(y => y.trim()).join(' ')).join(' | ')}</div>");
    const result = compile(ast);
    expect(result).toBe(
      '"use strict";return h("div", null, props.items.map((x) => x.split(",").map((y) => y.trim()).join(" ")).join(" | "));'
    );
  });

  it("should compile bare expression containers", () => {
    const ast = parse("{user.name}");
    const result = compile(ast);
    expect(result).toBe('"use strict";return user.name;');
  });

  it("should compile bare mathematical expressions", () => {
    const ast = parse("{count * 2}");
    const result = compile(ast);
    expect(result).toBe('"use strict";return (count * 2);');
  });

  it("should compile bare method calls", () => {
    const ast = parse("{text.toUpperCase()}");
    const result = compile(ast);
    expect(result).toBe('"use strict";return text.toUpperCase();');
  });

  it("should compile bare complex expressions", () => {
    const ast = parse("{items.filter(x => x.length > 2).length}");
    const result = compile(ast);
    expect(result).toBe('"use strict";return items.filter((x) => (x.length > 2)).length;');
  });

  describe("JSX empty expressions", () => {
    it("should handle empty expressions in children", () => {
      const ast = parse("<Text>{}</Text>");
      const compiled = compile(ast);

      expect(compiled).toContain("return");
      expect(compiled).toContain("Text");
      // Empty expressions should be skipped, so no children array should be empty or minimal
      expect(compiled).toBeDefined();
    });

    it("should handle multiple empty expressions", () => {
      const ast = parse("<Text>{}{}{}</Text>");
      const compiled = compile(ast);

      expect(compiled).toContain("return");
      expect(compiled).toContain("Text");
      expect(compiled).toBeDefined();
    });

    it("should handle mixed empty and real expressions", () => {
      const ast = parse("<Text>Hello {}{x}{} World</Text>");
      const compiled = compile(ast);

      expect(compiled).toContain("return");
      expect(compiled).toContain("Text");
      expect(compiled).toContain("Hello");
      expect(compiled).toContain("World");
      expect(compiled).toContain("x");
    });

    it("should generate valid JavaScript code structure", () => {
      const ast = parse("<Text>{}</Text>");
      const compiled = compile(ast);

      // The compiled code should have expected structure
      expect(compiled).toMatch(/^"use strict";return .+;$/);
    });
  });

  describe("spread elements", () => {
    it("should compile spread in arrays", () => {
      const ast = parse("<div>{[...items]}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, [...items]);');
    });

    it("should compile spread in objects", () => {
      const ast = parse("<div style={{ ...styles }}>Text</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", { style: { ...styles } }, "Text");');
    });

    it("should compile mixed spread and regular elements in arrays", () => {
      const ast = parse("<div>{[1, ...items, 2]}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, [1, ...items, 2]);');
    });

    it("should compile mixed spread and regular properties in objects", () => {
      const ast = parse("<div style={{ color: 'red', ...styles, width: 100 }}>Text</div>");
      const result = compile(ast);
      expect(result).toBe(
        '"use strict";return h("div", { style: { color: "red", ...styles, width: 100 } }, "Text");'
      );
    });

    it("should compile multiple spreads in arrays", () => {
      const ast = parse("<div>{[...first, ...second]}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, [...first, ...second]);');
    });

    it("should compile multiple spreads in objects", () => {
      const ast = parse("<div style={{ ...base, ...override }}>Text</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", { style: { ...base, ...override } }, "Text");');
    });

    it("should compile spread in function call arguments", () => {
      const ast = parse("<div>{Math.max(...numbers)}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, Math.max(...numbers));');
    });

    it("should compile spread with map in function call", () => {
      const ast = parse("<div>{Math.min(...items.map(x => x.price))}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, Math.min(...items.map((x) => x.price)));');
    });

    it("should compile mixed spread and regular arguments", () => {
      const ast = parse("<div>{Math.max(0, ...numbers, 100)}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, Math.max(0, ...numbers, 100));');
    });
  });

  describe("const declarations", () => {
    it("should compile const with literal value", () => {
      const ast = parse("const x = 42;\nreturn <div>{x}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";const x = 42;return h("div", null, x);');
    });

    it("should compile const with expression value", () => {
      const ast = parse("const label = name.toUpperCase();\nreturn <div>{label}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";const label = name.toUpperCase();return h("div", null, label);');
    });

    it("should compile multiple const declarations", () => {
      const ast = parse('const a = 1;\nconst b = "hello";\nreturn <div>{a}{b}</div>');
      const result = compile(ast);
      expect(result).toBe('"use strict";const a = 1;const b = "hello";return h("div", null, a, b);');
    });

    it("should compile const with object value", () => {
      const ast = parse("const style = { color: 'red' };\nreturn <div style={style}>Text</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";const style = { color: "red" };return h("div", { style: style }, "Text");');
    });

    it("should compile const with array value", () => {
      const ast = parse("const nums = [1, 2, 3];\nreturn <div>{nums.join(', ')}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";const nums = [1, 2, 3];return h("div", null, nums.join(", "));');
    });

    it("should not auto-wrap bare JSX when declarations present", () => {
      const ast = parse("const x = 1;\n<div>{x}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";const x = 1;');
    });
  });

  describe("function declarations", () => {
    it("should compile simple function declaration", () => {
      const ast = parse("function Badge() {\n  return <span>badge</span>\n}\nreturn <Badge />");
      const result = compile(ast);
      expect(result).toBe('"use strict";function Badge() { return h("span", null, "badge"); }return h(Badge, null);');
    });

    it("should compile function with props parameter", () => {
      const ast = parse('function Badge({ label }) {\n  return <span>{label}</span>\n}\nreturn <Badge label="hi" />');
      const result = compile(ast);
      expect(result).toBe(
        '"use strict";function Badge({ label }) { return h("span", null, label); }return h(Badge, { label: "hi" });'
      );
    });

    it("should compile function with default parameter", () => {
      const ast = parse("function Badge({ label = 'default' }) {\n  return <span>{label}</span>\n}\nreturn <Badge />");
      const result = compile(ast);
      expect(result).toBe(
        '"use strict";function Badge({ label = "default" }) { return h("span", null, label); }return h(Badge, null);'
      );
    });

    it("should compile function with const inside body", () => {
      const ast = parse(
        "function Badge({ value }) {\n  const doubled = value * 2;\n  return <span>{doubled}</span>\n}\nreturn <Badge value={5} />"
      );
      const result = compile(ast);
      expect(result).toContain("const doubled = (value * 2);");
      expect(result).toContain('return h("span", null, doubled);');
    });

    it("should compile function used as child element", () => {
      const ast = parse("function Item() {\n  return <span>item</span>\n}\nreturn <div><Item /></div>");
      const result = compile(ast);
      expect(result).toContain("function Item()");
      expect(result).toContain("h(Item, null)");
      expect(result).toContain('h("div", null, h(Item, null))');
    });

    it("should compile multiple function declarations", () => {
      const ast = parse(
        "function A() {\n  return <span>a</span>\n}\nfunction B() {\n  return <span>b</span>\n}\nreturn <div><A /><B /></div>"
      );
      const result = compile(ast);
      expect(result).toContain("function A()");
      expect(result).toContain("function B()");
      expect(result).toContain("h(A, null)");
      expect(result).toContain("h(B, null)");
    });

    it("should compile function calling another function", () => {
      const ast = parse(
        "function Inner() {\n  return <span>inner</span>\n}\nfunction Outer() {\n  return <div><Inner /></div>\n}\nreturn <Outer />"
      );
      const result = compile(ast);
      expect(result).toContain("function Inner()");
      expect(result).toContain("function Outer()");
      expect(result).toContain("h(Inner, null)");
      expect(result).toContain("h(Outer, null)");
    });

    it("should emit local function names as references not strings in JSX", () => {
      const ast = parse("function Badge() {\n  return <span>b</span>\n}\nreturn <Badge />");
      const result = compile(ast);
      // Badge should be a reference, not a string
      expect(result).toContain("h(Badge, null)");
      expect(result).not.toContain('h("Badge"');
    });
  });

  describe("return statements", () => {
    it("should compile explicit return with JSX", () => {
      const ast = parse("return <div>hello</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, "hello");');
    });

    it("should compile return after const and function", () => {
      const ast = parse(
        "const x = 1;\nfunction F() {\n  return <span>f</span>\n}\nreturn <div><F />{x}</div>"
      );
      const result = compile(ast);
      expect(result).toContain("const x = 1;");
      expect(result).toContain("function F()");
      expect(result).toMatch(/return h\("div"/);
    });
  });

  // TODO: Add ChainExpression support for optional chaining (?.)
  // it("should compile nested object access with conditionals", () => {
  //   const ast = parse("<div>{props.user?.profile?.name || 'Anonymous'}</div>");
  //   const result = compile(ast);
  //   expect(result).toBe('"use strict";return h("div", null, ((props.user?.profile?.name) || "Anonymous"));');
  // });
});
