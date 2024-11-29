/* eslint-disable max-lines */
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
  Group,
  render,
} from "../../../abstract-document-jsx/index.js";
import * as TableStyle from "../../../abstract-document/styles/table-style.js";
import * as TableCellStyle from "../../../abstract-document/styles/table-cell-style.js";
import * as AD from "../../../abstract-document/index.js";

const borders = { left: 2, bottom: 2, right: 2, top: 2 };
const margins = { left: 5, bottom: 5, right: 5, top: 5 };

const tablestylemargin = TableStyle.create({
  cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
});

const header = [
  render(
    <TableRow>
      <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
        <Paragraph>
          <TextRun text="Header 1" />
        </Paragraph>
      </TableCell>
      <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
        <Paragraph>
          <TextRun text="Header 2" />
        </Paragraph>
      </TableCell>
      <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
        <Paragraph>
          <TextRun text="Header 3" />
        </Paragraph>
      </TableCell>
    </TableRow>
  ),
  render(
    <TableRow>
      <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
        <Paragraph>
          <TextRun text="Header 4" />
        </Paragraph>
      </TableCell>
      <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
        <Paragraph>
          <TextRun text="Header 5" />
        </Paragraph>
      </TableCell>
      <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
        <Paragraph>
          <TextRun text="Header 6" />
        </Paragraph>
      </TableCell>
    </TableRow>
  ),
];

export const testPageBreakTableWithHeader2: ExportTestDef = {
  name: "Pagebreak table with header 2",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[150]} style={tablestylemargin}>
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 680 }) })}>
              <Paragraph>
                <TextRun text="Test table starts below this line" />
              </Paragraph>
            </TableCell>
          </TableRow>
        </Table>
        <Table
          columnWidths={[100, 100, 100]}
          style={TableStyle.create({
            margins: margins,
            cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
          })}
          headerRows={header}
        >
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text={`Row 1 Col 1`} />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text="Col 2" />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text="Col 3" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text={`Row 2 Col 1`} />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text="Col 2" />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text="Col 3" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text={`Row 3 Col 1`} />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text="Col 2" />
              </Paragraph>
            </TableCell>
            <TableCell style={TableCellStyle.create({ padding: AD.LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text="Col 3" />
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
            y: 43.179,
            w: 3,
            l: 9.375,
          },
          {
            oc: "#000000",
            x: -0.019,
            y: 0.044,
            w: 3,
            l: 9.412,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 9.331,
            y: 0,
            w: 3,
            l: 43.241,
          },
          {
            oc: "#000000",
            x: 0.044,
            y: 0,
            w: 3,
            l: 43.241,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: 42.199,
            w: 136.72,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Test%20table%20starts%20below%20this%20line",
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
            x: 0.313,
            y: 3.535,
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
            y: 3.535,
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
            y: 3.535,
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
            y: 6.758,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 0.294,
            y: 3.535,
            w: 3,
            l: 6.287,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 6.758,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 6.5,
            y: 3.535,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 6.758,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 12.75,
            y: 3.535,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 0.313,
            y: 9.98,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 0.294,
            y: 6.758,
            w: 3,
            l: 6.287,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 9.98,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 6.5,
            y: 6.758,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 9.98,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 12.75,
            y: 6.758,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 0.313,
            y: 13.203,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 0.294,
            y: 9.98,
            w: 3,
            l: 6.287,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 13.203,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 6.5,
            y: 9.98,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 13.203,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 12.75,
            y: 9.98,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 0.313,
            y: 16.381,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 0.294,
            y: 13.203,
            w: 3,
            l: 6.287,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 16.381,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 6.5,
            y: 13.203,
            w: 3,
            l: 6.331,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 16.381,
            w: 3,
            l: 6.25,
          },
          {
            oc: "#000000",
            x: 12.75,
            y: 13.203,
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
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 0.356,
            y: 0.313,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 0.313,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 0.313,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 19.019,
            y: 0.313,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 0.313,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 3.535,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 0.356,
            y: 3.535,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 3.535,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 3.535,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 19.019,
            y: 3.535,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 3.535,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 6.758,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 0.356,
            y: 6.758,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 6.758,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 6.758,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 19.019,
            y: 6.758,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 6.758,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 9.98,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 0.356,
            y: 9.98,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 9.98,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 9.98,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 19.019,
            y: 9.98,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 9.98,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 13.203,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 0.356,
            y: 13.203,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 13.203,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 6.563,
            y: 13.203,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 19.019,
            y: 13.203,
            w: 3,
            l: 3.241,
          },
          {
            oc: "#000000",
            x: 12.813,
            y: 13.203,
            w: 3,
            l: 3.241,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: 0.063,
            y: 1.2610000000000001,
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
            y: 1.2610000000000001,
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
            y: 1.2610000000000001,
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
            y: 4.484,
            w: 41.13,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Header%204",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 6.313,
            y: 4.484,
            w: 41.13,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Header%205",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.563,
            y: 4.484,
            w: 41.13,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Header%206",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 0.063,
            y: 7.7059999999999995,
            w: 54.46,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Row%201%20Col%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 6.313,
            y: 7.7059999999999995,
            w: 23.34,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Col%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.563,
            y: 7.7059999999999995,
            w: 23.34,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Col%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 0.063,
            y: 10.929,
            w: 54.46,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Row%202%20Col%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 6.313,
            y: 10.929,
            w: 23.34,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Col%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.563,
            y: 10.929,
            w: 23.34,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Col%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 0.063,
            y: 14.151,
            w: 54.46,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Row%203%20Col%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 6.313,
            y: 14.151,
            w: 23.34,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Col%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.563,
            y: 14.151,
            w: 23.34,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Col%203",
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
