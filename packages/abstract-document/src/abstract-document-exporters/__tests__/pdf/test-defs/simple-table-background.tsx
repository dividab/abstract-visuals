import React from "react";
import { ExportTestDef } from "../export-test-def";
import { AbstractDoc, Section, Table, TableRow, TableCell } from "../../../../abstract-document-jsx";
import * as TableCellStyle from "../../../../abstract-document/styles/table-cell-style";
import { LayoutFoundation } from "../../../../abstract-document";

export const test: ExportTestDef = {
  name: "Simple table background",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[30, 30, 30, 30]}>
          <TableRow>
            <TableCell
              style={TableCellStyle.create({ background: "blue", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
            <TableCell
              style={TableCellStyle.create({ background: "yellow", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
            <TableCell
              style={TableCellStyle.create({ background: "blue", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
            <TableCell
              style={TableCellStyle.create({ background: "blue", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              style={TableCellStyle.create({ background: "yellow", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
            <TableCell
              style={TableCellStyle.create({ background: "yellow", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
            <TableCell
              style={TableCellStyle.create({ background: "yellow", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
            <TableCell
              style={TableCellStyle.create({ background: "yellow", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
          </TableRow>
          <TableRow>
            <TableCell
              style={TableCellStyle.create({ background: "blue", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
            <TableCell
              style={TableCellStyle.create({ background: "yellow", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
            <TableCell
              style={TableCellStyle.create({ background: "blue", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
            <TableCell
              style={TableCellStyle.create({ background: "blue", padding: LayoutFoundation.create({ bottom: 30 }) })}
            ></TableCell>
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
          HLines: [],
          VLines: [],
          Fills: [
            {
              x: 0,
              y: 0,
              w: 0,
              h: 0,
              clr: 1,
            },
            {
              x: 0,
              y: 0,
              w: 1.875,
              h: 1.875,
              clr: 35,
            },
            {
              oc: "#ffff00",
              x: 1.875,
              y: 0,
              w: 1.875,
              h: 1.875,
              clr: -1,
            },
            {
              x: 3.75,
              y: 0,
              w: 1.875,
              h: 1.875,
              clr: 35,
            },
            {
              x: 5.625,
              y: 0,
              w: 1.875,
              h: 1.875,
              clr: 35,
            },
            {
              oc: "#ffff00",
              x: 0,
              y: 1.875,
              w: 1.875,
              h: 1.875,
              clr: -1,
            },
            {
              oc: "#ffff00",
              x: 1.875,
              y: 1.875,
              w: 1.875,
              h: 1.875,
              clr: -1,
            },
            {
              oc: "#ffff00",
              x: 3.75,
              y: 1.875,
              w: 1.875,
              h: 1.875,
              clr: -1,
            },
            {
              oc: "#ffff00",
              x: 5.625,
              y: 1.875,
              w: 1.875,
              h: 1.875,
              clr: -1,
            },
            {
              x: 0,
              y: 3.75,
              w: 1.875,
              h: 1.875,
              clr: 35,
            },
            {
              oc: "#ffff00",
              x: 1.875,
              y: 3.75,
              w: 1.875,
              h: 1.875,
              clr: -1,
            },
            {
              x: 3.75,
              y: 3.75,
              w: 1.875,
              h: 1.875,
              clr: 35,
            },
            {
              x: 5.625,
              y: 3.75,
              w: 1.875,
              h: 1.875,
              clr: 35,
            },
          ],
          Texts: [],
          Fields: [],
          Boxsets: [],
        },
      ],
      Width: 37.188,
    },
  },
};
