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
  name: "Simple table mix auto fix",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[150, Infinity, 50]}>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Fix 150" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Auto" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Fix 50" />
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
                  T: "Fix%20150",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 32.79,
              x: -0.25,
              y: -0.301,
            },
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "Auto",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 20.57,
              x: 9.125,
              y: -0.301,
            },
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "Fix%2050",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 27.23,
              x: 33.813,
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
