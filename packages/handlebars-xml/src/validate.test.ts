import { describe, expect, it } from "vitest";
import { parseXsd } from "./parse.js";
import { validateXml } from "./validate.js";

const xsd = parseXsd(`<?xml version="1.0" encoding="UTF-8"?>
<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema">
  <xs:element name="Doc">
    <xs:complexType>
      <xs:sequence>
        <xs:element name="Row" type="Row" />
      </xs:sequence>
    </xs:complexType>
  </xs:element>
  <xs:complexType name="Row">
    <xs:attribute name="text" type="xs:string" />
  </xs:complexType>
</xs:schema>`);

const ranges = (xml: string): ReadonlyArray<readonly [string | undefined, number, number, number]> =>
  validateXml(xml, xsd).map((e) => [e.options.hoverMessage[1]?.value, e.range.startLineNumber, e.range.startColumn, e.range.endColumn]);

describe("validateXml", () => {
  it("finds no errors in a valid document", () => {
    expect(ranges('<Doc>\n  <Row text="a" />\n</Doc>')).toEqual([]);
  });

  it("gives the line and columns of an invalid attribute and element", () => {
    const xml = ["<Doc>", '  <Row text="a" />', '  <Row txt="b" />', '    <Row text="c" />', "  <Cell />", "</Doc>"].join("\n");
    expect(ranges(xml)).toEqual([
      ['"txt" is a not a valid attribute on "Row"', 3, 8, 15],
      ['"Cell" is not a valid child of "Doc"', 5, 4, 8],
      ['"Cell" is not a valid element', 5, 4, 8],
    ]);
  });

  it("ignores handlebars when giving positions", () => {
    const xml = ["<Doc>", "  {{#rows}}", '  <Row txt="{{x}}" />', "  {{/rows}}", "</Doc>"].join("\n");
    expect(ranges(xml)).toEqual([['"txt" is a not a valid attribute on "Row"', 3, 8, 19]]);
  });
});
