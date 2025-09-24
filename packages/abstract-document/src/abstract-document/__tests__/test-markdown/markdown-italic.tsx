import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Markdown } from "../../../abstract-document-jsx/index.js";

export const testMarkdownItalic: ExportTestDef = {
  name: "Markdown italic",
  abstractDocJsx: <Markdown text="*Italic*" />,
  expectedMarkdown: {
    children: [
      {
        nestedStyleNames: ["Emphasis"],
        styleName: "Emphasis",
        text: "Italic",
        textProperties: {},
        type: "TextRun",
      },
    ],
    isMarkdown: true,
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
};
