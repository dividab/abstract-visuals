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
import * as TableCellStyle from "../../../../abstract-document/styles/table-cell-style";

const borders = { left: 2, bottom: 2, right: 2, top: 2 };
const margins = { left: 100, bottom: 5, right: 5, top: 200 };

export const test: ExportTestDef = {
  name: "Absolute position table",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table
          columnWidths={[Infinity]}
          style={TableStyle.create({
            margins: margins,
            position: "absolute",
            cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
          })}
        >
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello! I am inside an absolute positioned table." />
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
            y: 13.179,
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
            l: 0.741,
          },
          {
            oc: "#000000",
            x: 6.294,
            y: 12.5,
            w: 3,
            l: 0.741,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: 6,
            y: 12.199,
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
        ],
        Fields: [],
        Boxsets: [],
      },
    ],
  },
};
