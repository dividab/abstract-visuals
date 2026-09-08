import { describe, it, expect } from "vitest";
import { ParseError } from "./parse-error.js";
import { parse } from "./parse.js";

function getThrownError(fn: () => unknown): unknown {
  try {
    fn();
  } catch (error) {
    return error;
  }
  throw new Error("Expected function to throw");
}

describe("parse", () => {
  it("should parse valid JSX element", () => {
    const result = parse("<Text x={10}>Hello</Text>");

    expect(result.type).toBe("Program");
    expect(result.body).toHaveLength(1);
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse JSX fragment", () => {
    const result = parse("<><Text>A</Text><Text>B</Text></>");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should throw ParseError with position for syntax error", () => {
    expect(() => parse("<Text>Unclosed")).toThrow(ParseError);
  });

  it("should parse nested JSX", () => {
    const result = parse("<Outer><Inner><Deep>Text</Deep></Inner></Outer>");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse JSX with expressions", () => {
    const result = parse("<Text>{props.value}</Text>");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse JSX with complex expressions", () => {
    const result = parse("<Text>{items.map(x => x * 2).join(', ')}</Text>");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse JSX with attributes", () => {
    const result = parse('<Text x={10} y="hello" z={value}>Content</Text>');

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse self-closing JSX elements", () => {
    const result = parse("<Input value={name} />");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse JSX with conditional expressions", () => {
    const result = parse("<Text>{show ? 'visible' : 'hidden'}</Text>");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse empty JSX expressions", () => {
    const result = parse("<Text>{}</Text>");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should preserve location information in errors", () => {
    const error = getThrownError(() => parse("<Text>Unclosed"));

    expect(error).toBeInstanceOf(ParseError);
    expect((error as ParseError).loc).toBeDefined();
    expect((error as ParseError).loc?.line).toBe(1);
    expect((error as ParseError).loc?.column).toBe(6);
  });

  it("should handle invalid JSX syntax", () => {
    expect(() => parse("<>")).toThrow(ParseError);
    expect(() => parse("<Text><")).toThrow(ParseError);
    expect(() => parse("<Text attr>")).toThrow(ParseError);
  });
});
