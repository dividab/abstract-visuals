import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, TextRun, TextField } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Page numbering",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextField fieldType="PageNumber" />
          <TextRun text=" / " />
          <TextField fieldType="TotalPages" />
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
                T: "1",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 5.56,
            x: -0.25,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "%20%2F%20",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 8.34,
            x: 0.09699999999999998,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "1",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 5.56,
            x: 0.619,
            y: -0.301,
          },
        ],
        VLines: [],
      },
    ],
  },
};
