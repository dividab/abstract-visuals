import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../abstract-document-jsx/index.js";

export const testLongTextRun: ExportTestDef = {
  name: "Long text run",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextRun text={"A_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run"} />
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
    Pages:
    [
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
            w: 594.75,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'A_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_r',
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ]
          },
          {
            x: -0.25,
            y: 0.42100000000000004,
            w: 593.65,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'un_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_te',
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ]
          },
          {
            x: -0.25,
            y: 1.144,
            w: 590.86,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'xt_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_lon',
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ]
          },
          {
            x: -0.25,
            y: 1.866,
            w: 591.42,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'g_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very',
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ]
          },
          {
            x: -0.25,
            y: 2.589,
            w: 591.43,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: '_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_',
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ]
          },
          {
            x: -0.25,
            y: 3.311,
            w: 593.64,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run',
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ]
          },
          {
            x: -0.25,
            y: 4.034,
            w: 508.6,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: '_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run',
                S: -1,
                TS: [
                  0,
                  13,
                  0,
                  0
                ]
              }
            ]
          }
        ]
      }
    ],
  },
};
