import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import {
  Paragraph,
  AbstractDoc,
  Section,
  Table,
  TableRow,
  TableCell,
  TextRun,
} from "../../../abstract-document-jsx/index.js";
import { LayoutFoundation, TableCellStyle, TableStyle } from "../../../abstract-document/index.js";

const borders = { left: 1, bottom: 1, right: 1, top: 1 };
const tablestyle = TableStyle.create({
  cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
});
const tablestylemargin = TableStyle.create({
  cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
  margins: LayoutFoundation.create({ bottom: 805 }),
});

export const testPageBreakTableSingleRow: ExportTestDef = {
  name: "Pagebreak table single row",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[150]} style={tablestylemargin}>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Table down below" />
              </Paragraph>
            </TableCell>
          </TableRow>
        </Table>
        <Table columnWidths={[150, 100]} style={tablestyle}>
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text="Hello 1" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 2" />
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
            oc: "#000000",
            x: 0,
            y: 0.71,
            w: 1.5,
            l: 9.375,
          },
          {
            oc: "#000000",
            x: -0.019,
            y: 0.013,
            w: 1.5,
            l: 9.412,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 9.363,
            y: 0,
            w: 1.5,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 0.013,
            y: 0,
            w: 1.5,
            l: 0.741,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 80.59,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Table%20down%20below",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
      {
        Height: 52.625,
        Width: 37.188,
        HLines: [
          {
            oc: "#000000",
            x: 0,
            y: 3.21,
            w: 1.5,
            l: 9.375,
          },
          {
            oc: "#000000",
            x: -0.019,
            y: 0.013,
            w: 1.5,
            l: 9.412,
          },
          {
            oc: "#000000",
            x: 9.375,
            y: 3.21,
            w: 1.5,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 9.344,
            y: 0.013,
            w: 1.5,
            l: 6.3,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 9.375,
            y: 0,
            w: 1.5,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 0.013,
            y: 0,
            w: 1.5,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 15.613,
            y: 0,
            w: 1.5,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 9.375,
            y: 0,
            w: 1.5,
            l: 3.241,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: 0.9490000000000001,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 9.125,
            y: 0.9490000000000001,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%202",
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
