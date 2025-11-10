import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../abstract-document-jsx/index.js";

export const testNewLineShouldBreakLong: ExportTestDef = {
  name: "New line should linebreak long",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextRun
            text={
              "\nLorem ipsum dolor sit amet, consectetur\n adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Egestas congue quisque egestas diam in arcu cursus. A cras semper auctor neque \nvitae tempus quam pellentesque. In fermentum et sollicitudin\n ac orci. Scelerisque viverra mauris in aliquam. Nunc lobortis mattis aliquam faucibus."
            }
          />
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
    Pages: [
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
            oc: undefined,
            x: -0.25,
            y: 0.42100000000000004,
            w: 177.84,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "Lorem%20ipsum%20dolor%20sit%20amet%2C%20consectetur",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            oc: undefined,
            x: -0.25,
            y: 1.144,
            w: 574.17,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "adipiscing%20elit%2C%20sed%20do%20eiusmod%20tempor%20incididunt%20ut%20labore%20et%20dolore%20magna%20aliqua.%20Egestas%20congue%20quisque%20egestas%20diam%20in%20arcu%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            oc: undefined,
            x: -0.25,
            y: 1.866,
            w: 163.4,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "cursus.%20A%20cras%20semper%20auctor%20neque%20",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            oc: undefined,
            x: -0.25,
            y: 2.589,
            w: 268.45,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "vitae%20tempus%20quam%20pellentesque.%20In%20fermentum%20et%20sollicitudin",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
          {
            oc: undefined,
            x: -0.25,
            y: 3.311,
            w: 375.11,
            sw: 0.32553125,
            A: "left",
            R: [
              {
                T: "ac%20orci.%20Scelerisque%20viverra%20mauris%20in%20aliquam.%20Nunc%20lobortis%20mattis%20aliquam%20faucibus.",
                S: -1,
                TS: [0, 13, 0, 0],
              },
            ],
          },
        ],
      },
    ],
  },
};
