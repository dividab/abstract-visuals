import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Markdown } from "../../../abstract-document-jsx/index.js";

export const testMarkdownBoldItalic: ExportTestDef = {
  name: "Markdown bold italic",
  abstractDocJsx: <Markdown text="***Italic and Bold***" />,
  expectedMarkdown: {
    children: [
      {
        nestedStyleNames: ["Strong", "Emphasis"],
        styleName: "Emphasis",
        text: "Italic and Bold",
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
};
