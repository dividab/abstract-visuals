import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Markdown, render } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Markdown empty keepTogether",
  abstractDocJsx: <Markdown text="test" keepTogetherSections={true} />,
  expectedMarkdown: [
    {
      children: [
        {
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
  ],
};
