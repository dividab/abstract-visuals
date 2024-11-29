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

export const testGroupTooBigForOnePage: ExportTestDef = {
  name: "Group too big for one page",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Group keepTogether={true}>
          <Table columnWidths={[150, 100]} style={tablestyle}>
            <TableRow>
              <TableCell style={TableCellStyle.create({ padding: LayoutFoundation.create({ top: 250, bottom: 250 }) })}>
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
            <TableRow>
              <TableCell style={TableCellStyle.create({ padding: LayoutFoundation.create({ top: 250, bottom: 250 }) })}>
                <Paragraph>
                  <TextRun text="Hello 3" />
                </Paragraph>
              </TableCell>
              <TableCell>
                <Paragraph>
                  <TextRun text="Hello 4" />
                </Paragraph>
              </TableCell>
            </TableRow>
          </Table>
        </Group>
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
            y: 31.96,
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
            y: 31.96,
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
            l: 31.991,
          },
          {
            oc: "#000000",
            x: 0.013,
            y: 0,
            w: 1.5,
            l: 31.991,
          },
          {
            oc: "#000000",
            x: 15.613,
            y: 0,
            w: 1.5,
            l: 31.991,
          },
          {
            oc: "#000000",
            x: 9.375,
            y: 0,
            w: 1.5,
            l: 31.991,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: 15.324000000000002,
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
            y: 15.324000000000002,
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
      {
        Height: 52.625,
        Width: 37.188,
        HLines: [
          {
            oc: "#000000",
            x: 0,
            y: 31.96,
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
            y: 31.96,
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
            l: 31.991,
          },
          {
            oc: "#000000",
            x: 0.013,
            y: 0,
            w: 1.5,
            l: 31.991,
          },
          {
            oc: "#000000",
            x: 15.613,
            y: 0,
            w: 1.5,
            l: 31.991,
          },
          {
            oc: "#000000",
            x: 9.375,
            y: 0,
            w: 1.5,
            l: 31.991,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: 15.324000000000002,
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
            x: 9.125,
            y: 15.324000000000002,
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
        ],
        Fields: [],
        Boxsets: [],
      },
    ],
  },
};
