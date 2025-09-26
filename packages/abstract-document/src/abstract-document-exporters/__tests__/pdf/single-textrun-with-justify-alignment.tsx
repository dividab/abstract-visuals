import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import * as AD from "../../../index.js";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../abstract-document-jsx/index.js";

export const testSingleTextRunWithJustifyAlignment: ExportTestDef = {
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
        Width: 37.188,
        Height: 52.625,
        HLines: [],
        VLines: [],
        Fills: [],
        Texts: [
          {
            x: -0.25,
            y: -0.301,
            w: 18.89,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "This",
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
            x: 1.073,
            y: -0.301,
            w: 7.22,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "is",
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
            x: 1.698,
            y: -0.301,
            w: 5.56,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "a",
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
            x: 2.219,
            y: -0.301,
            w: 16.12,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "text",
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
