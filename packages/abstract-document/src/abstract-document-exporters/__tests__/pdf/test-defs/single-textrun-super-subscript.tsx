import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../../abstract-document-jsx";
import { TextStyle } from "../../../../abstract-document";

export const test: ExportTestDef = {
  name: "Single textrun with super and subscripts",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextRun text={"Hello"} style={TextStyle.create({ verticalPosition: 0.2 })} />
          <TextRun text={"World"} style={TextStyle.create({ superScript: true })} />
          <TextRun text={"I am subscript"} style={TextStyle.create({ subScript: true })} />
        </Paragraph>
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
          HLines: [],
          VLines: [],
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
              w: 22.78,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "Hello",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 1.174,
              y: 0.20499999999999996,
              w: 26.11,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "World",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 2.796,
              y: -0.518,
              w: 62.24,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "I%20am%20subscript",
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
