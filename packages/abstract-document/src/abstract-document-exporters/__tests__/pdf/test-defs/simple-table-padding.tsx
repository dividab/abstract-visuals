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
const margins = { left: 5, bottom: 5, right: 5, top: 5 };
export const test: ExportTestDef = {
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
    formImage: {
      Agency: "",
      Id: {
        AgencyId: "",
        MC: false,
        Max: 1,
        Name: "",
        Parent: "",
      },
      Pages: [
        {
          Boxsets: [],
          Fields: [],
          Fills: [
            {
              clr: 1,
              h: 0,
              w: 0,
              x: 0,
              y: 0,
            },
          ],
          HLines: [
            {
              x: 0.313,
              y: 0.313,
              w: 1.5,
              l: 36.563,
            },
            {
              x: 0.313,
              y: 1.035,
              w: 1.5,
              l: 36.563,
            },
          ],
          Height: 52.625,
          Texts: [
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "PaddedTable",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 59.48,
              x: 0.063,
              y: 0.01100000000000001,
            },
          ],
          VLines: [
            {
              x: 0.313,
              y: 0.313,
              w: 1.5,
              l: 0.722,
            },
            {
              x: 36.875,
              y: 0.313,
              w: 1.5,
              l: 0.722,
            },
          ],
        },
      ],
      Transcoder: "pdf2json@1.2.3 [https://github.com/modesty/pdf2json]",
      Width: 37.188,
    },
  },
};
