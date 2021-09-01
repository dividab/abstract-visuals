import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, HyperLink } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Single hyperlink",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph>
          <HyperLink text={"Hello"} target="https://divid.se" />
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
          ],
          HLines: [],
          Height: 52.625,
          Texts: [
            {
              A: "left",
              R: [
                {
                  S: -1,
                  T: "Hello",
                  TS: [0, 13, 0, 0],
                },
              ],
              clr: 35,
              sw: 0.32553125,
              w: 22.78,
              x: -0.25,
              y: -0.301,
            },
          ],
          VLines: [],
        },
      ],
      Transcoder: "pdf2json@1.2.3 [https://github.com/modesty/pdf2json]",
      Width: 37.188,
    },
  },
};
