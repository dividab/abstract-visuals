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
  <Table columnWidths={[100, 100, 100]}>
    <TableRow>
      <TableCell>
        <Paragraph>
          <TextRun text="" />
        </Paragraph>
      </TableCell>
      <TableCell>
        <Paragraph>
          <TextRun text="A grouped table" />
        </Paragraph>
      </TableCell>
      <TableCell>
        <Paragraph>
          <TextRun text="" />
        </Paragraph>
      </TableCell>
    </TableRow>
  </Table>,
];

//eslint-disable-next-line
for (let i = 0; i < 10; i++) {
  rowsList.push(
    <Table columnWidths={[100, 100, 100]}>
      <TableRow>
        <TableCell>
          <Paragraph>
            <TextRun text="Left" />
          </Paragraph>
        </TableCell>
        <TableCell>
          <Paragraph>
            <TextRun text="Center" />
          </Paragraph>
        </TableCell>
        <TableCell>
          <Paragraph>
            <TextRun text="Right" />
          </Paragraph>
        </TableCell>
      </TableRow>
    </Table>
  );
}
const group =
  //<Group>
  rowsList;
// </Group>
const group2 = (
  //<Group>
  <Table columnWidths={[100, 100, 100]}>{rowsList}</Table>
  // </Group>
);

export const test: ExportTestDef = {
  name: "Group Tables",
  only: true,
  abstractDocJsx: (
    <AbstractDoc>
      <Section>{[group, group, group, group, group, <Group>{[group, group]}</Group>, group, group]}</Section>
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
                  T: "Hello",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 22.78,
              x: -0.25,
              y: -0.301,
            },
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "Hello2",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 28.34,
              x: -0.25,
              y: 0.42100000000000004,
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
