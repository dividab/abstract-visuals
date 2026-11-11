import fs from "fs";
import path from "path";
// oxlint-disable-next-line import/no-named-as-default -- standard pdfkit import idiom
import PDFDocument from "pdfkit";
import { describe, test, expect } from "vitest";
import { AbstractDoc, Section, render } from "../../abstract-document-jsx/index.js";
import * as AD from "../../abstract-document/index.js";
import { registerFonts } from "../pdf/font.js";

// Source Code Pro (SIL OFL, see fonts/LICENSE.txt), one file for every style
const sourceCodePro = new Uint8Array(fs.readFileSync(path.join(__dirname, "fonts", "SourceCodePro-Regular.otf")));
const fonts = {
  SourceCodePro: AD.Font.create({ normal: sourceCodePro, bold: sourceCodePro, italic: sourceCodePro, boldItalic: sourceCodePro }),
};

describe("pdf font cache", () => {
  test("styles sharing a file read it once per name", () => {
    const pdf = new PDFDocument();
    registerFonts(
      pdf,
      render(
        <AbstractDoc fonts={fonts}>
          <Section />
        </AbstractDoc>
      )
    );
    // pdfkit counts the font files it reads
    const fontCount = (): number => (pdf as unknown as { readonly _fontCount: number })._fontCount;
    pdf.font("SourceCodePro").font("SourceCodePro-Bold").font("SourceCodePro-Light");
    const read = fontCount();
    pdf.font("SourceCodePro-Bold").font("SourceCodePro").font("SourceCodePro-Light").font("SourceCodePro-Bold");
    expect(fontCount()).toBe(read);
  });
});
