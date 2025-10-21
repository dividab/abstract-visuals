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

  describe("spread elements", () => {
    it("should compile spread in arrays", () => {
      const ast = parse("<div>{[...data.items]}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, [...data.items]);');
    });

    it("should compile spread in objects", () => {
      const ast = parse("<div style={{ ...data.styles }}>Text</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", { style: { ...data.styles } }, "Text");');
    });

    it("should compile mixed spread and regular elements in arrays", () => {
      const ast = parse("<div>{[1, ...data.items, 2]}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, [1, ...data.items, 2]);');
    });

    it("should compile mixed spread and regular properties in objects", () => {
      const ast = parse("<div style={{ color: 'red', ...data.styles, width: 100 }}>Text</div>");
      const result = compile(ast);
      expect(result).toBe(
        '"use strict";return h("div", { style: { color: "red", ...data.styles, width: 100 } }, "Text");'
      );
    });

    it("should compile multiple spreads in arrays", () => {
      const ast = parse("<div>{[...data.first, ...data.second]}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, [...data.first, ...data.second]);');
    });

    it("should compile multiple spreads in objects", () => {
      const ast = parse("<div style={{ ...data.base, ...data.override }}>Text</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", { style: { ...data.base, ...data.override } }, "Text");');
    });

    it("should compile spread in function call arguments", () => {
      const ast = parse("<div>{Math.max(...data.numbers)}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, Math.max(...data.numbers));');
    });

    it("should compile spread with map in function call", () => {
      const ast = parse("<div>{Math.min(...data.items.map(x => x.price))}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, Math.min(...data.items.map((x) => x.price)));');
    });

    it("should compile mixed spread and regular arguments", () => {
      const ast = parse("<div>{Math.max(0, ...data.numbers, 100)}</div>");
      const result = compile(ast);
      expect(result).toBe('"use strict";return h("div", null, Math.max(0, ...data.numbers, 100));');
    });
  });

  // TODO: Add ChainExpression support for optional chaining (?.)
  // it("should compile nested object access with conditionals", () => {
  //   const ast = parse("<div>{props.user?.profile?.name || 'Anonymous'}</div>");
  //   const result = compile(ast);
  //   expect(result).toBe('"use strict";return h("div", null, ((props.user?.profile?.name) || "Anonymous"));');
  // });
});
