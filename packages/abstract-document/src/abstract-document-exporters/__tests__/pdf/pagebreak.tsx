import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, TextRun, PageBreak } from "../../../abstract-document-jsx/index.js";

export const testPagebreak: ExportTestDef = {
  name: "hello",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextRun text={"Hello"} />
        </Paragraph>
        <PageBreak />
        <Paragraph>
          <TextRun text={"World"} />
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
        Height: 52.625,
        Width: 37.188,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 22.78,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello",
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
            w: 26.11,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "World",
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
