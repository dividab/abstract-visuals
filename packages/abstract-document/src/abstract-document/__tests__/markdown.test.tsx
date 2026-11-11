import { describe, test, expect } from "vitest";
import { Markdown, render } from "../../abstract-document-jsx/index.js";
import type * as AD from "../index.js";
import { testMarkdownBoldItalic } from "./test-markdown/markdown-bold-italic.js";
import { testMarkdownBold } from "./test-markdown/markdown-bold.js";
import { testEmptyKeepTogether } from "./test-markdown/markdown-empty-keepTogether.js";
import { testMarkdownHeader } from "./test-markdown/markdown-header.js";
import { testMarkdownItalic } from "./test-markdown/markdown-italic.js";
import { testMarkdownKeepTogether } from "./test-markdown/markdown-keepTogether.js";
import { testMarkdownNormalAndBold } from "./test-markdown/markdown-normal-and-bold.js";
import { testMarkdownSubscript } from "./test-markdown/markdown-subscript.js";
import { testMarkdownSuperscript } from "./test-markdown/markdown-superscript.js";

describe("markdown", () => {
  [
    testMarkdownBoldItalic,
    testMarkdownBold,
    testEmptyKeepTogether,
    testMarkdownHeader,
    testMarkdownItalic,
    testMarkdownKeepTogether,
    testMarkdownSubscript,
    testMarkdownSuperscript,
    testMarkdownNormalAndBold,
  ].forEach((item) => {
    test(item.name, async () => {
      const abstractDoc = render(item.abstractDocJsx);
      expect(abstractDoc.children[0]).toEqual(item.expectedMarkdown);
    });
  });

  test("nodes without children, e.g. html, inline code and a thematic break, are left out", () => {
    const markdown = render(<Markdown text={"Before<br>`code` after\n\n---\n\n![image](image.png)\n\nLast"} />);
    const paragraphs = markdown.children as ReadonlyArray<AD.Paragraph.Paragraph>;
    const texts = paragraphs.map((p) =>
      p.children
        .map((atom) => (atom.type === "TextRun" ? atom.text : ""))
        .join("")
        .trim()
    );
    expect(texts).toEqual(["Before after", "", "Last"]);
  });
});
