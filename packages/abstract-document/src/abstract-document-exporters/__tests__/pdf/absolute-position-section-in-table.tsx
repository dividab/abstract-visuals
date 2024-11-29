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
import * as TableCellStyle from "../../../abstract-document/styles/table-cell-style.js";
import * as AD from "../../../index.js";

const borders = { left: 2, bottom: 2, right: 2, top: 2 };
const margins = { left: 100, bottom: 5, right: 5, top: 200 };

export const testAbsolutePositionSectionInTable: ExportTestDef = {
  name: "Absolute position section in table",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table
          columnWidths={[Infinity]}
          style={TableStyle.create({
            margins: margins,
            position: "absolute",
            cellStyle: TableCellStyle.create({
              borders: borders,
              borderColor: "black",
              padding: { top: 10, left: 10, right: 10, bottom: 10 },
            }),
          })}
        >
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello! I am inside an absolute positioned table." />
              </Paragraph>
              <Paragraph
                style={AD.AbstractDoc.ParagraphStyle.create({
                  position: "absolute",
                  margins: AD.AbstractDoc.LayoutFoundation.create({ left: 100, top: 30 }),
                })}
              >
                <TextRun text="So am I- wait no, im absolutely outside the table..." />
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
            x: 6.25,
            y: 14.429,
            w: 3,
            l: 30.625,
          },
          {
            oc: "#000000",
            x: 6.231,
            y: 12.544,
            w: 3,
            l: 30.662,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 36.831,
            y: 12.5,
            w: 3,
            l: 1.991,
          },
          {
            oc: "#000000",
            x: 6.294,
            y: 12.5,
            w: 3,
            l: 1.991,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: 6.625,
            y: 12.824,
            w: 206.77,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello!%20I%20am%20inside%20an%20absolute%20positioned%20table.",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.875,
            y: 14.699,
            w: 220.66,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "So%20am%20I-%20wait%20no%2C%20im%20absolutely%20outside%20the%20table...",
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
