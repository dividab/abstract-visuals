import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Markdown } from "../../../abstract-document-jsx/index.js";

export const testMarkdownSubscript: ExportTestDef = {
  name: "Markdown subscript",
  abstractDocJsx: <Markdown text="H~2~O" />,
  expectedMarkdown: {
    children: [
      {
        nestedStyleNames: [],
        styleName: undefined,
        text: "H",
        textProperties: {},
        type: "TextRun",
      },
      {
        nestedStyleNames: ["Subscript"],
        styleName: "Subscript",
        text: "2",
        textProperties: {},
        type: "TextRun",
      },
      {
        nestedStyleNames: [],
        styleName: undefined,
        text: "O",
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
