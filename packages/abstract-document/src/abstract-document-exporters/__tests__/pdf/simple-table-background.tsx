import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { AbstractDoc, Section, Table, TableRow, TableCell } from "../../../abstract-document-jsx/index.js";
import * as TableCellStyle from "../../../abstract-document/styles/table-cell-style.js";
import { LayoutFoundation } from "../../../abstract-document/index.js";

export const testSimpleTableBackground: ExportTestDef = {
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
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [],
        Fields: [],
        Boxsets: [],
      },
    ],
  },
};
