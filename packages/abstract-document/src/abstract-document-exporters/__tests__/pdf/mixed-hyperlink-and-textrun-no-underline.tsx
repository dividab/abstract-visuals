import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, HyperLink, TextRun } from "../../../abstract-document-jsx/index.js";
import { TextStyle } from "../../../abstract-document/index.js";

export const testMixedHyperLinkAndTextRunNoUnderline: ExportTestDef = {
  name: "Mixed hyperlink and textrun no underline",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <HyperLink text={"Hello"} target="https://divid.se" />
          <TextRun text={"Hello there"} />
          <HyperLink style={TextStyle.create({ underline: false })} text={"Hello again"} target="https://divid.se" />
          <TextRun text={"Hello there again"} />
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
                T: "Hello",
                TS: [0, 13, 0, 0],
              },
            ],
            clr: 35,
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
                T: "Hello%20there",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 48.35,
            x: 1.174,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "Hello%20again",
                TS: [0, 13, 0, 0],
              },
            ],
            clr: 35,
            sw: 0.32553125,
            w: 50.02,
            x: 4.196,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "Hello%20there%20again",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 75.59,
            x: 7.322,
            y: -0.301,
          },
        ],
        VLines: [],
      },
    ],
  },
};
