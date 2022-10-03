import React from "react";
import { ExportTestDef } from "../export-test-def";
import * as AD from "../../../../index";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Single textrun with Justify alignment",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Justify" })}>
          <TextRun text="This is a text" />
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
            w: 56.13,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "This%20is%20a%20text",
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
