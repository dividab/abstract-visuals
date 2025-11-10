import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, TextRun, LineBreak } from "../../../abstract-document-jsx/index.js";

export const testNewLineShouldBreak: ExportTestDef = {
  name: "New line should linebreak",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextRun text={"Hello\nworld"} />
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
        Fields: [],
        Boxsets: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
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
            y: 0.42100000000000004,
            w: 23.89,
            oc: undefined,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "world",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
      },
    ],
  },
};
