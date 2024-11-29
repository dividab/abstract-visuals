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
// RowAlignment = "Top" | "Middle" | "Bottom";

export const testSimpleTableRowAlignment: ExportTestDef = {
  name: "Simple table row alignment",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table
          columnWidths={[50, 100, 100, 50]}
          style={TableStyle.create({
            alignment: "Center",
            cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
          })}
        >
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun
                  style={TextStyle.create({ alignment: "left" })}
                  text="Multiple lines to visualize other cells."
                />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ verticalAlignment: "Top" })}>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "left" })} text="Top" />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ verticalAlignment: "Middle" })}>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "center" })} text="Middle" />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ verticalAlignment: "Bottom" })}>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "right" })} text="Bottom" />
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
            x: 9.219,
            y: 2.846,
            w: 3,
            l: 3.125,
          },
          {
            oc: "#000000",
            x: 9.2,
            y: 0.044,
            w: 3,
            l: 3.163,
          },
          {
            oc: "#000000",
            x: 12.344,
            y: 2.846,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 12.281,
            y: 0.044,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 18.594,
            y: 2.846,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 18.531,
            y: 0.044,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 24.844,
            y: 2.846,
            w: 3,
            l: 3.125,
          },
          {
            oc: "#000000",
            x: 24.781,
            y: 0.044,
            w: 3,
            l: 3.206,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 12.344,
            y: 0,
            w: 3,
            l: 2.909,
          },
          {
            oc: "#000000",
            x: 9.262,
            y: 0,
            w: 3,
            l: 2.909,
          },
          {
            oc: "#000000",
            x: 18.594,
            y: 0,
            w: 3,
            l: 2.909,
          },
          {
            oc: "#000000",
            x: 12.344,
            y: 0,
            w: 3,
            l: 2.909,
          },
          {
            oc: "#000000",
            x: 24.844,
            y: 0,
            w: 3,
            l: 2.909,
          },
          {
            oc: "#000000",
            x: 18.594,
            y: 0,
            w: 3,
            l: 2.909,
          },
          {
            oc: "#000000",
            x: 27.925,
            y: 0,
            w: 3,
            l: 2.909,
          },
          {
            oc: "#000000",
            x: 24.844,
            y: 0,
            w: 3,
            l: 2.909,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: 8.969,
            y: -0.301,
            w: 37.23,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Multiple%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 8.969,
            y: 0.42100000000000004,
            w: 34.46,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "lines%20to%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 8.969,
            y: 1.144,
            w: 41.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "visualize%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 8.969,
            y: 1.866,
            w: 48.35,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "other%20cells.",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.094,
            y: -0.301,
            w: 17.23,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Top",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 20.548,
            y: 0.782,
            w: 29.45,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Middle",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 25.739,
            y: 1.866,
            w: 31.68,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Bottom",
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
