import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Paragraph, AbstractDoc, Section, HyperLink } from "../../../../abstract-document-jsx";
import { ParagraphStyle } from "../../../../abstract-document";

export const test: ExportTestDef = {
  name: "Single hyperlink right aligned",
  abstractDocJsx: (
    <AbstractDoc>
      <Section>
        <Paragraph style={ParagraphStyle.create({ alignment: "End" })}>
          <HyperLink text={"Hello"} target="https://divid.se" />
        </Paragraph>
      </Section>
    </AbstractDoc>
  ),
  expectedPdfJson: {
    formImage: {
      Transcoder: "pdf2json@1.2.3 [https://github.com/modesty/pdf2json]",
      Agency: "",
      Id: {
        AgencyId: "",
        Name: "",
        MC: false,
        Max: 1,
        Parent: "",
      },
      Pages: [
        {
          Height: 52.625,
          HLines: [],
          VLines: [],
          Fills: [
            {
              x: 0,
              y: 0,
              w: 0,
              h: 0,
              clr: 1,
            },
          ],
          Texts: [
            {
              x: 35.514,
              y: -0.301,
              w: 22.78,
              sw: 0.32553125,
              clr: 35,
              A: "left",
              R: [
                {
                  T: "Hello",
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
      Width: 37.188,
    },
  },
};
