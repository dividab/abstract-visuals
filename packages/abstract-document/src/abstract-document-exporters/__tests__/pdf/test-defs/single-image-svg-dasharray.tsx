import React from "react";
import * as AI from "abstract-image";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, Image } from "../../../../abstract-document-jsx";

const svgEncoded =
  '<?xml version ="1.0" encoding="utf-8"?>' +
  '<svg version ="1.1" id="missingImage" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'width="640" height="480" viewBox="0 0 640 480" preserveAspectRatio="xMinYMin meet" xml:space="preserve">' +
  "<svg>" +
  '<line x1="62.61" y1="51.68" x2="62.61" y2="148.08" fill="none" stroke="#000" stroke-dasharray="0 0 0 0 0 0 2.03 2.03 2.03 2.03 2.03 2.03" stroke-linecap="round" stroke-miterlimit="10" stroke-width=".5"/>' +
  '<tspan x="0" dy="1.5em"> Missing image:</tspan>' +
  "</svg>" +
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

export const test: ExportTestDef = {
  name: "Single image svg dasharray",
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
        Height: 52.625,
        Width: 37.188,
        HLines: [],
        VLines: [
          {
            oc: "#000000",
            dsh: 1,
            x: 12.522,
            y: 10.336,
            w: 2.4,
            l: 19.28,
          },
        ],
        Fills: [],
        Texts: [],
        Fields: [],
        Boxsets: [],
      },
    ],
  },
};
