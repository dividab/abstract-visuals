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
export const test: ExportTestDef = {
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
    formImage: {
      Transcoder: "pdf2json@1.2.3 [https://github.com/modesty/pdf2json]",
      Agency: "",
      Id: {
        AgencyId: "",
        Name: "",
        MC: false,
        Max: 1,
        Parent: "",
      },
      Pages: [
        {
          Height: 52.625,
          HLines: [
            {
              x: 6.094,
              y: 0.679,
              w: 3,
              l: 25,
            },
            {
              x: 6.075,
              y: 0.044,
              w: 3,
              l: 25.038,
            },
          ],
          VLines: [
            {
              x: 31.05,
              y: 0,
              w: 3,
              l: 0.741,
            },
            {
              x: 6.138,
              y: 0,
              w: 3,
              l: 0.741,
            },
          ],
          Fills: [
            {
              x: 0,
              y: 0,
              w: 0,
              h: 0,
              clr: 1,
            },
          ],
          Texts: [
            {
              x: 5.844,
              y: -0.301,
              w: 88.37,
              sw: 0.32553125,
              clr: 0,
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
      Width: 37.188,
    },
  },
};
