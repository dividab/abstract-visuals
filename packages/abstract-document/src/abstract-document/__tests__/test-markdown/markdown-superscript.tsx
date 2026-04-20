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
