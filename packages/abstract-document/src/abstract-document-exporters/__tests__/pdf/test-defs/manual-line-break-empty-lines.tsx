import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, TextRun, LineBreak } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Manual line breaks empty lines",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <LineBreak />
          <TextRun text={"Hello"} />
          <LineBreak />
          <LineBreak />
        </Paragraph>
        <Paragraph>
          <TextRun text={"World"} />
        </Paragraph>
      </Section>
    </AbstractDoc>
  ),
  expectedPdfJson: {
    Transcoder: "pdf2json@2.0.1 [https://github.com/modesty/pdf2json]",
    Meta: {
      PDFFormatVersion: "1.3",
      IsAcroFormPresent: false,
      IsXFAPresent: false,
      Creator: "PDFKit",
      Producer: "PDFKit",
      CreationDate: "*",
      Metadata: {},
    },
    Pages: [
      {
        Width: 37.188,
        Height: 52.625,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: 0.42100000000000004,
            w: 22.78,
            oc: undefined,
            sw: 0.32553125,
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
            x: -0.25,
            y: 1.866,
            w: 26.11,
            oc: undefined,
            sw: 0.32553125,
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
