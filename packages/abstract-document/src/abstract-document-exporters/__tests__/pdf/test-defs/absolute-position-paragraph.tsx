import React from "react";
import * as AD from "../../../../index";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Absolute position paragraph",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph
          style={AD.AbstractDoc.ParagraphStyle.create({
            position: "absolute",
            margins: AD.AbstractDoc.LayoutFoundation.create({ top: 100, left: 200 }),
          })}
        >
          <TextRun text={"Hello! I am absolutely absolute positioned."} />
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
            x: 12.25,
            y: 5.949,
            w: 187.31,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [{ T: "Hello!%20I%20am%20absolutely%20absolute%20positioned.", S: -1, TS: [0, 13, 0, 0] }],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
    ],
  },
};
