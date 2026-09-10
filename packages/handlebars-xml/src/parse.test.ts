import { describe, expect, it } from "vitest";
import { parseXml } from "./parse.js";

describe("parseXml", () => {
  describe("tagName", () => {
    it("reads the element's tag name", () => {
      const element = parseXml("<Foo />")[0];
      expect(element.tagName).toBe("Foo");
    });

    it("parses multiple root-level elements", () => {
      const elements = parseXml("<a /><b />");
      expect(elements.map((e) => e.tagName)).toEqual(["a", "b"]);
    });
  });

  describe("attributes", () => {
    it("keeps a quoted attribute value as a string", () => {
      const element = parseXml('<Foo bar="baz" />')[0];
      expect(element.attributes.bar).toBe("baz");
    });

    it("keeps an empty attribute value as an empty string, not null/undefined", () => {
      const element = parseXml('<Foo bar="" />')[0];
      expect(element.attributes.bar).toBe("");
    });

    it("decodes entity references but keeps the result a string", () => {
      const element = parseXml('<Foo bar="&amp;&#65;" />')[0];
      expect(element.attributes.bar).toBe("&A");
    });

    it("drops a bare (valueless) attribute instead of reporting it as boolean true, null, or undefined", () => {
      // allowBooleanAttributes is off so XmlElement.attributes stays honestly Record<string, string>;
      // downstream code (e.g. abstract-document's creator.ts) relies on never seeing a non-string attribute value.
      const element = parseXml("<Foo bar />")[0];
      expect("bar" in element.attributes).toBe(false);
      expect(element.attributes.bar).toBeUndefined();
    });

    it("has no attributes at all when none are given", () => {
      const element = parseXml("<Foo />")[0];
      expect(element.attributes).toEqual({});
    });

    it("never reports a non-string value for an attribute that is present", () => {
      const element = parseXml('<Foo a="1" b="" c="&amp;" d="&#65;" />')[0];
      for (const value of Object.values(element.attributes)) {
        expect(typeof value).toBe("string");
      }
    });
  });

  describe("children", () => {
    it("parses a nested element with its own tag name and attributes", () => {
      const element = parseXml('<a x="1"><b y="2">text</b></a>')[0];
      expect(element.children).toHaveLength(1);
      expect(element.children[0]).toMatchObject({ tagName: "b", attributes: { y: "2" }, textContent: "text" });
    });

    it("is an empty array for a leaf element", () => {
      const element = parseXml("<Foo />")[0];
      expect(element.children).toEqual([]);
    });
  });

  describe("textContent", () => {
    it("reads simple text content", () => {
      const element = parseXml("<a>hello</a>")[0];
      expect(element.textContent).toBe("hello");
    });

    it("joins text nodes interleaved with child elements", () => {
      const element = parseXml("<a>hello<b/>world</a>")[0];
      expect(element.textContent).toBe("hello\nworld");
    });

    it("is an empty string for whitespace-only content", () => {
      const element = parseXml("<a>  \n\t </a>")[0];
      expect(element.textContent).toBe("");
    });

    it("is an empty string when there is no text content", () => {
      const element = parseXml("<a></a>")[0];
      expect(element.textContent).toBe("");
    });
  });
});
