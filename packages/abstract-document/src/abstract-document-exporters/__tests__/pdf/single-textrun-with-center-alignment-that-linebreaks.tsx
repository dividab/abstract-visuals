import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import * as AD from "../../../index.js";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../abstract-document-jsx/index.js";

export const testSingleTextRunWithAlignmentThatLinebreaks: ExportTestDef = {
  name: "Single textrun with Center alignment that linebreaks",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "Center" })}>
          <TextRun text="This is a text This is a text This is a text This is a text This is a text This is a text This is a text This is a text This is a text This is a text This is a text This is a text This is a text  " />
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
        Width: 37.188,
        Height: 52.625,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: 0.16899999999999998,
            y: -0.301,
            w: 589.1,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          },
          {
            x: 12.793,
            y: 0.42100000000000004,
            w: 179.51,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20%20",
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ],
            oc: undefined
          }
        ],
        Fields: [],
        Boxsets: []
      }
    ],
  },
};
