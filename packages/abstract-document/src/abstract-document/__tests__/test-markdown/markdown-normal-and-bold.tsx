import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Markdown } from "../../../abstract-document-jsx/index.js";

export const testMarkdownNormalAndBold: ExportTestDef = {
  name: "Markdown bold",
  abstractDocJsx: <Markdown text="Normal and **Bold**" />,
  expectedMarkdown: {
    children: [
      {
        nestedStyleNames: [],
        styleName: undefined,
        text: "Normal and ",
        textProperties: {},
        type: "TextRun",
      },
      {
        nestedStyleNames: ["Strong"],
        styleName: "Strong",
        text: "Bold",
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
