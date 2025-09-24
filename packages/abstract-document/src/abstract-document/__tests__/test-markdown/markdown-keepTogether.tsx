import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Markdown, render } from "../../../abstract-document-jsx/index.js";

export const testMarkdownKeepTogether: ExportTestDef = {
  name: "Markdown keepTogether",
  abstractDocJsx: <Markdown text="### Test 2^10^ " keepTogetherSections={true} />,
  expectedMarkdown: {
    children: [
      {
        children: [
          {
            nestedStyleNames: ["H3"],
            styleName: "H3",
            text: "Test",
            textProperties: {},
            type: "TextRun",
          },
          {
            nestedStyleNames: ["H3"],
            styleName: "H3",
            text: " ",
            textProperties: {},
            type: "TextRun",
          },
          {
            nestedStyleNames: ["H3"],
            styleName: "H3",
            text: "2",
            textProperties: {},
            type: "TextRun",
          },
          {
            nestedStyleNames: ["H3", "Superscript"],
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
          margins: {
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
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
    ],
    keepTogether: true,
    style: {
      margins: {
        bottom: 0,
        left: 0,
        right: 0,
        top: 0,
      },
      position: "relative",
      type: "GroupStyle",
    },
    type: "Group",
  },
};
