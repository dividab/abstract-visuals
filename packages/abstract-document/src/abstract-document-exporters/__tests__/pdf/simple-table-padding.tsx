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

const borders = { left: 2, bottom: 2, right: 2, top: 2 };
const margins = { left: 5, bottom: 5, right: 5, top: 5 };
export const testSimpleTablePadding: ExportTestDef = {
  name: "Simple table padding",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table
          columnWidths={[Infinity]}
          style={TableStyle.create({
            margins: margins,
            cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
          })}
        >
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="PaddedTable" />
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
            y: 0.991,
            w: 3,
            l: 36.563,
          },
          {
            oc: "#000000",
            x: 0.294,
            y: 0.356,
            w: 3,
            l: 36.6,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 36.831,
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
        ],
        Fills: [],
        Texts: [
          {
            x: 0.063,
            y: 0.01100000000000001,
            w: 59.48,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "PaddedTable",
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
