import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../../abstract-document-jsx";
import * as AD from "../../../../index";

export const test: ExportTestDef = {
  name: "hello with roman font",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextRun
            text="Hello This is Times-Roman font"
            style={AD.AbstractDoc.TextStyle.create({ fontFamily: "Times-Roman" })}
          />
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
            y: -0.323,
            w: 130,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [{ T: "Hello%20This%20is%20Times-Roman%20font", S: -1, TS: [0, 13, 0, 0] }],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
    ],
  },
};
