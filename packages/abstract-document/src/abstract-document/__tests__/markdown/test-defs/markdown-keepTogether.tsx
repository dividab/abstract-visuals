import React from "react";
import { ExportTestDef } from "../export-test-def";
import { Markdown, render } from "../../../../abstract-document-jsx";

export const test: ExportTestDef = {
  name: "Markdown keepTogether",
  abstractDocJsx: <Markdown text="### Test 2^10^ " keepTogetherSections={true} />,
  expectedMarkdown: [
    {
      children: [
        {
          children: [
            {
              nestedStyleNames: ["H3"],
              styleName: "H3",
              text: "Test 2",
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
          numbering: undefined,
          style: {
            alignment: undefined,
            margins: {
              bottom: 0,
              left: 0,
              right: 0,
              top: 0,
            },
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
      type: "Group",
    },
  ],
};
