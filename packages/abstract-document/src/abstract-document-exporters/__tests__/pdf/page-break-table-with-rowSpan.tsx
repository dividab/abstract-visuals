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

export const testPageBreakTableWithRowSpan: ExportTestDef = {
  name: "Pagebreak table with rowSpan",
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
        <Table columnWidths={[150, 100, 50, 50]} style={tablestyle}>
          <TableRow>
            <TableCell columnSpan={2}>
              <Paragraph>
                <TextRun text="Hello 1" />
              </Paragraph>
            </TableCell>
            <TableCell rowSpan={2}>
              <Paragraph>
                <TextRun text="Hello 2" />
              </Paragraph>
            </TableCell>
            <TableCell rowSpan={4}>
              <Paragraph>
                <TextRun text="Hello 3" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 4" />
              </Paragraph>
            </TableCell>
            <TableCell rowSpan={3}>
              <Paragraph>
                <TextRun text="Hello 5" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell rowSpan={2}>
              <Paragraph>
                <TextRun text="Hello 6" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 7" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 8" />
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
          {
            oc: "#000000",
            x: 0,
            y: 51.758,
            w: 1.5,
            l: 15.625,
          },
          {
            oc: "#000000",
            x: -0.019,
            y: 51.047,
            w: 1.5,
            l: 15.663,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 52.48,
            w: 1.5,
            l: 3.125,
          },
          {
            oc: "#000000",
            x: 15.594,
            y: 51.047,
            w: 1.5,
            l: 3.175,
          },
          {
            oc: "#000000",
            x: 18.75,
            y: 52.48,
            w: 1.5,
            l: 3.125,
          },
          {
            oc: "#000000",
            x: 18.719,
            y: 51.047,
            w: 1.5,
            l: 3.175,
          },
          {
            oc: "#000000",
            x: 0,
            y: 52.468,
            w: 1.5,
            l: 9.375,
          },
          {
            oc: "#000000",
            x: -0.019,
            y: 51.758,
            w: 1.5,
            l: 9.412,
          },
          {
            oc: "#000000",
            x: 9.375,
            y: 52.468,
            w: 1.5,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 9.344,
            y: 51.758,
            w: 1.5,
            l: 6.3,
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
          {
            oc: "#000000",
            x: 15.625,
            y: 51.035,
            w: 1.5,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 0.013,
            y: 51.035,
            w: 1.5,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 18.75,
            y: 51.035,
            w: 1.5,
            l: 1.464,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 51.035,
            w: 1.5,
            l: 1.464,
          },
          {
            oc: "#000000",
            x: 21.863,
            y: 51.035,
            w: 1.5,
            l: 1.464,
          },
          {
            oc: "#000000",
            x: 18.75,
            y: 51.035,
            w: 1.5,
            l: 1.464,
          },
          {
            oc: "#000000",
            x: 9.375,
            y: 51.758,
            w: 1.5,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 0.013,
            y: 51.758,
            w: 1.5,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 51.758,
            w: 1.5,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 9.375,
            y: 51.758,
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
          {
            x: -0.25,
            y: 50.734,
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
            x: 15.375,
            y: 51.095,
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
          {
            x: 18.5,
            y: 51.095,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 51.456,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%204",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 9.125,
            y: 51.456,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%205",
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
        Width: 37.188,
        Height: 52.625,
        HLines: [
          {
            oc: "#000000",
            x: 0,
            y: 1.445,
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
            y: 1.445,
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
          {
            oc: "#000000",
            x: 15.625,
            y: 0.723,
            w: 1.5,
            l: 3.125,
          },
          {
            oc: "#000000",
            x: 15.594,
            y: 0.013,
            w: 1.5,
            l: 3.175,
          },
          {
            oc: "#000000",
            x: 18.75,
            y: 1.445,
            w: 1.5,
            l: 3.125,
          },
          {
            oc: "#000000",
            x: 18.719,
            y: 0.013,
            w: 1.5,
            l: 3.175,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 1.433,
            w: 1.5,
            l: 3.125,
          },
          {
            oc: "#000000",
            x: 15.594,
            y: 0.723,
            w: 1.5,
            l: 3.175,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 9.375,
            y: 0,
            w: 1.5,
            l: 1.464,
          },
          {
            oc: "#000000",
            x: 0.013,
            y: 0,
            w: 1.5,
            l: 1.464,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 0,
            w: 1.5,
            l: 1.464,
          },
          {
            oc: "#000000",
            x: 9.375,
            y: 0,
            w: 1.5,
            l: 1.464,
          },
          {
            oc: "#000000",
            x: 18.75,
            y: 0,
            w: 1.5,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 0,
            w: 1.5,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 21.863,
            y: 0,
            w: 1.5,
            l: 1.464,
          },
          {
            oc: "#000000",
            x: 18.75,
            y: 0,
            w: 1.5,
            l: 1.464,
          },
          {
            oc: "#000000",
            x: 18.75,
            y: 0.723,
            w: 1.5,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 0.723,
            w: 1.5,
            l: 0.741,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: 0.06000000000000005,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%206",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 15.375,
            y: -0.301,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%207",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 15.375,
            y: 0.42100000000000004,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%208",
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
