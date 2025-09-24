import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import { Markdown, render } from "../../../abstract-document-jsx/index.js";

export const testEmptyKeepTogether: ExportTestDef = {
  name: "Markdown empty keepTogether",
  abstractDocJsx: <Markdown text="test" keepTogetherSections={true} />,
  expectedMarkdown: {
    children: [
      {
        isMarkdown: true,
        children: [
          {
            nestedStyleNames: [],
            styleName: undefined,
            text: "test",
            textProperties: {},
            type: "TextRun",
          },
        ],
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
        styleName: "",
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
