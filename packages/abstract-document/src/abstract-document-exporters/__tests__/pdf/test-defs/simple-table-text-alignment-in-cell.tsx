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
import * as TextStyle from "../../../../abstract-document/styles/text-style";
import * as TableCellStyle from "../../../../abstract-document/styles/table-cell-style";

const borders = { left: 2, bottom: 2, right: 2, top: 2 };

export const test: ExportTestDef = {
  name: "Simple table text alignment in cell",
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
                <TextRun style={TextStyle.create({ alignment: "left" })} text="Left" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "center" })} text="Center" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "justify" })} text="Justify text to fill cell." />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "right" })} text="Right" />
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
            y: 0.679,
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
            y: 0.679,
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
            y: 0.679,
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
            y: 0.679,
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
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 9.262,
            y: 0,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 18.594,
            y: 0,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 12.344,
            y: 0,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 24.844,
            y: 0,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 18.594,
            y: 0,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 27.925,
            y: 0,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 24.844,
            y: 0,
            w: 3,
            l: 0.741,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: 8.969,
            y: -0.301,
            w: 16.68,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Left",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 14.281,
            y: -0.301,
            w: 30.01,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Center",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 18.344,
            y: -0.301,
            w: 91.14,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Justify%20text%20to%20fill%20cell.",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 26.26,
            y: -0.301,
            w: 23.34,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Right",
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
