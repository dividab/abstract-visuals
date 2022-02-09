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
import * as AD from "../../../../index";

const borders = { left: 2, bottom: 2, right: 2, top: 2 };
const margins = { left: 100, bottom: 5, right: 5, top: 200 };

export const test: ExportTestDef = {
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
  expectedPdfJson: {},
};
