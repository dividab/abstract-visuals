import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Markdown } from "../../../abstract-document-jsx/index.js";

export const testMarkdownHeader: ExportTestDef = {
  name: "Markdown heading 3",
  abstractDocJsx: <Markdown text="### Heading 3" />,
  expectedMarkdown: {
    children: [
      {
        nestedStyleNames: ["H3"],
        styleName: "H3",
        text: "Heading 3",
        textProperties: {},
        type: "TextRun",
      },
    ],
    numbering: undefined,
    style: {
      alignment: undefined,
      margins: {
        bottom: undefined,
        left: undefined,
        right: undefined,
        top: undefined,
      },
      position: "relative",
      textStyle: {
        type: "TextStyle",
      },
      type: "ParagraphStyle",
    },
    styleName: "H3",
    type: "Paragraph",
  },
};
