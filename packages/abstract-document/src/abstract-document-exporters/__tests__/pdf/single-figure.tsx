import React from "react";
import * as AI from "abstract-image";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, Image } from "../../../abstract-document-jsx/index.js";
import { Font, ImageResource } from "../../../abstract-document/index.js";

const components = [
  AI.createLine(AI.createPoint(10, 15), AI.createPoint(30, 15), AI.yellow, 3),
  AI.createText(
    AI.createPoint(10, 10),
    "Bold",
    "DaxlineOffcPro",
    12,
    AI.black,
    "bold",
    0,
    "center",
    "right",
    "down",
    2,
    AI.red,
    false
  ),
  AI.createText(
    AI.createPoint(10, 20),
    "Medium bold",
    "DaxlineOffcPro",
    12,
    AI.black,
    "mediumBold",
    0,
    "center",
    "right",
    "down",
    2,
    AI.red,
    false
  ),
  AI.createText(
    AI.createPoint(10, 30),
    "normal",
    "DaxlineOffcPro",
    12,
    AI.black,
    "normal",
    0,
    "center",
    "right",
    "down",
    2,
    AI.red,
    false
  ),
  AI.createText(
    AI.createPoint(10, 40),
    "normal",
    "DaxlineOffcPro",
    12,
    AI.black,
    "normal",
    0,
    "center",
    "right",
    "down",
    2,
    AI.red,
    false
  ),
  AI.createText(
    AI.createPoint(10, 50),
    "italic",
    "DaxlineOffcPro",
    12,
    AI.black,
    "normal",
    0,
    "center",
    "right",
    "down",
    2,
    AI.red,
    true
  ),
  AI.createText(
    AI.createPoint(10, 60),
    "bold italic",
    "DaxlineOffcPro",
    12,
    AI.black,
    "bold",
    0,
    "center",
    "right",
    "down",
    2,
    AI.red,
    true
  ),
  AI.createText(
    AI.createPoint(10, 70),
    "medium bold italic",
    "DaxlineOffcPro",
    12,
    AI.black,
    "mediumBold",
    0,
    "center",
    "right",
    "down",
    2,
    AI.red,
    true
  ),
  AI.createPolyLine(
    [
      AI.createPoint(30, 30),
      AI.createPoint(100, 30),
      AI.createPoint(100, 100),
      AI.createPoint(30, 100),
      AI.createPoint(30, 30),
    ],
    AI.black,
    2
  ),
];

const fonts = {
  DaxlineOffcPro: Font.create({
    normal: "Helvetica",
    bold: "Helvetica",
    italic: "Helvetica",
    boldItalic: "Helvetica",
  }),
};
const imageResource = ImageResource.create({
  id: "0",
  abstractImage: AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(200, 200), AI.white, components),
});

export const testSingleFigure: ExportTestDef = {
  name: "Single figure",
  abstractDocJsx: (
    <AbstractDoc fonts={fonts}>
      <Section>
        <Paragraph>
          <Image width={200} height={200} imageResource={imageResource} />
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
        HLines: [
          {
            oc: "#ffff00",
            x: 0.625,
            y: 0.938,
            w: 4.5,
            l: 1.25,
          },
          {
            oc: "#000000",
            x: 1.875,
            y: 1.875,
            w: 3,
            l: 4.375,
          },
          {
            oc: "#000000",
            x: 1.875,
            y: 6.25,
            w: 3,
            l: 4.375,
          },
        ],
        VLines: [
          {
            oc: "#000000",
            x: 6.25,
            y: 1.875,
            w: 3,
            l: 4.375,
          },
          {
            oc: "#000000",
            x: 1.875,
            y: 1.875,
            w: 3,
            l: 4.375,
          },
        ],
        Fills: [],
        Texts: [
          {
            x: 0.375,
            y: 0.41300000000000003,
            w: 24.012,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Bold",
                S: -1,
                TS: [0, 15, 0, 0],
              },
            ],
          },
          {
            x: 0.375,
            y: 1.038,
            w: 68.688,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "Medium%20bold",
                S: -1,
                TS: [0, 15, 0, 0],
              },
            ],
          },
          {
            x: 0.375,
            y: 1.6629999999999998,
            w: 36.672,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "normal",
                S: -1,
                TS: [0, 15, 0, 0],
              },
            ],
          },
          {
            x: 0.375,
            y: 2.288,
            w: 36.672,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "normal",
                S: -1,
                TS: [0, 15, 0, 0],
              },
            ],
          },
          {
            x: 0.375,
            y: 2.913,
            w: 24,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "italic",
                S: -1,
                TS: [0, 15, 0, 0],
              },
            ],
          },
          {
            x: 0.375,
            y: 3.5380000000000003,
            w: 50.016,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "bold%20italic",
                S: -1,
                TS: [0, 15, 0, 0],
              },
            ],
          },
          {
            x: 0.375,
            y: 4.163,
            w: 96.024,
            sw: 0.32553125,
            oc: undefined,
            A: "left",
            R: [
              {
                T: "medium%20bold%20italic",
                S: -1,
                TS: [0, 15, 0, 0],
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
