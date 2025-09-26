import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import * as AD from "../../../index.js";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../abstract-document-jsx/index.js";

export const testMultipleTextRunWithEndAlignment: ExportTestDef = {
  name: "Multiple textrun with Start alignment",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "End" })}>
          <TextRun text="This is a text" />
          <TextRun text="This is another text" style={AD.AbstractDoc.TextStyle.create({ color: "red" })} />
          <TextRun text="This is a third text" />
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
                T: "This%20is%20a%20text",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 56.13,
            x: 23.308,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "This%20is%20another%20text",
                TS: [0, 13, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 84.48,
            x: 26.797,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "This%20is%20a%20third%20text",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 78.36,
            x: 32.059,
            y: -0.301,
          },
        ],
        VLines: [],
      },
    ],
  },
};
