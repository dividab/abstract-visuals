import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, HyperLink, TocSeparator } from "../../../abstract-document-jsx/index.js";

export const testTableOfContentSeparator: ExportTestDef = {
  name: "Table of content separator",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <HyperLink text={"Hello"} target="#" />
          <TocSeparator />
        </Paragraph>
      </Section>
    </AbstractDoc>
  ),
  expectedPdfJson: {
    Meta: {
      PDFFormatVersion: "1.3",
      Creator: "PDFKit",
      Producer: "PDFKit",
      IsAcroFormPresent: false,
      IsXFAPresent: false,
      Metadata: {},
      CreationDate: "*",
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
                T: ".........................................................................",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 567.94,
            x: 1.691,
            y: -0.301,
          },
        ],
        VLines: [],
      },
    ],
    Transcoder: "pdf2json@2.0.1 [https://github.com/modesty/pdf2json]",
  },
};
