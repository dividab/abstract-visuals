import { describe, test, expect } from "vitest";
import { abstractDocXml } from "../abstract-doc-of-xml/abstract-doc-of-xml.js";

describe("creator.ts propsCreators", () => {
  test("columnWidths: parses a comma list, treats 0/NaN as Infinity, and applies columnMultiplier", () => {
    const [doc] = abstractDocXml(
      '<AbstractDoc><Section><Table columnWidths="10,0,abc" columnMultiplier="2"><TableRow /></Table></Section></AbstractDoc>',
      {},
      {}
    );
    const table = (doc as unknown as { children: Array<{ children: Array<{ columnWidths: unknown }> }> }).children[0]?.children[0];
    expect(table?.columnWidths).toEqual([20, Infinity, Infinity]);
  });

  test("borders: a 4-value list maps to top/right/bottom/left in order", () => {
    const [doc] = abstractDocXml('<AbstractDoc><Section><Table><style borders="1 2 3 4"/><TableRow /></Table></Section></AbstractDoc>', {}, {});
    const table = (doc as unknown as { children: Array<{ children: Array<{ style: { borders: unknown } }> }> }).children[0]?.children[0];
    expect(table?.style.borders).toEqual({ top: 1, right: 2, bottom: 3, left: 4 });
  });

  test("padding: a 4-value list maps to top/right/bottom/left in order", () => {
    const [doc] = abstractDocXml('<AbstractDoc><Section><Table><style padding="5 6 7 8"/><TableRow /></Table></Section></AbstractDoc>', {}, {});
    const table = (doc as unknown as { children: Array<{ children: Array<{ style: { padding: unknown } }> }> }).children[0]?.children[0];
    expect(table?.style.padding).toEqual({ top: 5, right: 6, bottom: 7, left: 8 });
  });

  test("margins: a 4-value list maps to top/right/bottom/left in order", () => {
    const [doc] = abstractDocXml('<AbstractDoc><Section><Table><style margins="9 10 11 12"/><TableRow /></Table></Section></AbstractDoc>', {}, {});
    const table = (doc as unknown as { children: Array<{ children: Array<{ style: { margins: unknown } }> }> }).children[0]?.children[0];
    expect(table?.style.margins).toEqual({ top: 9, right: 10, bottom: 11, left: 12 });
  });

  test("strToBool: accepts both '1' and 'true' (xs:boolean's lexical space), defaults to false", () => {
    const [doc] = abstractDocXml(
      `<AbstractDoc><StyleNames>
        <StyleName name="one" type="TextStyle" bold="1"/>
        <StyleName name="word" type="TextStyle" bold="true"/>
        <StyleName name="none" type="TextStyle"/>
      </StyleNames></AbstractDoc>`,
      {},
      {}
    );
    const styleMap = (doc as unknown as { styles: Record<string, { bold?: boolean }> }).styles;
    expect(styleMap["TextStyle_one"]?.bold).toBe(true);
    expect(styleMap["TextStyle_word"]?.bold).toBe(true);
    expect(styleMap["TextStyle_none"]?.bold).toBeUndefined();
  });

  test("strToNum: falls back to 0 for non-numeric text and for Infinity/-Infinity, not just NaN", () => {
    const [doc] = abstractDocXml(
      `<AbstractDoc><StyleNames>
        <StyleName name="garbage" type="TextStyle" fontSize="abc"/>
        <StyleName name="infinite" type="TextStyle" fontSize="Infinity"/>
        <StyleName name="normal" type="TextStyle" fontSize="12"/>
      </StyleNames></AbstractDoc>`,
      {},
      {}
    );
    const styleMap = (doc as unknown as { styles: Record<string, { fontSize?: number }> }).styles;
    expect(styleMap["TextStyle_garbage"]?.fontSize).toBe(0);
    expect(styleMap["TextStyle_infinite"]?.fontSize).toBe(0);
    expect(styleMap["TextStyle_normal"]?.fontSize).toBe(12);
  });
});
