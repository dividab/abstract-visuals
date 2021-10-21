import React from "react";
import { ExportTestDef } from "../export-test-def";
import * as AI from "../../../../../../abstract-image";
import { Paragraph, AbstractDoc, Section, Image } from "../../../../abstract-document-jsx";

const svgEncoded =
  '<?xml version ="1.0" encoding="utf-8"?>' +
  '<svg version ="1.1" id="missingImage" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'width="640" height="480" viewBox="0 0 640 480" preserveAspectRatio="xMinYMin meet" xml:space="preserve">' +
  "<defs>" +
  '<linearGradient id="GradientRed" x1="0" x2="0" y1="0" y2="1">' +
  '<stop offset="5%" stop-color="darkred"/>' +
  '<stop offset="95%" stop-color="red"/>' +
  "</linearGradient>" +
  "</defs>" +
  '<svg> <rect x="0" y="0" width="20" height="20" fill="url(#GradientRed)"/></svg>' +
  '<svg> <rect x="30" y="30" width="20" height="20" fill="Burlywood"/></svg>' +
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
    [AI.createBinaryImage({ x: 0, y: 0 }, { x: 640, y: 480 }, "svg", new TextEncoder().encode(svgEncoded))]
  ),
};

export const test: ExportTestDef = {
  name: "Single image svg color url",
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
    formImage: {
      Agency: "",
      Id: {
        AgencyId: "",
        MC: false,
        Max: 1,
        Name: "",
        Parent: "",
      },
      Pages: [
        {
          Boxsets: [],
          Fields: [],
          Fills: [
            {
              clr: 1,
              h: 0,
              w: 0,
              x: 0,
              y: 0,
            },
            {
              clr: -1,
              h: 4,
              oc: "[object Object]",
              w: 4,
              x: 0,
              y: 0,
            },
            {
              clr: -1,
              h: 4,
              oc: "#deb887",
              w: 4,
              x: 6,
              y: 6,
            },
          ],
          HLines: [],
          Height: 52.625,
          Texts: [],
          VLines: [],
        },
      ],
      Transcoder: "pdf2json@1.2.3 [https://github.com/modesty/pdf2json]",
      Width: 37.188,
    },
  },
};
