import React from "react";
import * as AI from "abstract-image";
import { ExportTestDef } from "./_export-test-def.js";
import { Paragraph, AbstractDoc, Section, Image } from "../../../abstract-document-jsx/index.js";

const svgEncoded =
  '<?xml version ="1.0" encoding="utf-8"?>' +
  '<svg version ="1.1" id="missingImage" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'width="640" height="480" viewBox="0 0 640 480" preserveAspectRatio="xMinYMin meet" xml:space="preserve">' +
  '<svg><text x="0" y="30" fill="Red" font-size="24">' +
  '<tspan x="0" dy="1.5em"> Missing image:</tspan>' +
  "</text></svg>" +
  "</svg>";

const imageResource = {
  id: "svg",
  renderScale: 1.0,
  abstractImage: AI.createAbstractImage(
    {
      x: 0,
      y: 0,
    },
    {
      width: 200,
      height: 150,
    },
    AI.white,
    [
      AI.createBinaryImage({ x: 0, y: 0 }, { x: 640, y: 480 }, "svg", {
        type: "bytes",
        bytes: new TextEncoder().encode(svgEncoded),
      }),
    ]
  ),
};

export const testSingleImageSvgColorName: ExportTestDef = {
  name: "Single image svg color name",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <Image width={640} height={480} imageResource={imageResource} />
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
                T: "M",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 19.992,
            x: 1.084,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "i",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 5.328,
            x: 5.083,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "s",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 12,
            x: 6.148,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "s",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 12,
            x: 8.548,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "i",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 5.328,
            x: 10.948,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "n",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 13.344,
            x: 12.014,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "g",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 13.344,
            x: 14.683,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "i",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 5.328,
            x: 18.686,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "m",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 19.992,
            x: 19.752,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "a",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 13.344,
            x: 23.75,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "g",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 13.344,
            x: 26.419,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "e",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 13.344,
            x: 29.088,
            y: 12.45,
          },
          {
            A: "left",
            R: [
              {
                S: -1,
                T: "%3A",
                TS: [0, 27, 0, 0],
              },
            ],
            clr: 24,
            sw: 0.32553125,
            w: 6.672,
            x: 31.756,
            y: 12.45,
          },
        ],
        VLines: [],
      },
    ],
  },
};
