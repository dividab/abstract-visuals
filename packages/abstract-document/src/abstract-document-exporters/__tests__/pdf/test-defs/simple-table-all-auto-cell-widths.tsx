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

export const test: ExportTestDef = {
  name: "Simple table all auto",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[Infinity, Infinity, Infinity]}>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Auto 1" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Auto 2" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Auto 3" />
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
          HLines: [],
          Height: 52.625,
          Texts: [
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "Auto%201",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 28.91,
              x: -0.25,
              y: -0.301,
            },
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "Auto%202",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 28.91,
              x: 12.146,
              y: -0.301,
            },
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "Auto%203",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 28.91,
              x: 24.542,
              y: -0.301,
            },
          ],
          VLines: [],
        },
      ],
      Transcoder: "pdf2json@1.2.3 [https://github.com/modesty/pdf2json]",
      Width: 37.188,
    },
  },
};
