import React from "react";
import { ExportTestDef } from "../export-test-def";
import * as AD from "../../../../index";
import { Paragraph, AbstractDoc, Section, TextRun, TextField, Group, render } from "../../../../abstract-document-jsx";

const footerMargin = AD.AbstractDoc.LayoutFoundation.create({
  bottom: 30,
});

const pageStyle = AD.AbstractDoc.PageStyle.create({
  footerMargins: footerMargin,
});

const header = [
  render(
    <Group>
      <Paragraph>
        <TextRun text="I am a header" />
      </Paragraph>
      <Paragraph
        style={AD.AbstractDoc.ParagraphStyle.create({
          position: "absolute",
          margins: AD.AbstractDoc.LayoutFoundation.create({ right: 20 }),
          alignment: "End",
        })}
      >
        <TextField fieldType="PageNumber" />
        <TextRun text="/" />
        <TextField fieldType="TotalPages" />
      </Paragraph>
    </Group>
  ),
];

const footer = [
  render(
    <Group>
      <Paragraph>
        <TextRun text="I am a footer" />
      </Paragraph>
      <Paragraph
        style={AD.AbstractDoc.ParagraphStyle.create({
          position: "absolute",
          margins: AD.AbstractDoc.LayoutFoundation.create({ top: 20, left: 20 }),
        })}
      >
        <TextRun text="I am a footer" />
      </Paragraph>
    </Group>
  ),
];

const page = AD.AbstractDoc.MasterPage.create({ style: pageStyle, header: header, footer: footer });

export const test: ExportTestDef = {
  name: "Absolute position header and footer",
  abstractDocJsx: (
    <AbstractDoc>
      <Section page={page}>
        <Paragraph>
          <TextRun text={"I am body"} />
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
              w: 61.7,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "I%20am%20a%20header",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 33.569,
              y: -0.301,
              w: 5.56,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "1",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 33.916,
              y: -0.301,
              w: 2.78,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "%2F",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 34.09,
              y: -0.301,
              w: 5.56,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "1",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: -0.25,
              y: 49.726,
              w: 56.14,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "I%20am%20a%20footer",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: 1,
              y: 50.976,
              w: 56.14,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "I%20am%20a%20footer",
                  S: -1,
                  TS: [0, 13, 0, 0],
                },
              ],
            },
            {
              x: -0.25,
              y: 1.144,
              w: 43.91,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [
                {
                  T: "I%20am%20body",
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
