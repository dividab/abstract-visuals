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
    numbering: undefined,
    style: {
      alignment: undefined,
      margins: { bottom: undefined, left: undefined, right: undefined, top: undefined },
      position: "relative",
      textStyle: { type: "TextStyle" },
      type: "ParagraphStyle",
    },
    styleName: "",
    type: "Paragraph",
  },
};
