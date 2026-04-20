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
      margins: { bottom: undefined, left: undefined, right: undefined, top: undefined },
      position: "relative",
      textStyle: { type: "TextStyle" },
      type: "ParagraphStyle",
    },
    styleName: "",
    type: "Paragraph",
  },
};
