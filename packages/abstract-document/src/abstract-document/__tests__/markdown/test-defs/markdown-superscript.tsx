import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Markdown, render } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Markdown superscript",
  abstractDocJsx: <Markdown text="2^10^" />,
  expectedMarkdown: [
    {
      children: [
        {
          nestedStyleNames: [],
          styleName: undefined,
          text: "2",
          textProperties: {},
          type: "TextRun",
        },
        {
          nestedStyleNames: ["Superscript"],
          styleName: "Superscript",
          text: "10",
          textProperties: {},
          type: "TextRun",
        },
      ],
      numbering: undefined,
      style: {
        alignment: undefined,
        margins: { bottom: 0, left: 0, right: 0, top: 0 },
        textStyle: { type: "TextStyle" },
        type: "ParagraphStyle",
      },
      styleName: "",
      type: "Paragraph",
    },
  ],
};
