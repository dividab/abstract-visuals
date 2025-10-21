import { describe, it, expect } from "vitest";
import { parse } from "./parse.js";
import { ParseError } from "./parse-error.js";

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

    try {
      parse("<Text>Unclosed");
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError);
    }
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
    const result = parse("<Text>{data.items.map(x => x * 2).join(', ')}</Text>");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse JSX with attributes", () => {
    const result = parse('<Text x={10} y="hello" z={data.value}>Content</Text>');

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse self-closing JSX elements", () => {
    const result = parse("<Input value={data.name} />");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse JSX with conditional expressions", () => {
    const result = parse("<Text>{data.show ? 'visible' : 'hidden'}</Text>");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should parse empty JSX expressions", () => {
    const result = parse("<Text>{}</Text>");

    expect(result.type).toBe("Program");
    expect(result.body[0].type).toBe("ExpressionStatement");
  });

  it("should preserve location information in errors", () => {
    try {
      parse("<Text>Unclosed");
      throw new Error("Should have thrown ParseError");
    } catch (error) {
      expect(error).toBeInstanceOf(ParseError);
      if (error instanceof ParseError && error.loc) {
        expect(error.loc).toBeDefined();
        expect(error.loc.line).toBe(1);
        expect(error.loc.column).toBe(6);
      }
    }
  });

  it("should handle invalid JSX syntax", () => {
    expect(() => parse("<>")).toThrow(ParseError);
    expect(() => parse("<Text><")).toThrow(ParseError);
    expect(() => parse("<Text attr>")).toThrow(ParseError);
  });
});
