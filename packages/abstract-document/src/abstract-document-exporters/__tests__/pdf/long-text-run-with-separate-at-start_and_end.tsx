import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../abstract-document-jsx/index.js";

export const testLongTextRunWithSeparateAtStartAndEnd: ExportTestDef = {
  name: "Long text run with separate at start and end",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextRun text={"Separate_Token_Start A_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run Separate_Token_End"} />
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
            w: 593.09,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'Separate_Token_Start%20A_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_',
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
            w: 591.42,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_t',
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
            y: 1.053,
            w: 590.86,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'ext_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_lo',
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
            y: 1.686,
            w: 591.98,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'ng_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_ver',
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
            y: 2.318,
            w: 590.87,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'y_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a',
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
            y: 2.95,
            w: 593.64,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: '_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_ru',
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
            y: 3.582,
            w: 593.09,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'n_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_tex',
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
            y: 4.214,
            w: 122.85,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 't_run%20Separate_Token_End',
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
