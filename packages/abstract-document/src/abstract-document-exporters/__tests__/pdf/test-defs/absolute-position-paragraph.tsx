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
    formImage: {
      Transcoder: "pdf2json@1.2.3 [https://github.com/modesty/pdf2json]",
      Agency: "",
      Id: { AgencyId: "", Name: "", MC: false, Max: 1, Parent: "" },
      Pages: [
        {
          Height: 52.625,
          HLines: [],
          VLines: [],
          Fills: [{ x: 0, y: 0, w: 0, h: 0, clr: 1 }],
          Texts: [
            {
              x: 12.25,
              y: 5.949,
              w: 187.31,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [{ T: "Hello!%20I%20am%20absolutely%20absolute%20positioned.", S: -1, TS: [0, 13, 0, 0] }],
            },
          ],
          Fields: [],
          Boxsets: [],
        },
      ],
      Width: 37.188,
    },
  },
};
