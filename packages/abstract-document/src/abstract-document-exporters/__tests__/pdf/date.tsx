import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import * as AD from "../../../index.js";
import { Paragraph, AbstractDoc, Section, TextField } from "../../../abstract-document-jsx/index.js";

export const testDate: ExportTestDef = {
  name: "Single date",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextField fieldType="Date" />
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
                T: encodeURIComponent(new Date(Date.now()).toDateString()),
                TS: [0, 13, 0, 0],
              },
            ],
            oc: undefined,
            sw: 0.32553125,
            w: "*",
            x: -0.25,
            y: -0.301,
          },
        ],
        VLines: [],
      },
    ],
  },
};
