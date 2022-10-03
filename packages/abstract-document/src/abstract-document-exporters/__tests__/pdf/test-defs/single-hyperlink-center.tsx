import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, HyperLink } from "../../../../abstract-document-jsx";
import { ParagraphStyle } from "../../../../abstract-document";

export const test: ExportTestDef = {
  name: "Single hyperlink centered",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph style={ParagraphStyle.create({ alignment: "Center" })}>
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
        Height: 52.625,
        Width: 37.188,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: 17.632,
            y: -0.301,
            w: 22.78,
            sw: 0.32553125,
            clr: 35,
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
    ],
  },
};
