import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, TextRun, Group } from "../../../../abstract-document-jsx";

const fillerString = "a b c d e f g h i j k l m n o p q r s t u v x y z å ä ö 1 2 3 4 5 6 7 8 9 0 ! # ¤ % & / ( ) = ?";

const group = (
  <Group>
    <Paragraph>
      <TextRun text={"Heading"} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
    <Paragraph>
      <TextRun text={fillerString} />
    </Paragraph>
  </Group>
);

export const test: ExportTestDef = {
  name: "Group Paratraphs",
  only: true,
  abstractDocJsx: (
    <AbstractDoc>
      <Section>{[group, group, group, group, group, group]}</Section>
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
