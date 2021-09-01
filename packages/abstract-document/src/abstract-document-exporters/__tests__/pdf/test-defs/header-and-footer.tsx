import React from "react";
import { ExportTestDef } from "../export-test-def";
import * as AD from "../../../../index";
import { Paragraph, AbstractDoc, Section, TextRun, TextField, render } from "../../../../abstract-document-jsx";

const header = [
  render(
    <Paragraph>
      <TextRun text="I am a header" />
      <TextField fieldType="PageNumber" />
      <TextRun text="/" />
      <TextField fieldType="TotalPages" />
    </Paragraph>
  ),
];

const footer = [
  render(
    <Paragraph>
      <TextRun text="I am a footer" />
    </Paragraph>
  ),
];

const page = AD.AbstractDoc.MasterPage.create({ header: header, footer: footer });

export const test: ExportTestDef = {
  name: "Header and footer",
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
                  T: "I%20am%20a%20header",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 61.7,
              x: -0.25,
              y: -0.301,
            },
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "1",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 5.56,
              x: 3.606,
              y: -0.301,
            },
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "%2F",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 2.78,
              x: 3.9539999999999997,
              y: -0.301,
            },
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "1",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 5.56,
              x: 4.128,
              y: -0.301,
            },
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "I%20am%20a%20footer",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 56.14,
              x: -0.25,
              y: 51.601,
            },
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "I%20am%20body",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 0,
              sw: 0.32553125,
              w: 43.91,
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
