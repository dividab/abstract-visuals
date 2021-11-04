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
import { TableCellStyle, TableStyle } from "../../../../abstract-document";

const borders = { left: 1, bottom: 1, right: 1, top: 1 };
const tablestyle = TableStyle.create({
  cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
});

export const test: ExportTestDef = {
  name: "Simple table colSpan and rowSpan",
  only: true,
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table columnWidths={[150, 100, 50, 50]} style={tablestyle}>
          <TableRow>
            <TableCell columnSpan={2}>
              <Paragraph>
                <TextRun text="Hello 1" />
              </Paragraph>
            </TableCell>
            <TableCell rowSpan={2}>
              <Paragraph>
                <TextRun text="Hello 2" />
              </Paragraph>
            </TableCell>
            <TableCell rowSpan={4}>
              <Paragraph>
                <TextRun text="Hello 3" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 4" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 5" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell columnSpan={2} rowSpan={2}>
              <Paragraph>
                <TextRun text="Hello 6" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 7" />
              </Paragraph>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun text="Hello 8" />
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
              y: 0.723,
              w: 1.5,
              l: 15.625,
            },
            {
              x: -0.019,
              y: 0.013,
              w: 1.5,
              l: 15.663,
            },
            {
              x: 15.625,
              y: 1.445,
              w: 1.5,
              l: 3.125,
            },
            {
              x: 15.594,
              y: 0.013,
              w: 1.5,
              l: 3.175,
            },
            {
              x: 18.75,
              y: 2.89,
              w: 1.5,
              l: 3.125,
            },
            {
              x: 18.719,
              y: 0.013,
              w: 1.5,
              l: 3.175,
            },
            {
              x: 0,
              y: 1.445,
              w: 1.5,
              l: 9.375,
            },
            {
              x: -0.019,
              y: 0.723,
              w: 1.5,
              l: 9.412,
            },
            {
              x: 9.375,
              y: 1.445,
              w: 1.5,
              l: 6.25,
            },
            {
              x: 9.344,
              y: 0.723,
              w: 1.5,
              l: 6.3,
            },
            {
              x: 0,
              y: 2.89,
              w: 1.5,
              l: 15.625,
            },
            {
              x: -0.019,
              y: 1.445,
              w: 1.5,
              l: 15.663,
            },
            {
              x: 15.625,
              y: 2.167,
              w: 1.5,
              l: 3.125,
            },
            {
              x: 15.594,
              y: 1.445,
              w: 1.5,
              l: 3.175,
            },
            {
              x: 15.625,
              y: 2.877,
              w: 1.5,
              l: 3.125,
            },
            {
              x: 15.594,
              y: 2.167,
              w: 1.5,
              l: 3.175,
            },
          ],
          VLines: [
            {
              x: 15.625,
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
            {
              x: 18.75,
              y: 0,
              w: 1.5,
              l: 1.464,
            },
            {
              x: 15.625,
              y: 0,
              w: 1.5,
              l: 1.464,
            },
            {
              x: 21.863,
              y: 0,
              w: 1.5,
              l: 2.909,
            },
            {
              x: 18.75,
              y: 0,
              w: 1.5,
              l: 2.909,
            },
            {
              x: 9.375,
              y: 0.723,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 0.013,
              y: 0.723,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 15.625,
              y: 0.723,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 9.375,
              y: 0.723,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 15.625,
              y: 1.445,
              w: 1.5,
              l: 1.464,
            },
            {
              x: 0.013,
              y: 1.445,
              w: 1.5,
              l: 1.464,
            },
            {
              x: 18.75,
              y: 1.445,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 15.625,
              y: 1.445,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 18.75,
              y: 2.167,
              w: 1.5,
              l: 0.741,
            },
            {
              x: 15.625,
              y: 2.167,
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
              x: 15.375,
              y: 0.06000000000000005,
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
              x: 18.5,
              y: 0.782,
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
              x: -0.25,
              y: 0.42100000000000004,
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
            {
              x: 9.125,
              y: 0.42100000000000004,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%205",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: -0.25,
              y: 1.505,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%206",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 15.375,
              y: 1.144,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%207",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 15.375,
              y: 1.866,
              w: 31.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello%208",
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
