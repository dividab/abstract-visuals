import type { ExportTestDef } from "./_export-test-def.js";

export const testSimpleDocument: ExportTestDef = {
  name: "Simple document",
  images: {},
  fonts: {},
  abstractDocXML: `<AbstractDoc>
  <StyleNames>
      <StyleName name="footerResultText" type="TextStyle" fontSize="8" color="#353535" bold="true"/>
      <StyleName name="footerResultCell" type="TableCellStyle" padding="4 4 3 0" borders="1 0 0 0" borderColor="#123151" verticalAlignment="Bottom"/>
  </StyleNames>
  <Section>
      <Table columnWidths="375,70,60">
          <style margins="150 0 0 0"/>
          <TableRow>
              <TableCell styleName="footerResultCell"/>
              <TextCell text="Cost €" styleNames="footerResultText, footerResultCell"/>
              <TextCell text="Price €" styleNames="footerResultText, footerResultCell"/>
          </TableRow>
      </Table>
  </Section>
</AbstractDoc>`,
  expectedPdfJson: {
    children: [
      {
        page: {
          style: {
            headerMargins: {},
            footerMargins: {},
            contentMargins: {},
            orientation: "Portrait",
            paperSize: "A4",
            noTopBottomMargin: false,
            columnLayout: { columnCount: 1, columnGap: 0 },
          },
          header: [],
          footer: [],
        },
        id: "",
        children: [
          {
            type: "Table",
            columnWidths: [375, 70, 60],
            styleName: "",
            style: {
              margins: { top: 150, right: 0, bottom: 0, left: 0 },
              type: "TableStyle",
            },
            headerRows: [],
            children: [
              {
                children: [
                  {
                    styleName: "footerResultCell",
                    columnSpan: 1,
                    rowSpan: 1,
                    style: { type: "TableCellStyle" },
                    dummy: false,
                    children: [],
                  },
                  {
                    styleName: "footerResultCell",
                    columnSpan: 1,
                    rowSpan: 1,
                    style: { type: "TableCellStyle" },
                    dummy: false,
                    children: [
                      {
                        type: "Paragraph",
                        styleName: "",
                        style: {
                          type: "ParagraphStyle",
                          margins: {},
                          position: "relative",
                          textStyle: { type: "TextStyle" },
                        },
                        children: [
                          {
                            type: "TextRun",
                            styleName: "footerResultText",
                            text: "Cost €",
                            style: { type: "TextStyle" },
                          },
                        ],
                      },
                    ],
                  },
                  {
                    styleName: "footerResultCell",
                    columnSpan: 1,
                    rowSpan: 1,
                    style: { type: "TableCellStyle" },
                    dummy: false,
                    children: [
                      {
                        type: "Paragraph",
                        styleName: "",
                        style: {
                          type: "ParagraphStyle",
                          margins: {},
                          position: "relative",
                          textStyle: { type: "TextStyle" },
                        },
                        children: [
                          {
                            type: "TextRun",
                            styleName: "footerResultText",
                            text: "Price €",
                            style: { type: "TextStyle" },
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
    styles: {
      TextStyle_footerResultText: {
        name: "footerResultText",
        type: "TextStyle",
        fontSize: 8,
        color: "#353535",
        bold: true,
      },
      TableCellStyle_footerResultCell: {
        name: "footerResultCell",
        type: "TableCellStyle",
        padding: { top: 4, right: 4, bottom: 3, left: 0 },
        borders: { top: 1, right: 0, bottom: 0, left: 0 },
        borderColor: "#123151",
        verticalAlignment: "Bottom",
      },
      ParagraphStyle_H1: {
        type: "ParagraphStyle",
        margins: { top: 8, bottom: 2 },
        position: "relative",
        textStyle: { type: "TextStyle", bold: true, fontSize: 32 },
      },
      ParagraphStyle_H2: {
        type: "ParagraphStyle",
        margins: { top: 6, bottom: 1.5 },
        position: "relative",
        textStyle: { type: "TextStyle", bold: true, fontSize: 24 },
      },
      ParagraphStyle_H3: {
        type: "ParagraphStyle",
        margins: { top: 4.5, bottom: 1.125 },
        position: "relative",
        textStyle: { type: "TextStyle", bold: true, fontSize: 18 },
      },
      ParagraphStyle_H4: {
        type: "ParagraphStyle",
        margins: { top: 3.75, bottom: 0.9375 },
        position: "relative",
        textStyle: { type: "TextStyle", bold: true, fontSize: 15 },
      },
      ParagraphStyle_H5: {
        type: "ParagraphStyle",
        margins: { top: 3.25, bottom: 0.8125 },
        position: "relative",
        textStyle: { type: "TextStyle", bold: true, fontSize: 13 },
      },
      ParagraphStyle_H6: {
        type: "ParagraphStyle",
        margins: { top: 2.5, bottom: 0.625 },
        position: "relative",
        textStyle: { type: "TextStyle", bold: true, fontSize: 10 },
      },
      TextStyle_Emphasis: { type: "TextStyle", italic: true },
      TextStyle_Strong: { type: "TextStyle", bold: true },
      TextStyle_Subscript: { type: "TextStyle", subScript: true, fontSize: 6 },
      TextStyle_Superscript: { type: "TextStyle", superScript: true, fontSize: 6 },
    },
  },
};
