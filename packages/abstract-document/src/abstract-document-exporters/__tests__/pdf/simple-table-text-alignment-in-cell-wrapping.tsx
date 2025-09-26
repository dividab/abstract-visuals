import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import {
  Paragraph,
  AbstractDoc,
  Section,
  Table,
  TableRow,
  TableCell,
  TextRun,
} from "../../../abstract-document-jsx/index.js";
import * as TableStyle from "../../../abstract-document/styles/table-style.js";
import * as TableCellStyle from "../../../abstract-document/styles/table-cell-style.js";
import { ParagraphStyle } from "../../../abstract-document/index.js";

const borders = { left: 2, bottom: 2, right: 2, top: 2 };

export const testSimpleTableTextAlignmentInCellWrapping: ExportTestDef = {
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
              <Paragraph style={ParagraphStyle.create({ alignment: "Start" })} >
                <TextRun text="Left placed text that wraps" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph style={ParagraphStyle.create({ alignment: "Center" })} >
                <TextRun text="Center placed text that wraps" />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph style={ParagraphStyle.create({ alignment: "Justify" })} >
                <TextRun
                  text="Justify text to fill cell that wraps and fills two ligns"
                />
              </Paragraph>
            </TableCell>
            <TableCell>
              <Paragraph style={ParagraphStyle.create({ alignment: "End" })} >
                <TextRun text="Right placed text that wraps" />
              </Paragraph>
            </TableCell>
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
        Width: 37.188,
        Height: 52.625,
        HLines: [
          {
            x: 9.219,
            y: 2.846,
            w: 3,
            l: 3.125,
            oc: "#000000"
          },
          {
            x: 9.2,
            y: 0.044,
            w: 3,
            l: 3.163,
            oc: "#000000"
          },
          {
            x: 12.344,
            y: 2.846,
            w: 3,
            l: 6.25,
            oc: "#000000"
          },
          {
            x: 12.281,
            y: 0.044,
            w: 3,
            l: 6.331,
            oc: "#000000"
          },
          {
            x: 18.594,
            y: 2.846,
            w: 3,
            l: 6.25,
            oc: "#000000"
          },
          {
            x: 18.531,
            y: 0.044,
            w: 3,
            l: 6.331,
            oc: "#000000"
          },
          {
            x: 24.844,
            y: 2.846,
            w: 3,
            l: 3.125,
            oc: "#000000"
          },
          {
            x: 24.781,
            y: 0.044,
            w: 3,
            l: 3.206,
            oc: "#000000"
          }
        ],
        VLines: [
          {
            x: 12.344,
            y: 0,
            w: 3,
            l: 2.909,
            oc: "#000000"
          },
          {
            x: 9.262,
            y: 0,
            w: 3,
            l: 2.909,
            oc: "#000000"
          },
          {
            x: 18.594,
            y: 0,
            w: 3,
            l: 2.909,
            oc: "#000000"
          },
          {
            x: 12.344,
            y: 0,
            w: 3,
            l: 2.909,
            oc: "#000000"
          },
          {
            x: 24.844,
            y: 0,
            w: 3,
            l: 2.909,
            oc: "#000000"
          },
          {
            x: 18.594,
            y: 0,
            w: 3,
            l: 2.909,
            oc: "#000000"
          },
          {
            x: 27.925,
            y: 0,
            w: 3,
            l: 2.909,
            oc: "#000000"
          },
          {
            x: 24.844,
            y: 0,
            w: 3,
            l: 2.909,
            oc: "#000000"
          }
        ],
        Fills: [],
        Texts: [
          {
            x: 8.969,
            y: -0.301,
            w: 19.46,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "Left%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 8.969,
            y: 0.42100000000000004,
            w: 32.24,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "placed%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 8.969,
            y: 1.144,
            w: 38.36,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "text%20that%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 8.969,
            y: 1.866,
            w: 26.67,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "wraps",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 12.605,
            y: 0.42100000000000004,
            w: 83.93,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "Center%20placed%20text%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 13.78,
            y: 1.144,
            w: 46.13,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "that%20wraps",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 18.344,
            y: 0.06000000000000005,
            w: 28.34,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "Justify",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 20.466,
            y: 0.06000000000000005,
            w: 16.12,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "text",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 21.818,
            y: 0.06000000000000005,
            w: 8.34,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "to",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 22.703,
            y: 0.06000000000000005,
            w: 9.44,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "fill",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 23.656,
            y: 0.06000000000000005,
            w: 15,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "cell",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 18.344,
            y: 0.782,
            w: 16.68,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "that",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 19.92,
            y: 0.782,
            w: 26.67,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "wraps",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 22.115,
            y: 0.782,
            w: 16.68,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "and",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 23.691,
            y: 0.782,
            w: 14.44,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "fills",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 18.344,
            y: 1.505,
            w: 15.56,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "two",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 19.484,
            y: 1.505,
            w: 20.56,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "ligns",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 26.26,
            y: -0.301,
            w: 23.34,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "Right",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 25.878,
            y: 0.42100000000000004,
            w: 29.46,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "placed",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 25.514,
            y: 1.144,
            w: 35.58,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "text%20that",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 26.058,
            y: 1.866,
            w: 26.67,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "wraps",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          }
        ],
        Fields: [],
        Boxsets: []
      }
    ],
  },
};
