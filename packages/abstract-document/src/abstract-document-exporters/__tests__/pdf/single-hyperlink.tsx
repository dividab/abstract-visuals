import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, HyperLink } from "../../../abstract-document-jsx/index.js";

export const testSingleHyperlink: ExportTestDef = {
  name: "Single hyperlink",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <HyperLink text={"Hello"} target="https://divid.se" />
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
        ],
        VLines: [],
      },
    ],
  },
};
