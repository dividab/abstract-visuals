import fs from "fs";
import path from "path";
// oxlint-disable-next-line import/no-named-as-default -- standard pdfkit import idiom
import PDFDocument from "pdfkit";
import { describe, test, expect, vi, afterEach } from "vitest";
import { AbstractDoc, Paragraph, Section, TextRun, render } from "../../abstract-document-jsx/index.js";
import * as AD from "../../abstract-document/index.js";
import { transformText } from "../pdf/font.js";
import { measure } from "../pdf/measure.js";
import { preProcess } from "../pdf/pre-process.js";
import { exportToBytes } from "../pdf/render.js";

// Source Code Pro (SIL OFL, see fonts/LICENSE.txt) has U+202F, U+2007 and U+2212 but not U+2009 or U+2011
const sourceCodePro = new Uint8Array(fs.readFileSync(path.join(__dirname, "fonts", "SourceCodePro-Regular.otf")));
const fonts = {
  SourceCodePro: AD.Font.create({ normal: sourceCodePro, bold: sourceCodePro, italic: sourceCodePro, boldItalic: sourceCodePro }),
};

function withFont(font: string | Uint8Array): PDFKit.PDFDocument {
  return new PDFDocument().font(font);
}

describe("pdf character fallback", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("built-in font replaces characters outside WinAnsi", () => {
    const pdf = withFont("Helvetica");
    expect(transformText(pdf, "1\u{202F}234,5", undefined)).toBe("1\u{00A0}234,5");
    expect(transformText(pdf, "\u{2212}12,5", undefined)).toBe("-12,5");
    expect(transformText(pdf, "a\u{2009}b\u{2007}c\u{2011}d", undefined)).toBe("a b\u{00A0}c-d");
  });

  test("built-in font keeps missing characters that have no fallback", () => {
    expect(transformText(withFont("Helvetica"), "\u{2603}", undefined)).toBe("\u{2603}");
  });

  test("embedded font keeps characters it has and replaces the ones it lacks", () => {
    const pdf = withFont(sourceCodePro);
    expect(transformText(pdf, "1\u{202F}234 \u{2212}5", undefined)).toBe("1\u{202F}234 \u{2212}5");
    expect(transformText(pdf, "a\u{2009}b\u{2011}c", undefined)).toBe("a b-c");
  });

  test("text transform is applied before the fallback", () => {
    expect(transformText(withFont("Helvetica"), "abc\u{2212}", "uppercase")).toBe("ABC-");
  });

  test("drawn text uses the fallback and its width matches the measured width", async () => {
    const drawn: Array<{ readonly text: string; readonly x: number; readonly width: number }> = [];
    const originalText = PDFDocument.prototype.text as (this: PDFKit.PDFDocument, ...args: ReadonlyArray<unknown>) => PDFKit.PDFDocument;
    vi.spyOn(PDFDocument.prototype, "text").mockImplementation(function (this: PDFKit.PDFDocument, ...args: ReadonlyArray<unknown>) {
      const [text, x] = args;
      if (typeof text === "string" && typeof x === "number") {
        drawn.push({ text, x, width: this.widthOfString(text) });
      }
      return originalText.call(this, ...args);
    });

    const pageWidth = AD.PageStyle.getWidth(AD.PageStyle.create());
    const doc = render(
      <AbstractDoc fonts={fonts}>
        <Section>
          {/* End alignment places the text by its measured width, so the drawn text must end exactly at the page edge */}
          <Paragraph style={AD.ParagraphStyle.create({ alignment: "End" })}>
            <TextRun text={"sum \u{2212}12\u{202F}345,5"} style={AD.TextStyle.create({ transform: "uppercase" })} />
          </Paragraph>
          <Paragraph style={AD.ParagraphStyle.create({ alignment: "End" })}>
            <TextRun text={"total \u{2212}12\u{202F}345,5\u{2009}kr"} style={AD.TextStyle.create({ fontFamily: "SourceCodePro" })} />
          </Paragraph>
        </Section>
      </AbstractDoc>
    );
    await exportToBytes(doc);

    const processed = preProcess(doc);
    const sizes = measure(PDFDocument, processed);
    // Pre-processing splits each text run into one atom per word
    const measuredWidths = processed.children[0]!.children.map((p) =>
      (p as AD.Paragraph.Paragraph).children.reduce((sum, atom) => sum + (sizes.get(atom)?.width ?? NaN), 0)
    );
    expect(drawn.map((d) => d.text)).toEqual(["SUM -12\u{00A0}345,5", "total \u{2212}12\u{202F}345,5 kr"]);
    for (const [i, { x, width }] of drawn.entries()) {
      expect(x + width).toBeCloseTo(pageWidth, 6);
      expect(measuredWidths[i]).toBeCloseTo(width, 6);
    }
  });
});
