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
import * as TextStyle from "../../../../abstract-document/styles/text-style";
import * as TableCellStyle from "../../../../abstract-document/styles/table-cell-style";

const borders = { left: 2, bottom: 2, right: 2, top: 2 };

export const test: ExportTestDef = {
  name: "Simple table text alignment in cell with wrapping",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Table
          columnWidths={[50, 100, 100, 50]}
          style={TableStyle.create({
            alignment: "Center",
            cellStyle: TableCellStyle.create({ borders: borders, borderColor: "black" }),
          })}
        >
          <TableRow>
            <TableCell>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "left" })} text="Left placed text that wraps" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "center" })} text="Center placed text that wraps" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun
                  style={TextStyle.create({ alignment: "justify" })}
                  text="Justify text to fill cell that wraps and fills two ligns"
                />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph>
                <TextRun style={TextStyle.create({ alignment: "right" })} text="Right placed text that wraps" />
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
              x: 9.219,
              y: 2.846,
              w: 3,
              l: 3.125,
            },
            {
              x: 9.2,
              y: 0.044,
              w: 3,
              l: 3.163,
            },
            {
              x: 12.344,
              y: 2.846,
              w: 3,
              l: 6.25,
            },
            {
              x: 12.281,
              y: 0.044,
              w: 3,
              l: 6.331,
            },
            {
              x: 18.594,
              y: 2.846,
              w: 3,
              l: 6.25,
            },
            {
              x: 18.531,
              y: 0.044,
              w: 3,
              l: 6.331,
            },
            {
              x: 24.844,
              y: 2.846,
              w: 3,
              l: 3.125,
            },
            {
              x: 24.781,
              y: 0.044,
              w: 3,
              l: 3.206,
            },
          ],
          VLines: [
            {
              x: 12.344,
              y: 0,
              w: 3,
              l: 2.909,
            },
            {
              x: 9.262,
              y: 0,
              w: 3,
              l: 2.909,
            },
            {
              x: 18.594,
              y: 0,
              w: 3,
              l: 2.909,
            },
            {
              x: 12.344,
              y: 0,
              w: 3,
              l: 2.909,
            },
            {
              x: 24.844,
              y: 0,
              w: 3,
              l: 2.909,
            },
            {
              x: 18.594,
              y: 0,
              w: 3,
              l: 2.909,
            },
            {
              x: 27.925,
              y: 0,
              w: 3,
              l: 2.909,
            },
            {
              x: 24.844,
              y: 0,
              w: 3,
              l: 2.909,
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
              x: 8.969,
              y: -0.301,
              w: 19.46,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Left%20",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 8.969,
              y: 0.42100000000000004,
              w: 32.24,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "placed%20",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 8.969,
              y: 1.144,
              w: 38.36,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "text%20that%20",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 8.969,
              y: 1.866,
              w: 26.67,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "wraps",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 12.605,
              y: 0.42100000000000004,
              w: 83.93,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Center%20placed%20text%20",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 13.78,
              y: 1.144,
              w: 46.13,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "that%20wraps",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 18.344,
              y: 0.06000000000000005,
              w: 28.34,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Justify",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 20.478,
              y: 0.06000000000000005,
              w: 16.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "text",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 21.849,
              y: 0.06000000000000005,
              w: 8.34,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "to",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 22.734,
              y: 0.06000000000000005,
              w: 9.44,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "fill",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 23.688,
              y: 0.06000000000000005,
              w: 15,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "cell",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 18.344,
              y: 0.782,
              w: 16.68,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "that",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 19.92,
              y: 0.782,
              w: 26.67,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "wraps",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 22.121,
              y: 0.782,
              w: 16.68,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "and",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 23.697,
              y: 0.782,
              w: 14.44,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "fills",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 18.344,
              y: 1.505,
              w: 38.9,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "two%20ligns",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 26.26,
              y: -0.301,
              w: 26.12,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Right%20",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 25.878,
              y: 0.42100000000000004,
              w: 32.24,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "placed%20",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 25.514,
              y: 1.144,
              w: 38.36,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "text%20that%20",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 26.058,
              y: 1.866,
              w: 26.67,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "wraps",
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
