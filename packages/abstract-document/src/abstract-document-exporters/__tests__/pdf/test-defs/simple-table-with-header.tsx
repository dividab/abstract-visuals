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
  Group,
  render,
} from "../../../../abstract-document-jsx";
import * as TableStyle from "../../../../abstract-document/styles/table-style";
import * as TableCellStyle from "../../../../abstract-document/styles/table-cell-style";
import * as AD from "../../../../abstract-document";

const borders = { left: 2, bottom: 2, right: 2, top: 2 };
const margins = { left: 5, bottom: 5, right: 5, top: 5 };
const header = [
  render(
    <TableRow>
      <TableCell>
        <Paragraph>
          <TextRun text="Header 1" />
        </Paragraph>
      </TableCell>
      <TableCell>
        <Paragraph>
          <TextRun text="Header 2" />
        </Paragraph>
      </TableCell>
      <TableCell>
        <Paragraph>
          <TextRun text="Header 3" />
        </Paragraph>
      </TableCell>
    </TableRow>
  ),
  render(
    <TableRow>
      <TableCell>
        <Paragraph>
          <TextRun text="Header 1" />
        </Paragraph>
      </TableCell>
      <TableCell>
        <Paragraph>
          <TextRun text="Header 2" />
        </Paragraph>
      </TableCell>
      <TableCell>
        <Paragraph>
          <TextRun text="Header 3" />
        </Paragraph>
      </TableCell>
    </TableRow>
  ),
];

export const test: ExportTestDef = {
  name: "Simple table with header",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table
          columnWidths={[100, 100, 100]}
          style={TableStyle.create({
            margins: margins,
            cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
          })}
          headerRows={header}
        >
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Child 1" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Child 2" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Child 3" />
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
            x: 0.313,
            y: 1.035,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 0.294,
            y: 0.356,
            w: 3,
            l: 6.287,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 1.035,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 6.5,
            y: 0.356,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 1.035,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 12.75,
            y: 0.356,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 0.313,
            y: 1.758,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 0.294,
            y: 1.035,
            w: 3,
            l: 6.287,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 1.758,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 6.5,
            y: 1.035,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 1.758,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 12.75,
            y: 1.035,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 0.313,
            y: 2.436,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 0.294,
            y: 1.758,
            w: 3,
            l: 6.287,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 2.436,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 6.5,
            y: 1.758,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 2.436,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 12.75,
            y: 1.758,
            w: 3,
            l: 6.331,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 6.563,
            y: 0.313,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 0.356,
            y: 0.313,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 0.313,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 0.313,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 19.019,
            y: 0.313,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 0.313,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 1.035,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 0.356,
            y: 1.035,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 1.035,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 1.035,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 19.019,
            y: 1.035,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 1.035,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 1.758,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 0.356,
            y: 1.758,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 1.758,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 1.758,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 19.019,
            y: 1.758,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 1.758,
            w: 3,
            l: 0.741,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: 0.063,
            y: 0.01100000000000001,
            w: 41.13,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Header%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 6.313,
            y: 0.01100000000000001,
            w: 41.13,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Header%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.563,
            y: 0.01100000000000001,
            w: 41.13,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Header%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 0.063,
            y: 0.734,
            w: 41.13,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Header%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 6.313,
            y: 0.734,
            w: 41.13,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Header%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.563,
            y: 0.734,
            w: 41.13,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Header%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 0.063,
            y: 1.456,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Child%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 6.313,
            y: 1.456,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Child%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.563,
            y: 1.456,
            w: 31.12,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Child%203",
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
