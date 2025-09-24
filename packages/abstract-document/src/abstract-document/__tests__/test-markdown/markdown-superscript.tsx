import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Markdown, render } from "../../../abstract-document-jsx/index.js";

export const testMarkdownSuperscript: ExportTestDef = {
  name: "Markdown superscript",
  abstractDocJsx: <Markdown text="2^10^" />,
  expectedMarkdown: {
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
