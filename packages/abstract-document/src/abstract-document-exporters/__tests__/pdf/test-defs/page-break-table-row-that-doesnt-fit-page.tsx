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
const tablestylemargin = TableStyle.create({
  cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
  margins: LayoutFoundation.create({ bottom: 805 }),
});

export const test: ExportTestDef = {
  name: "Pagebreak table row that doesnt fit page",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[150]} style={tablestylemargin}>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Table down below" />
              </Paragraph>
            </TableCell>
          </TableRow>
        </Table>
        <Table columnWidths={[150, 100]} style={tablestyle}>
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: LayoutFoundation.create({ top: 300, bottom: 300 }) })}>
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
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 3" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 4" />
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
              y: 0.71,
              w: 1.5,
              l: 9.375,
            },
            {
              x: -0.019,
              y: 0.013,
              w: 1.5,
              l: 9.412,
            },
          ],
          VLines: [
            {
              x: 9.363,
              y: 0,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 0.013,
              y: 0,
              w: 1.5,
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
              x: -0.25,
              y: -0.301,
              w: 80.59,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Table%20down%20below",
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
              y: 38.222,
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
              y: 38.222,
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
              y: 38.932,
              w: 1.5,
              l: 9.375,
            },
            {
              x: -0.019,
              y: 38.222,
              w: 1.5,
              l: 9.412,
            },
            {
              x: 9.375,
              y: 38.932,
              w: 1.5,
              l: 6.25,
            },
            {
              x: 9.344,
              y: 38.222,
              w: 1.5,
              l: 6.3,
            },
          ],
          VLines: [
            {
              x: 9.375,
              y: 0,
              w: 1.5,
              l: 38.241,
            },
            {
              x: 0.013,
              y: 0,
              w: 1.5,
              l: 38.241,
            },
            {
              x: 15.613,
              y: 0,
              w: 1.5,
              l: 38.241,
            },
            {
              x: 9.375,
              y: 0,
              w: 1.5,
              l: 38.241,
            },
            {
              x: 9.375,
              y: 38.222,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 0.013,
              y: 38.222,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 15.613,
              y: 38.222,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 9.375,
              y: 38.222,
              w: 1.5,
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
              x: -0.25,
              y: 18.449,
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
              y: 18.449,
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
              y: 37.921,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%203",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 9.125,
              y: 37.921,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%204",
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
