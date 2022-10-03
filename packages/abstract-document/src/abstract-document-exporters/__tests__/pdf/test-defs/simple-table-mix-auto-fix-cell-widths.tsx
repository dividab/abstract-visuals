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

export const test: ExportTestDef = {
  name: "Simple table mix auto fix",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[150, Infinity, 50]}>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Fix 150" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Auto" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Fix 50" />
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
        Boxsets: [],
        Fields: [],
        Fills: [],
        HLines: [],
        Height: 52.625,
        Width: 37.188,
        Texts: [
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "Fix%20150",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 32.79,
            x: -0.25,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "Auto",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 20.57,
            x: 9.125,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "Fix%2050",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 27.23,
            x: 33.813,
            y: -0.301,
          },
        ],
        VLines: [],
      },
    ],
  },
};
