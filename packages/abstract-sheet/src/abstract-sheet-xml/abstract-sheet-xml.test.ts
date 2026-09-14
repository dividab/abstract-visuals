import { describe, expect, it } from "vitest";
import { abstractSheetXml } from "./abstract-sheet-xml.js";

describe("abstractSheetXml", () => {
  it("extracts the Sheet name and direction attributes", () => {
    const result = abstractSheetXml('<AbstractSheet><Sheet name="Sheet1" direction="row"><Cells></Cells></Sheet></AbstractSheet>', {}, {});
    expect(result.sheets[0]).toMatchObject({ name: "Sheet1", direction: "row" });
  });

  it("falls back to an empty name/direction when the attributes are absent", () => {
    const result = abstractSheetXml("<AbstractSheet><Sheet><Cells></Cells></Sheet></AbstractSheet>", {}, {});
    expect(result.sheets[0]).toMatchObject({ name: "", direction: "" });
  });

  it("recurses into a Sheet's children (ColInfos/RowInfos/Cells) without needing a null-check", () => {
    const result = abstractSheetXml(
      '<AbstractSheet><Sheet name="Sheet1"><ColInfos><ColInfo widthPixels="100" /></ColInfos><RowInfos><RowInfo heightPixels="20" /></RowInfos><Cells><Cell text="hello" /></Cells></Sheet></AbstractSheet>',
      {},
      {}
    );
    const [sheet] = result.sheets;
    expect(sheet.colInfo).toEqual([{ widthPixels: 100 }]);
    expect(sheet.rowInfo).toEqual([{ heightPixels: 20 }]);
    expect(sheet.cells).toEqual([[{ text: "hello", type: "string", value: "hello", styles: undefined }]]);
  });

  it('coerces ColInfo/RowInfo hidden to a real boolean, not the truthy string "false"', () => {
    const result = abstractSheetXml(
      '<AbstractSheet><Sheet name="Sheet1"><ColInfos><ColInfo hidden="false" /></ColInfos><RowInfos><RowInfo hidden="true" /></RowInfos><Cells></Cells></Sheet></AbstractSheet>',
      {},
      {}
    );
    const [sheet] = result.sheets;
    expect(sheet.colInfo).toEqual([{ hidden: false }]);
    expect(sheet.rowInfo).toEqual([{ hidden: true }]);
  });

  it('parses a Cell\'s "bool" attribute (matching the XSD) as a boolean-typed cell', () => {
    const result = abstractSheetXml('<AbstractSheet><Sheet name="Sheet1"><Cells><Cell bool="true" /></Cells></Sheet></AbstractSheet>', {}, {});
    expect(result.sheets[0]?.cells).toEqual([[{ bool: "true", type: "boolean", value: "true", styles: undefined }]]);
  });

  it("handles a Sheet with no children at all", () => {
    const result = abstractSheetXml('<AbstractSheet><Sheet name="Empty" /></AbstractSheet>', {}, {});
    expect(result.sheets[0]).toMatchObject({ name: "Empty", cells: [], colInfo: undefined, rowInfo: undefined });
  });

  it("handles multiple sheets, each recursing through its own children", () => {
    const result = abstractSheetXml(
      '<AbstractSheet><Sheet name="A"><Cells></Cells></Sheet><Sheet name="B"><Cells></Cells></Sheet></AbstractSheet>',
      {},
      {}
    );
    expect(result.sheets.map((s) => s.name)).toEqual(["A", "B"]);
  });
});
