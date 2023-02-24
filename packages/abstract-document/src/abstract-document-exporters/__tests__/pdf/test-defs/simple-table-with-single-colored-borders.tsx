import React from "react";
import { ExportTestDef } from "../export-test-def";
import {
  Paragraph,
  AbstractDoc,
  Section,
  Table,
  TableRow,
  TableCell,
  TextRun,
} from "../../../../abstract-document-jsx";
import * as TableStyle from "../../../../abstract-document/styles/table-style";
import * as TableCellStyle from "../../../../abstract-document/styles/table-cell-style";
import { LayoutFoundationColor } from "../../../../abstract-document";

const cellstyle = TableCellStyle.create({
  borders: { left: 1, right: 1, top: 1, bottom: 1 },
  borderColor: "red",
  background: "blue",
  padding: { left: 2, right: 2, top: 2, bottom: 2 },
});

export const test: ExportTestDef = {
  name: "Simple table with single colored borders",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[100, 100, 100]}>
          <TableRow>
            <TableCell style={cellstyle}>
              <Paragraph>
                <TextRun text="First cell" />
              </Paragraph>
            </TableCell>
            <TableCell style={cellstyle}>
              <Paragraph>
                <TextRun text="Second cell" />
              </Paragraph>
            </TableCell>
            <TableCell style={cellstyle}>
              <Paragraph>
                <TextRun text="Third cell" />
              </Paragraph>
            </TableCell>
          </TableRow>
        </Table>
      </Section>
    </AbstractDoc>
  ),
  expectedPdfJson: {
    Transcoder: "pdf2json@2.0.1 [https://github.com/modesty/pdf2json]",
    Meta: {
      CreationDate: "*",
      Creator: "PDFKit",
      IsAcroFormPresent: false,
      IsXFAPresent: false,
      Metadata: {},
      PDFFormatVersion: "1.3",
      Producer: "PDFKit",
    },
    Pages: [
      {
        Height: 52.625,
        Width: 37.188,
        HLines: [
          {
            clr: 24,
            x: 0,
            y: 0.96,
            w: 1.5,
            l: 6.25,
          },
          {
            clr: 24,
            x: -0.019,
            y: 0.013,
            w: 1.5,
            l: 6.287,
          },
          {
            clr: 24,
            x: 6.25,
            y: 0.96,
            w: 1.5,
            l: 6.25,
          },
          {
            clr: 24,
            x: 6.219,
            y: 0.013,
            w: 1.5,
            l: 6.3,
          },
          {
            clr: 24,
            x: 12.5,
            y: 0.96,
            w: 1.5,
            l: 6.25,
          },
          {
            clr: 24,
            x: 12.469,
            y: 0.013,
            w: 1.5,
            l: 6.3,
          },
        ],
        VLines: [
          {
            clr: 24,
            x: 6.25,
            y: 0,
            w: 1.5,
            l: 0.991,
          },
          {
            clr: 24,
            x: 0.013,
            y: 0,
            w: 1.5,
            l: 0.991,
          },
          {
            clr: 24,
            x: 12.5,
            y: 0,
            w: 1.5,
            l: 0.991,
          },
          {
            clr: 24,
            x: 6.25,
            y: 0,
            w: 1.5,
            l: 0.991,
          },
          {
            clr: 24,
            x: 18.738,
            y: 0,
            w: 1.5,
            l: 0.991,
          },
          {
            clr: 24,
            x: 12.5,
            y: 0,
            w: 1.5,
            l: 0.991,
          },
        ],
        Fills: [
          {
            x: 0,
            y: 0,
            w: 6.25,
            h: 0.973,
            clr: 35,
          },
          {
            x: 6.25,
            y: 0,
            w: 6.25,
            h: 0.973,
            clr: 35,
          },
          {
            x: 12.5,
            y: 0,
            w: 6.25,
            h: 0.973,
            clr: 35,
          },
        ],
        Texts: [
          {
            x: -0.125,
            y: -0.17600000000000005,
            w: 37.22,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "First%20cell",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 6.125,
            y: -0.17600000000000005,
            w: 51.69,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Second%20cell",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.375,
            y: -0.17600000000000005,
            w: 40.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Third%20cell",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
    ],
  },
};
