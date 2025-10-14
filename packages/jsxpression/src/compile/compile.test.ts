import { describe, it, expect } from "vitest";
import { compile } from "../compile";
import { parse } from "../parse";

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
    const ast = parse("{data.user.name}");
    const result = compile(ast);
    expect(result).toBe('"use strict";return data.user.name;');
  });

  it("should compile bare mathematical expressions", () => {
    const ast = parse("{data.count * 2}");
    const result = compile(ast);
    expect(result).toBe('"use strict";return (data.count * 2);');
  });

  it("should compile bare method calls", () => {
    const ast = parse("{data.text.toUpperCase()}");
    const result = compile(ast);
    expect(result).toBe('"use strict";return data.text.toUpperCase();');
  });

  it("should compile bare complex expressions", () => {
    const ast = parse("{data.items.filter(x => x.length > 2).length}");
    const result = compile(ast);
    expect(result).toBe('"use strict";return data.items.filter((x) => (x.length > 2)).length;');
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
      const ast = parse("<Text>Hello {}{data.x}{} World</Text>");
      const compiled = compile(ast);

      expect(compiled).toContain("return");
      expect(compiled).toContain("Text");
      expect(compiled).toContain("Hello");
      expect(compiled).toContain("World");
      expect(compiled).toContain("data.x");
    });

    it("should generate valid JavaScript code structure", () => {
      const ast = parse("<Text>{}</Text>");
      const compiled = compile(ast);

      // The compiled code should have expected structure
      expect(compiled).toMatch(/^"use strict";return .+;$/);
    });
  });

  // TODO: Add ChainExpression support for optional chaining (?.)
  // it("should compile nested object access with conditionals", () => {
  //   const ast = parse("<div>{props.user?.profile?.name || 'Anonymous'}</div>");
  //   const result = compile(ast);
  //   expect(result).toBe('"use strict";return h("div", null, ((props.user?.profile?.name) || "Anonymous"));');
  // });
});
