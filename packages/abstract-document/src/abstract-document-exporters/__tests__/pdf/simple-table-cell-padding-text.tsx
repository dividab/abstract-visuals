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
import * as TableStyle from "../../../abstract-document/styles/table-style.js";
import * as TextStyle from "../../../abstract-document/styles/text-style.js";
import * as TableCellStyle from "../../../abstract-document/styles/table-cell-style.js";

const borders = { left: 2, bottom: 2, right: 2, top: 2 };

export const testSimpleTableCellPaddingText: ExportTestDef = {
  name: "Simple table cell padding of text",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table
          columnWidths={[125, 95, 125]}
          style={TableStyle.create({
            alignment: "Center",
            cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
          })}
        >
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: { left: 21, bottom: 0, right: 0, top: 0 } })}>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "left" })} text="LeftPadding" />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ padding: { left: 0, bottom: 21, right: 0, top: 21 } })}>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "center" })} text="TopBottomPadding" />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ padding: { left: 0, bottom: 0, right: 21, top: 0 } })}>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "right" })} text="RightPadding" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "left" })} text="NoPadding" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "center" })} text="NoPadding" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "right" })} text="NoPadding" />
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
            x: 7.813,
            y: 3.348,
            w: 3,
            l: 7.813,
          },
          {
            oc: "#000000",
            x: 7.794,
            y: 0.044,
            w: 3,
            l: 7.85,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 3.348,
            w: 3,
            l: 5.938,
          },
          {
            oc: "#000000",
            x: 15.563,
            y: 0.044,
            w: 3,
            l: 6.019,
          },
          {
            oc: "#000000",
            x: 21.563,
            y: 3.348,
            w: 3,
            l: 7.813,
          },
          {
            oc: "#000000",
            x: 21.5,
            y: 0.044,
            w: 3,
            l: 7.894,
          },
          {
            oc: "#000000",
            x: 7.813,
            y: 4.026,
            w: 3,
            l: 7.813,
          },
          {
            oc: "#000000",
            x: 7.794,
            y: 3.348,
            w: 3,
            l: 7.85,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 4.026,
            w: 3,
            l: 5.938,
          },
          {
            oc: "#000000",
            x: 15.563,
            y: 3.348,
            w: 3,
            l: 6.019,
          },
          {
            oc: "#000000",
            x: 21.563,
            y: 4.026,
            w: 3,
            l: 7.813,
          },
          {
            oc: "#000000",
            x: 21.5,
            y: 3.348,
            w: 3,
            l: 7.894,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 15.625,
            y: 0,
            w: 3,
            l: 3.366,
          },
          {
            oc: "#000000",
            x: 7.856,
            y: 0,
            w: 3,
            l: 3.366,
          },
          {
            oc: "#000000",
            x: 21.563,
            y: 0,
            w: 3,
            l: 3.366,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 0,
            w: 3,
            l: 3.366,
          },
          {
            oc: "#000000",
            x: 29.331,
            y: 0,
            w: 3,
            l: 3.366,
          },
          {
            oc: "#000000",
            x: 21.563,
            y: 0,
            w: 3,
            l: 3.366,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 3.348,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 7.856,
            y: 3.348,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 21.563,
            y: 3.348,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 15.625,
            y: 3.348,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 29.331,
            y: 3.348,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 21.563,
            y: 3.348,
            w: 3,
            l: 0.741,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: 8.875,
            y: 1.011,
            w: 53.37,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "LeftPadding",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 15.719,
            y: 1.011,
            w: 85.6,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "TopBottomPadding",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 24.086,
            y: 1.011,
            w: 60.03,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "RightPadding",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 7.563,
            y: 3.046,
            w: 49.47,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "NoPadding",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 16.81,
            y: 3.046,
            w: 49.47,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "NoPadding",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 26.058,
            y: 3.046,
            w: 49.47,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "NoPadding",
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
