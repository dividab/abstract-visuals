import React from "react";
import * as AD from "../../../../index";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, TextRun, Group } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Absolute position group",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Group
          style={AD.AbstractDoc.GroupStyle.create({
            position: "absolute",
            margins: AD.AbstractDoc.LayoutFoundation.create({ top: 100, left: 200 }),
          })}
        >
          <Paragraph>
            <TextRun text={"Hello! I am absolutely absolute positioned."} />
          </Paragraph>
          <Paragraph>
            <TextRun text={"I am too, because I belong in the same group."} />
          </Paragraph>
        </Group>
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
            x: 12.25,
            y: 5.949,
            w: 187.31,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Hello!%20I%20am%20absolutely%20absolute%20positioned.",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            x: 12.25,
            y: 6.671,
            w: 203.45,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "I%20am%20too%2C%20because%20I%20belong%20in%20the%20same%20group.",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
        Fields: [],
        Boxsets: [],
      },
    ],
  },
};
