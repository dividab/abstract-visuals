import { describe, test, expect } from "vitest";
import { exportToBytes } from "../../abstract-document-exporters/pdf/render.js";
import { abstractDocXml } from "../abstract-doc-of-xml/abstract-doc-of-xml.js";

describe("creator.ts propsCreators", () => {
  test("Table without a columnWidths attribute exports instead of throwing on undefined.filter", async () => {
    const [doc] = abstractDocXml(
      '<AbstractDoc><Section><Table><TableRow><TableCell><Paragraph><TextRun text="cell"/></Paragraph></TableCell></TableRow></Table></Section></AbstractDoc>',
      {},
      {}
    );
    await expect(exportToBytes(doc)).resolves.toBeInstanceOf(Uint8Array);
  });

  test("TextRun without a text attribute defaults to an empty string instead of throwing on undefined.replaceAll", () => {
    const [doc] = abstractDocXml("<AbstractDoc><Section><Paragraph><TextRun/></Paragraph></Section></AbstractDoc>", {}, {});
    const textRun = (doc as unknown as { children: Array<{ children: Array<{ children: Array<{ text: unknown }> }> }> }).children[0]?.children[0]
      ?.children[0];
    expect(textRun?.text).toBe("");
  });

  test("Markdown without a text attribute defaults to an empty string instead of throwing inside Markdown.create", () => {
    expect(() => abstractDocXml("<AbstractDoc><Section><Markdown/></Section></AbstractDoc>", {}, {})).not.toThrow();
  });

  test("TextField with a missing/invalid fieldType throws a clear error instead of silently mis-measuring", () => {
    expect(() => abstractDocXml("<AbstractDoc><Section><Paragraph><TextField/></Paragraph></Section></AbstractDoc>", {}, {})).toThrow(/fieldType/);
    expect(() =>
      abstractDocXml('<AbstractDoc><Section><Paragraph><TextField fieldType="NotAThing"/></Paragraph></Section></AbstractDoc>', {}, {})
    ).toThrow(/fieldType/);
  });

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
