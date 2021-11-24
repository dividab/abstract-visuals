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
import { LayoutFoundation, TableCellStyle, TableStyle } from "../../../../abstract-document";

const borders = { left: 1, bottom: 1, right: 1, top: 1 };
const tablestyle = TableStyle.create({
  cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
});
export const test: ExportTestDef = {
  name: "Pagebreak table with margin top single table",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[150, 100]} style={tablestyle}>
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: LayoutFoundation.create({ top: 400, bottom: 450 }) })}>
              <Paragraph>
                <TextRun text="Hello 1" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 2" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text="Hello 1" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 2" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: LayoutFoundation.create({ top: 20, bottom: 20 }) })}>
              <Paragraph>
                <TextRun text="Hello 1" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 2" />
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
              x: 0,
              y: 53.835,
              w: 1.5,
              l: 9.375,
            },
            {
              x: -0.019,
              y: 0.013,
              w: 1.5,
              l: 9.412,
            },
            {
              x: 9.375,
              y: 53.835,
              w: 1.5,
              l: 6.25,
            },
            {
              x: 9.344,
              y: 0.013,
              w: 1.5,
              l: 6.3,
            },
          ],
          VLines: [
            {
              x: 9.375,
              y: 0,
              w: 1.5,
              l: 53.866,
            },
            {
              x: 0.013,
              y: 0,
              w: 1.5,
              l: 53.866,
            },
            {
              x: 15.613,
              y: 0,
              w: 1.5,
              l: 53.866,
            },
            {
              x: 9.375,
              y: 0,
              w: 1.5,
              l: 53.866,
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
              x: -0.25,
              y: 24.699,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%201",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 9.125,
              y: 26.261,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%202",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
          ],
          Fields: [],
          Boxsets: [],
        },
        {
          Height: 52.625,
          HLines: [
            {
              x: 0,
              y: 3.223,
              w: 1.5,
              l: 9.375,
            },
            {
              x: -0.019,
              y: 0.013,
              w: 1.5,
              l: 9.412,
            },
            {
              x: 9.375,
              y: 3.223,
              w: 1.5,
              l: 6.25,
            },
            {
              x: 9.344,
              y: 0.013,
              w: 1.5,
              l: 6.3,
            },
            {
              x: 0,
              y: 6.433,
              w: 1.5,
              l: 9.375,
            },
            {
              x: -0.019,
              y: 3.223,
              w: 1.5,
              l: 9.412,
            },
            {
              x: 9.375,
              y: 6.433,
              w: 1.5,
              l: 6.25,
            },
            {
              x: 9.344,
              y: 3.223,
              w: 1.5,
              l: 6.3,
            },
          ],
          VLines: [
            {
              x: 9.375,
              y: 0,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 0.013,
              y: 0,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 15.613,
              y: 0,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 9.375,
              y: 0,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 9.375,
              y: 3.223,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 0.013,
              y: 3.223,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 15.613,
              y: 3.223,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 9.375,
              y: 3.223,
              w: 1.5,
              l: 3.241,
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
              x: -0.25,
              y: 0.9490000000000001,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%201",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 9.125,
              y: 0.9490000000000001,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%202",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: -0.25,
              y: 4.171,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%201",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 9.125,
              y: 4.171,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%202",
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
