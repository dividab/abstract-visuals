import React from "react";
import { ExportTestDef } from "../export-test-def";
import * as AD from "../../../../index";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Multiple textrun with Start alignment that linebreaks",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Start" })}>
          <TextRun text="This is a text This is a text This is a text This is a text This is a text" />
          <TextRun
            text="This is another text This is another text This is another text This is another text"
            style={AD.AbstractDoc.TextStyle.create({ color: "red" })}
          />
          <TextRun text="This is a third text This is a third text This is a third text This is a third text" />
        </Paragraph>
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
        Boxsets: [],
        Fields: [],
        Fills: [],
        HLines: [],
        Height: 52.625,
        Width: 37.188,
        Texts: [
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 291.77,
            x: -0.25,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "This%20is%20another%20text%20This%20is%20another%20text%20This%20is%20another%20text%20This%20is%20",
                TS: [0, 13, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 293.45,
            x: 17.892,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "another%20text",
                TS: [0, 13, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 52.81,
            x: -0.25,
            y: 0.42100000000000004,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "This%20is%20a%20third%20text%20This%20is%20a%20third%20text%20This%20is%20a%20third%20text%20This%20is%20a%20third%20text",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 321.78,
            x: 3.032,
            y: 0.42100000000000004,
          },
        ],
        VLines: [],
      },
    ],
  },
};
