import React from "react";
import { ExportTestDef } from "../export-test-def";
import * as TextStyle from "../../../../abstract-document/styles/text-style";
import { Paragraph, AbstractDoc, Section, TextRun } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Single textrun baseline middle",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <TextRun style={TextStyle.create({ baseline: "middle" })} text={"Hello"} />
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
              x: -0.25,
              y: -0.59,
              w: 22.78,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [{ T: "Hello", S: -1, TS: [0, 13, 0, 0] }],
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
