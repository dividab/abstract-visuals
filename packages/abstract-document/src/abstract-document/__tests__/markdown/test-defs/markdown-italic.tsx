import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Markdown } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Markdown italic",
  abstractDocJsx: <Markdown text="*Italic*" />,
  expectedMarkdown: [
    {
      children: [
        {
          nestedStyleNames: ["Emphasis"],
          styleName: "Emphasis",
          text: "Italic",
          textProperties: {},
          type: "TextRun",
        },
      ],
      numbering: undefined,
      style: {
        alignment: undefined,
        margins: { bottom: 0, left: 0, right: 0, top: 0 },
        position: "relative",
        textStyle: { type: "TextStyle" },
        type: "ParagraphStyle",
      },
      styleName: "",
      type: "Paragraph",
    },
  ],
};
