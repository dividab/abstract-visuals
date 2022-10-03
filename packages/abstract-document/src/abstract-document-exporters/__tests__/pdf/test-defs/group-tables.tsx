/* eslint-disable max-lines */
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
  Group,
} from "../../../../abstract-document-jsx";

const rowsList = [
  <Table columnWidths={[100]} key={0}>
    <TableRow>
      <TableCell>
        <Paragraph>
          <TextRun text={"I am a table"} />
        </Paragraph>
      </TableCell>
    </TableRow>
  </Table>,
];

//eslint-disable-next-line
for (let i = 1; i < 10; i++) {
  rowsList.push(
    <Table columnWidths={[100, 100, 100]} key={i}>
      <TableRow>
        <TableCell>
          <Paragraph>
            <TextRun text={`Cell ${i}`} />
          </Paragraph>
        </TableCell>
      </TableRow>
    </Table>
  );
}
const group = rowsList;

export const test: ExportTestDef = {
  name: "Group Tables",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        {[
          group,
          group,
          group,
          group,
          group,
          group,
          <Group key={"test"} keepTogether={true}>
            {[group, group]}
          </Group>,
        ]}
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
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 52.25,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20table",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 0.42100000000000004,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 1.144,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 1.866,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 2.589,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%204",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 3.311,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%205",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 4.034,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%206",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 4.756,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%207",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 5.479,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%208",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 6.201,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%209",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 6.924,
            w: 52.25,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20table",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 7.646000000000001,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 8.369,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 9.091,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 9.814,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%204",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 10.536,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%205",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 11.259,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%206",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 11.981,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%207",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 12.704,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%208",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 13.426,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%209",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 14.149,
            w: 52.25,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20table",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 14.871,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 15.594000000000001,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 16.316,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 17.039,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%204",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 17.761,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%205",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 18.484,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%206",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 19.206,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%207",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 19.929,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%208",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 20.651,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%209",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 21.374,
            w: 52.25,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20table",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 22.096,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 22.819,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 23.541,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 24.264,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%204",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 24.986,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%205",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 25.709,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%206",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 26.431,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%207",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 27.154,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%208",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 27.876,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%209",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 28.599,
            w: 52.25,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20table",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 29.321,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 30.044,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 30.766,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 31.488999999999997,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%204",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 32.211,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%205",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 32.934,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%206",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 33.656,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%207",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 34.379,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%208",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 35.101,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%209",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 35.824,
            w: 52.25,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20table",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 36.546,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 37.269,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 37.991,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 38.714,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%204",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 39.436,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%205",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 40.159,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%206",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 40.881,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%207",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 41.604,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%208",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 42.326,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%209",
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
        Width: 37.188,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 52.25,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20table",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 0.42100000000000004,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 1.144,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 1.866,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 2.589,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%204",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 3.311,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%205",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 4.034,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%206",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 4.756,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%207",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 5.479,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%208",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 6.201,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%209",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 6.924,
            w: 52.25,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "I%20am%20a%20table",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 7.646000000000001,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%201",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 8.369,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%202",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 9.091,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%203",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 9.814,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%204",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 10.536,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%205",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 11.259,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%206",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 11.981,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%207",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 12.704,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%208",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: -0.25,
            y: 13.426,
            w: 25.56,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Cell%209",
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
  },
};
