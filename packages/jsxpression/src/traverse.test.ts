import { describe, it, expect } from "vitest";
import { traverse } from "./traverse.js";
import { parse } from "./parse/index.js";

describe("traverse", () => {
  it("should call JSXElement visitor", () => {
    const ast = parse("<Text>Hello</Text>");
    const visits: string[] = [];

    traverse(ast, {
      JSXElement() {
        visits.push("JSXElement");
      },
    });

    expect(visits).toContain("JSXElement");
  });

  it("should call JSXFragment visitor", () => {
    const ast = parse("<>Fragment</>");
    const visits: string[] = [];

    traverse(ast, {
      JSXFragment() {
        visits.push("JSXFragment");
      },
    });

    expect(visits).toContain("JSXFragment");
  });

  it("should call Identifier visitor for expressions", () => {
    const ast = parse("<Text>{props.value}</Text>");
    const identifiers: string[] = [];

    traverse(ast, {
      Identifier(node) {
        identifiers.push(node.name);
      },
    });

    expect(identifiers).toContain("props");
  });

  it("should call JSXAttribute visitor", () => {
    const ast = parse("<Text x={10} y={20}>Hello</Text>");
    let attributeCount = 0;

    traverse(ast, {
      JSXAttribute() {
        attributeCount++;
      },
    });

    expect(attributeCount).toBe(2);
  });

  it("should call JSXExpressionContainer visitor", () => {
    const ast = parse("<Text>{props.value}</Text>");
    const visits: string[] = [];

    traverse(ast, {
      JSXExpressionContainer() {
        visits.push("JSXExpressionContainer");
      },
    });

    expect(visits).toContain("JSXExpressionContainer");
  });

  it("should traverse nested JSX elements", () => {
    const ast = parse("<Outer><Inner>Text</Inner></Outer>");
    let jsxCount = 0;

    traverse(ast, {
      JSXElement() {
        jsxCount++;
      },
    });

    expect(jsxCount).toBe(2);
  });

  it("should handle multiple visitor types simultaneously", () => {
    const ast = parse("<Text x={props.value}>Hello</Text>");
    const visits: string[] = [];

    traverse(ast, {
      JSXElement() {
        visits.push("JSXElement");
      },
      JSXAttribute() {
        visits.push("JSXAttribute");
      },
      Identifier(node) {
        visits.push("Identifier:" + node.name);
      },
    });

    expect(visits).toContain("JSXElement");
    expect(visits).toContain("JSXAttribute");
    expect(visits).toContain("Identifier:props");
  });
});
