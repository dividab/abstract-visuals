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
import { TableCellStyle, TableStyle } from "../../../abstract-document/index.js";

const borders = { left: 1, bottom: 1, right: 1, top: 1 };
const tablestyle = TableStyle.create({
  cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
});

export const testSimpleTableMinimalRowHeight: ExportTestDef = {
  name: "Simple table minimal row height",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[150, 100, 50, 50]} style={tablestyle}>
          <TableRow>
            <TableCell columnSpan={2}>
              <Paragraph>
                <TextRun text="Hello 1" />
              </Paragraph>
            </TableCell>
            <TableCell rowSpan={4}>
              <Paragraph>
                <TextRun text="Hello 2 Hello 2 Hello 2 Hello 2 Hello 2" />
              </Paragraph>
            </TableCell>
            <TableCell rowSpan={3}>
              <Paragraph>
                <TextRun text="Hello 3 Hello 3 Hello 3 Hello 3" />
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
                <TextRun text="Hello 5 Hello 5 Hello 5 Hello 5 Hello 5 Hello 5 Hello 5 Hello 5 Hello 5 Hello 5 Hello 5 " />
              </Paragraph>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 6" />
              </Paragraph>
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 8" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 9" />
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
        Width: 37.188,
        Height: 52.625,
        HLines: [
          {
            x: 0,
            y: 0.963,
            w: 1.5,
            l: 15.625,
            oc: "#000000",
          },
          {
            x: -0.019,
            y: 0.013,
            w: 1.5,
            l: 15.663,
            oc: "#000000",
          },
          {
            x: 15.625,
            y: 4.576,
            w: 1.5,
            l: 3.125,
            oc: "#000000",
          },
          {
            x: 15.594,
            y: 0.013,
            w: 1.5,
            l: 3.175,
            oc: "#000000",
          },
          {
            x: 18.75,
            y: 3.532,
            w: 1.5,
            l: 3.125,
            oc: "#000000",
          },
          {
            x: 18.719,
            y: 0.013,
            w: 1.5,
            l: 3.175,
            oc: "#000000",
          },
          {
            x: 0,
            y: 2.248,
            w: 1.5,
            l: 9.375,
            oc: "#000000",
          },
          {
            x: -0.019,
            y: 0.963,
            w: 1.5,
            l: 9.412,
            oc: "#000000",
          },
          {
            x: 9.375,
            y: 4.576,
            w: 1.5,
            l: 6.25,
            oc: "#000000",
          },
          {
            x: 9.344,
            y: 0.963,
            w: 1.5,
            l: 6.3,
            oc: "#000000",
          },
          {
            x: 0,
            y: 3.532,
            w: 1.5,
            l: 9.375,
            oc: "#000000",
          },
          {
            x: -0.019,
            y: 2.248,
            w: 1.5,
            l: 9.412,
            oc: "#000000",
          },
          {
            x: 0,
            y: 4.563,
            w: 1.5,
            l: 9.375,
            oc: "#000000",
          },
          {
            x: -0.019,
            y: 3.532,
            w: 1.5,
            l: 9.412,
            oc: "#000000",
          },
          {
            x: 18.75,
            y: 4.563,
            w: 1.5,
            l: 3.125,
            oc: "#000000",
          },
          {
            x: 18.719,
            y: 3.532,
            w: 1.5,
            l: 3.175,
            oc: "#000000",
          },
        ],
        VLines: [
          {
            x: 15.625,
            y: 0,
            w: 1.5,
            l: 0.982,
            oc: "#000000",
          },
          {
            x: 0.013,
            y: 0,
            w: 1.5,
            l: 0.982,
            oc: "#000000",
          },
          {
            x: 18.75,
            y: 0,
            w: 1.5,
            l: 4.595,
            oc: "#000000",
          },
          {
            x: 15.625,
            y: 0,
            w: 1.5,
            l: 4.595,
            oc: "#000000",
          },
          {
            x: 21.863,
            y: 0,
            w: 1.5,
            l: 3.551,
            oc: "#000000",
          },
          {
            x: 18.75,
            y: 0,
            w: 1.5,
            l: 3.551,
            oc: "#000000",
          },
          {
            x: 9.375,
            y: 0.963,
            w: 1.5,
            l: 1.303,
            oc: "#000000",
          },
          {
            x: 0.013,
            y: 0.963,
            w: 1.5,
            l: 1.303,
            oc: "#000000",
          },
          {
            x: 15.625,
            y: 0.963,
            w: 1.5,
            l: 3.631,
            oc: "#000000",
          },
          {
            x: 9.375,
            y: 0.963,
            w: 1.5,
            l: 3.631,
            oc: "#000000",
          },
          {
            x: 9.375,
            y: 2.248,
            w: 1.5,
            l: 1.303,
            oc: "#000000",
          },
          {
            x: 0.013,
            y: 2.248,
            w: 1.5,
            l: 1.303,
            oc: "#000000",
          },
          {
            x: 9.375,
            y: 3.532,
            w: 1.5,
            l: 1.062,
            oc: "#000000",
          },
          {
            x: 0.013,
            y: 3.532,
            w: 1.5,
            l: 1.062,
            oc: "#000000",
          },
          {
            x: 21.863,
            y: 3.532,
            w: 1.5,
            l: 1.062,
            oc: "#000000",
          },
          {
            x: 18.75,
            y: 3.532,
            w: 1.5,
            l: 1.062,
            oc: "#000000",
          },
        ],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.18100000000000005,
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
            y: 0.18000000000000005,
            w: 33.9,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%202%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 15.375,
            y: 0.903,
            w: 33.9,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%202%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 15.375,
            y: 1.625,
            w: 33.9,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%202%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 15.375,
            y: 2.348,
            w: 33.9,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%202%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 15.375,
            y: 3.07,
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
            y: 0.020000000000000018,
            w: 33.9,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%203%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 18.5,
            y: 0.742,
            w: 33.9,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%203%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 18.5,
            y: 1.4649999999999999,
            w: 33.9,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%203%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 18.5,
            y: 2.187,
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
            y: 0.9430000000000001,
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
            y: 0.6619999999999999,
            w: 93.36,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%205%20Hello%205%20Hello%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 9.125,
            y: 1.3849999999999998,
            w: 76.14,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "5%20Hello%205%20Hello%205%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 9.125,
            y: 2.107,
            w: 93.36,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%205%20Hello%205%20Hello%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 9.125,
            y: 2.83,
            w: 76.14,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "5%20Hello%205%20Hello%205%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 9.125,
            y: 3.5519999999999996,
            w: 33.9,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%205%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 2.228,
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
            x: -0.25,
            y: 3.3920000000000003,
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
          {
            x: 18.5,
            y: 3.3920000000000003,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello%209",
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
