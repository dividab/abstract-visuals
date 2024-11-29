import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import * as AD from "../../../index.js";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../abstract-document-jsx/index.js";

export const testSingleTextRunWithEndAlignmentThatLinebreaks: ExportTestDef = {
  name: "Single textrun with End alignment that linebreaks",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph style={AD.AbstractDoc.ParagraphStyle.create({ alignment: "End" })}>
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
                T: "This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 589.1,
            x: 0.7609999999999999,
            y: -0.301,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "This%20is%20a%20text%20This%20is%20a%20text%20This%20is%20a%20text%20%20",
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: 179.51,
            x: 26.184,
            y: 0.42100000000000004,
          },
        ],
        VLines: [],
      },
    ],
  },
};
