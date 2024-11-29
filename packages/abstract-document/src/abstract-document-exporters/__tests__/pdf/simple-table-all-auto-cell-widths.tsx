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

export const testSimpleTableAllAutoCellWidths: ExportTestDef = {
  name: "Simple table all auto",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[Infinity, Infinity, Infinity]}>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Auto 1" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Auto 2" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Auto 3" />
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
                T: "Auto%201",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 28.91,
            x: -0.25,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "Auto%202",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 28.91,
            x: 12.146,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "Auto%203",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 28.91,
            x: 24.542,
            y: -0.301,
          },
        ],
        VLines: [],
      },
    ],
  },
};
