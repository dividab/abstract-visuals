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
export const testSimpleTableCenterAlignment: ExportTestDef = {
  name: "Simple table center alignment",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table
          columnWidths={[400]}
          style={TableStyle.create({
            alignment: "Center",
            cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
          })}
        >
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="CenterAlignedTable" />
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
            x: 6.094,
            y: 0.679,
            w: 3,
            l: 25,
          },
          {
            oc: "#000000",
            x: 6.075,
            y: 0.044,
            w: 3,
            l: 25.038,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 31.05,
            y: 0,
            w: 3,
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 6.138,
            y: 0,
            w: 3,
            l: 0.741,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: 5.844,
            y: -0.301,
            w: 88.37,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "CenterAlignedTable",
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
