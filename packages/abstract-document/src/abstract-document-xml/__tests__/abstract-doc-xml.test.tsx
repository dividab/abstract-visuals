import { describe, test, expect } from "vitest";
import { HyperLink } from "../../abstract-document/index.js";
import { abstractDocXml } from "../abstract-doc-of-xml/abstract-doc-of-xml.js";
import { testSimpleDocument } from "./simple-document.js";

describe("abstract-doc-xml", () => {
  test("empty input produces an empty document", () => {
    expect(abstractDocXml("", {}, {})).toEqual([{ children: [] }, {}, {}]);
  });

  test("HyperLink becomes an atom with its text, target, and default style", () => {
    const [doc] = abstractDocXml(
      '<AbstractDoc><Section><Paragraph><HyperLink text="Visit us" target="https://example.com"/></Paragraph></Section></AbstractDoc>',
      {},
      {}
    );

    expect(doc.children[0]?.children[0]).toMatchObject({
      type: "Paragraph",
      children: [HyperLink.create({ text: "Visit us", target: "https://example.com" })],
    });
  });

  test("HyperLinkParagraph creates a styled paragraph and hyperlink", () => {
    const [doc] = abstractDocXml(
      `<AbstractDoc><StyleNames>
        <StyleName name="paragraph" type="ParagraphStyle"/>
        <StyleName name="link" type="TextStyle"/>
      </StyleNames><Section>
        <HyperLinkParagraph text="Visit us" target="https://example.com" styleNames="paragraph,link">
          <textStyle underline="true"/>
        </HyperLinkParagraph>
      </Section></AbstractDoc>`,
      {},
      {}
    );

    expect(doc.children[0]?.children[0]).toMatchObject({
      type: "Paragraph",
      styleName: "paragraph",
      children: [
        { type: "HyperLink", styleName: "link", text: "Visit us", target: "https://example.com", style: { type: "TextStyle", underline: true } },
      ],
    });
  });

  test("HyperLinkCell creates a table cell containing a styled hyperlink paragraph", () => {
    const [doc] = abstractDocXml(
      `<AbstractDoc><StyleNames>
        <StyleName name="cell" type="TableCellStyle"/>
        <StyleName name="paragraph" type="ParagraphStyle"/>
        <StyleName name="link" type="TextStyle"/>
      </StyleNames><Section><Table columnWidths="100"><TableRow>
        <HyperLinkCell text="Visit us" target="https://example.com" styleNames="cell,paragraph,link" columnSpan="2">
          <paragraphStyle keepTogether="true"/>
        </HyperLinkCell>
      </TableRow></Table></Section></AbstractDoc>`,
      {},
      {}
    );

    expect(doc.children[0]?.children[0]).toMatchObject({
      type: "Table",
      children: [
        {
          children: [
            {
              styleName: "cell",
              columnSpan: 2,
              children: [
                {
                  type: "Paragraph",
                  styleName: "paragraph",
                  style: { type: "ParagraphStyle", keepTogether: true },
                  children: [HyperLink.create({ text: "Visit us", target: "https://example.com", styleName: "link" })],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test("HyperLinkRow creates a row with a styled hyperlink cell", () => {
    const [doc] = abstractDocXml(
      `<AbstractDoc><StyleNames>
        <StyleName name="cell" type="TableCellStyle"/>
        <StyleName name="paragraph" type="ParagraphStyle"/>
        <StyleName name="link" type="TextStyle"/>
      </StyleNames><Section><Table columnWidths="100">
        <HyperLinkRow text="Visit us" target="https://example.com" styleNames="cell,paragraph,link">
          <cellStyle background="#eeeeee"/>
          <textStyle underline="true"/>
        </HyperLinkRow>
      </Table></Section></AbstractDoc>`,
      {},
      {}
    );

    expect(doc.children[0]?.children[0]).toMatchObject({
      type: "Table",
      children: [
        {
          children: [
            {
              styleName: "cell",
              style: { background: "#eeeeee" },
              children: [
                {
                  type: "Paragraph",
                  styleName: "paragraph",
                  children: [{ type: "HyperLink", styleName: "link", text: "Visit us", target: "https://example.com", style: { underline: true } }],
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test("LinkTarget, LineBreak, and both ToC separator spellings create atoms", () => {
    const [doc] = abstractDocXml(
      `<AbstractDoc><Section><Paragraph>
        <LinkTarget name="chapter"/>
        <LineBreak styleName="break"><style bold="true"/></LineBreak>
        <TocSeparator width="7"/>
        <TocSeperator width="9"/>
      </Paragraph></Section></AbstractDoc>`,
      {},
      {}
    );

    expect(doc.children[0]?.children[0]).toMatchObject({
      type: "Paragraph",
      children: [
        { type: "LinkTarget", name: "chapter" },
        { type: "LineBreak", styleName: "break", style: { type: "TextStyle", bold: true } },
        { type: "TocSeparator", width: 7 },
        { type: "TocSeparator", width: 9 },
      ],
    });
  });

  test("LinkTarget requires a name attribute", () => {
    expect(() => abstractDocXml("<AbstractDoc><Section><Paragraph><LinkTarget/></Paragraph></Section></AbstractDoc>", {}, {})).toThrow(
      '<LinkTarget> requires a "name" attribute'
    );
  });

  test.each([
    ["HyperLink", '<Paragraph><HyperLink text="Visit us"/></Paragraph>'],
    ["HyperLinkParagraph", '<HyperLinkParagraph text="Visit us"/>'],
    ["HyperLinkCell", '<Table columnWidths="100"><TableRow><HyperLinkCell text="Visit us"/></TableRow></Table>'],
    ["HyperLinkRow", '<Table columnWidths="100"><HyperLinkRow text="Visit us"/></Table>'],
  ])("%s requires a target attribute", (element, content) => {
    expect(() => abstractDocXml(`<AbstractDoc><Section>${content}</Section></AbstractDoc>`, {}, {})).toThrow(
      `<${element}> requires a "target" attribute`
    );
  });

  [testSimpleDocument].forEach((item) => {
    test(item.name, () => {
      const [doc] = abstractDocXml(item.abstractDocXML, {}, {});
      expect(doc).toEqual(item.expectedPdfJson);
    });
  });
});
