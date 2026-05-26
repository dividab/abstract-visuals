import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../abstract-document-jsx/index.js";

export const testLongTextRunWithSeparateAtEnd: ExportTestDef = {
  name: "Long text run with separate at end",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextRun text={"Separate_Token A_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run"} />
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
            w: 591.98,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'Separate_Token%20A_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a',
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
            y: 1.144,
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
            y: 1.866,
            w: 591.42,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 't_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long',
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
            w: 593.64,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: '_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_l',
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
            w: 594.21,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'ong_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_ve',
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
            w: 583.08,
            sw: 0.32553125,
            A: 'left',
            R: [
              {
                T: 'ry_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run_a_very_long_text_run',
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
