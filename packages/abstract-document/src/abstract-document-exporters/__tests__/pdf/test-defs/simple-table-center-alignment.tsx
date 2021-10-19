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
              x: 6.094,
              y: 0,
              w: 1.5,
              l: 25,
            },
            {
              x: 6.094,
              y: 0.723,
              w: 1.5,
              l: 25,
            },
          ],
          Height: 52.625,
          Texts: [
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "CenterAlignedTable",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 88.37,
              x: 5.844,
              y: -0.301,
            },
          ],
          VLines: [
            {
              x: 6.094,
              y: 0,
              w: 1.5,
              l: 0.723,
            },
            {
              x: 31.094,
              y: 0,
              w: 1.5,
              l: 0.723,
            },
          ],
        },
      ],
      Transcoder: "pdf2json@1.2.3 [https://github.com/modesty/pdf2json]",
      Width: 37.188,
    },
  },
};
