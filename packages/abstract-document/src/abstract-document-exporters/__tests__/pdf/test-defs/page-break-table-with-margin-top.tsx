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
  margins: LayoutFoundation.create({ top: 300 }),
});
const tablestylemargin = TableStyle.create({
  cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
});

export const test: ExportTestDef = {
  name: "Pagebreak table with margin top",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[150]} style={tablestylemargin}>
          <TableRow>
            <TableCell style={TableCellStyle.create({ padding: LayoutFoundation.create({ top: 500 }) })}>
              <Paragraph>
                <TextRun text="Test table starts below this line" />
              </Paragraph>
            </TableCell>
          </TableRow>
        </Table>
        <Table columnWidths={[150, 100]} style={tablestyle}>
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
        <Table columnWidths={[150]} style={tablestylemargin}>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Test table ended above this line" />
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
              y: 31.96,
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
              l: 31.991,
            },
            {
              x: 0.013,
              y: 0,
              w: 1.5,
              l: 31.991,
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
              y: 30.949,
              w: 136.72,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Test%20table%20starts%20below%20this%20line",
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
              y: 21.973,
              w: 1.5,
              l: 9.375,
            },
            {
              x: -0.019,
              y: 18.762,
              w: 1.5,
              l: 9.412,
            },
            {
              x: 9.375,
              y: 21.973,
              w: 1.5,
              l: 6.25,
            },
            {
              x: 9.344,
              y: 18.762,
              w: 1.5,
              l: 6.3,
            },
            {
              x: 0,
              y: 25.195,
              w: 1.5,
              l: 9.375,
            },
            {
              x: -0.019,
              y: 21.973,
              w: 1.5,
              l: 9.412,
            },
            {
              x: 9.375,
              y: 25.195,
              w: 1.5,
              l: 6.25,
            },
            {
              x: 9.344,
              y: 21.973,
              w: 1.5,
              l: 6.3,
            },
            {
              x: 0,
              y: 28.405,
              w: 1.5,
              l: 9.375,
            },
            {
              x: -0.019,
              y: 25.195,
              w: 1.5,
              l: 9.412,
            },
            {
              x: 9.375,
              y: 28.405,
              w: 1.5,
              l: 6.25,
            },
            {
              x: 9.344,
              y: 25.195,
              w: 1.5,
              l: 6.3,
            },
            {
              x: 0,
              y: 29.128,
              w: 1.5,
              l: 9.375,
            },
            {
              x: -0.019,
              y: 28.43,
              w: 1.5,
              l: 9.412,
            },
          ],
          VLines: [
            {
              x: 9.375,
              y: 18.75,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 0.013,
              y: 18.75,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 15.613,
              y: 18.75,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 9.375,
              y: 18.75,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 9.375,
              y: 21.973,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 0.013,
              y: 21.973,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 15.613,
              y: 21.973,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 9.375,
              y: 21.973,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 9.375,
              y: 25.195,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 0.013,
              y: 25.195,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 15.613,
              y: 25.195,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 9.375,
              y: 25.195,
              w: 1.5,
              l: 3.241,
            },
            {
              x: 9.363,
              y: 28.418,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 0.013,
              y: 28.418,
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
              y: 19.699,
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
              y: 19.699,
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
              y: 22.921,
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
              y: 22.921,
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
              y: 26.144,
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
              y: 26.144,
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
              y: 28.116,
              w: 141.19,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Test%20table%20ended%20above%20this%20line",
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
