import { describe, test, expect } from "vitest";
import { ExportTestDef } from "./test-markdown/_export-test-def.js";
import { render } from "../../abstract-document-jsx/index.js";
import { testMarkdownBoldItalic } from "./test-markdown/markdown-bold-italic.js";
import { testMarkdownBold } from "./test-markdown/markdown-bold.js";
import { testMarkdownItalic } from "./test-markdown/markdown-italic.js";
import { testEmptyKeepTogether } from "./test-markdown/markdown-empty-keepTogether.js";
import { testMarkdownHeader } from "./test-markdown/markdown-header.js";
import { testMarkdownKeepTogether } from "./test-markdown/markdown-keepTogether.js";
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
  ].forEach((item) => {
    test(item.name, async () => {
      const abstractDoc = render(item.abstractDocJsx);
      expect(abstractDoc).toEqual(item.expectedMarkdown);
    });
  });
});
