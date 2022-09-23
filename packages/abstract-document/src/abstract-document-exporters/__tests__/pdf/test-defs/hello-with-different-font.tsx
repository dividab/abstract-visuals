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
              y: -0.323,
              w: 130,
              sw: 0.32553125,
              clr: 0,
              A: "left",
              R: [{ T: "Hello%20This%20is%20Times-Roman%20font", S: -1, TS: [0, 13, 0, 0] }],
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
