import path from "path";
import * as S from "stream";
import PDFParser from "pdf2json";
import { describe, test, expect } from "vitest";
import { AbstractDoc, PageBreak, Paragraph, Section, Table, TableCell, TableRow, TextRun, render } from "../../abstract-document-jsx/index.js";
import * as AD from "../../abstract-document/index.js";
import { exportToBytes, exportToStream } from "../pdf/render.js";
import { testAbsolutePositionGroup } from "./pdf/absolute-position-group.js";
import { testAbsolutePositionHeaderAndFooter } from "./pdf/absolute-position-header-and-footer.js";
import { testAbsolutePositionParagraph } from "./pdf/absolute-position-paragraph.js";
import { testAbsolutePositionSectionInGroup } from "./pdf/absolute-position-section-in-group.js";
import { testAbsolutePositionSectionInTable } from "./pdf/absolute-position-section-in-table.js";
import { testAbsolutePositionTable } from "./pdf/absolute-position-table.js";
import { testDate } from "./pdf/date.js";
import { testGroupNoKeepTogether } from "./pdf/group-no-keep-together.js";
import { testGroupParagraphs } from "./pdf/group-paragraphs.js";
import { testGroupTables } from "./pdf/group-tables.js";
import { testGroupTooBigForOnePage } from "./pdf/group-too-big-for-one-page.js";
import { testHeaderAndFooter } from "./pdf/header-and-footer.js";
import { testHelloWithDifferentFont } from "./pdf/hello-with-different-font.js";
import { testHello } from "./pdf/hello.js";
import { testHyperLinkInternalLinkTarget } from "./pdf/hyperlink-intenal-link-target.js";
import { testHyperLinkInternal } from "./pdf/hyperlink-internal.js";
import { testLongTextRunWithSeparateAtEnd } from "./pdf/long-text-run-with-separate-at-end.js";
import { testLongTextRunWithSeparateAtStart } from "./pdf/long-text-run-with-separate-at-start.js";
import { testLongTextRunWithSeparateAtStartAndEnd } from "./pdf/long-text-run-with-separate-at-start_and_end.js";
import { testLongTextRun } from "./pdf/long-text-run.js";
import { testManualLineBreakEmptyLines } from "./pdf/manual-line-break-empty-lines.js";
import { testManualLineBreak } from "./pdf/manual-line-break.js";
import { testMarginsHeaderBodyFooter } from "./pdf/margins-header-body-footer.js";
import { testMixedHyperLinkAndTextRunNoUnderline } from "./pdf/mixed-hyperlink-and-textrun-no-underline.js";
import { testMixedHyperLinkAndTextRunWithUnderline } from "./pdf/mixed-hyperlink-and-textrun-with-underline.js";
import { testMixedHyperLinkAndTextRun } from "./pdf/mixed-hyperlink-and-textrun.js";
import { testMixedTextRunAndImages } from "./pdf/mixed-textrun-and-images.js";
import { testMultipleImagesAndOverflow } from "./pdf/multiple-images-overflow.js";
import { testMultipleImages } from "./pdf/multiple-images.js";
import { testMultipleTextRunWithCenterAlignment } from "./pdf/multiple-textrun-with-center-alignment.js";
import { testMultipleTextRunWithEndAlignment } from "./pdf/multiple-textrun-with-end-alignment.js";
import { testMultipleTextRunWithStartAlignmentThatLineBreaks } from "./pdf/multiple-textrun-with-start-alignment-that-linebreaks.js";
import { textMultipleTextRunWithStartAlignment } from "./pdf/multiple-textrun-with-start-alignment.js";
import { testNewLineShouldBreakLong } from "./pdf/new-line-should-line-break-long.js";
import { testNewLineShouldBreak } from "./pdf/new-line-should-line-break.js";
import { testPageBreakTableRowThatDoesntFitPage } from "./pdf/page-break-table-row-that-doesnt-fit-page.js";
import { testPageBreakTableSingleRow } from "./pdf/page-break-table-single-row.js";
import { testPageBreakTableWithGroup } from "./pdf/page-break-table-with-group.js";
import { testPageBreakTableWithHeader } from "./pdf/page-break-table-with-header.js";
import { testPageBreakTableWithHeader2 } from "./pdf/page-break-table-with-header2.js";
import { testPageBreakTableWithMarginBottom } from "./pdf/page-break-table-with-margin-bottom.js";
import { testPageBreakTableWIthMarginTopSingleTable } from "./pdf/page-break-table-with-margin-top-single-table.js";
import { testPageBreakTableWithMarginTop } from "./pdf/page-break-table-with-margin-top.js";
import { testPageBreakTableWithRowSpanMutliPages } from "./pdf/page-break-table-with-rowSpan-multipages.js";
import { testPageBreakTableWithRowSpan } from "./pdf/page-break-table-with-rowSpan.js";
import { testPageColumnLayout } from "./pdf/page-column-layout.js";
import { testPageNumbering } from "./pdf/page-numbering.js";
import { testPagebreak } from "./pdf/pagebreak.js";
import { testSimpleTableAllAutoCellWidths } from "./pdf/simple-table-all-auto-cell-widths.js";
import { testSimpleTableAllFixedCellWidths } from "./pdf/simple-table-all-fixed-cell-widths.js";
import { testSimpleTableBackground } from "./pdf/simple-table-background.js";
import { testSimpleTableCellPaddingImage } from "./pdf/simple-table-cell-padding-image.js";
import { testSimpleTableCellPaddingText } from "./pdf/simple-table-cell-padding-text.js";
import { testSimpleTableCenterAlignment } from "./pdf/simple-table-center-alignment.js";
import { testSimpleTableColSpanAndRowSpan } from "./pdf/simple-table-colSpan-and-rowSpan.js";
import { testSimpleTableMinimalRowHeight } from "./pdf/simple-table-minimal-row-height.js";
import { testSimpleTableMixAutoFixCellWidths } from "./pdf/simple-table-mix-auto-fix-cell-widths.js";
import { testSimpleTablePadding } from "./pdf/simple-table-padding.js";
import { testSimpleTableRightAlignment } from "./pdf/simple-table-right-alignment.js";
import { testSimpleTableRowAlignment } from "./pdf/simple-table-row-alignment.js";
import { testSimpleTableTextAlignmentInCellWrapping } from "./pdf/simple-table-text-alignment-in-cell-wrapping.js";
import { testSimpleTableTextAlignmentInCell } from "./pdf/simple-table-text-alignment-in-cell.js";
import { testSimpleTableWithDefaultColoredBorders } from "./pdf/simple-table-with-default-colored-borders.js";
import { testSimpleTableWithHeader } from "./pdf/simple-table-with-header.js";
import { testSimpleTableWIthMultiColoredBorders } from "./pdf/simple-table-with-multi-colored-borders.js";
import { testSimpleTableWithSingleColoredBorders } from "./pdf/simple-table-with-single-colored-borders.js";
import { testSingleFigure } from "./pdf/single-figure.js";
import { testSingleHyperLinkCenter } from "./pdf/single-hyperlink-center.js";
import { testSingleHyperLinkNoUnderline } from "./pdf/single-hyperlink-no-underline.js";
import { testSingleHyperlinkRightAligned } from "./pdf/single-hyperlink-right-aligned.js";
import { testSingleHyperlinkWithUnderline } from "./pdf/single-hyperlink-with-underline.js";
import { testSingleHyperlink } from "./pdf/single-hyperlink.js";
import { testSingleImageSvgColorHex } from "./pdf/single-image-svg-color-hex.js";
import { testSingleImageSvgColorName } from "./pdf/single-image-svg-color-name.js";
import { testSingleImageSvgColorUrl } from "./pdf/single-image-svg-color-url.js";
import { testSingleImageSvgDashArray } from "./pdf/single-image-svg-dasharray.js";
import { testSingleImageurl } from "./pdf/single-image-url.js";
import { testSingleImage } from "./pdf/single-image.js";
import { testSingleTextRunBaseLineAlphabetic } from "./pdf/single-textrun-baseline-alphabetic.js";
import { testSingleTextRunBaseLineBottom } from "./pdf/single-textrun-baseline-bottom.js";
import { testSingleTextRunBaseLineHanging } from "./pdf/single-textrun-baseline-hanging.js";
import { testSingleTextRunBaseLineMiddle } from "./pdf/single-textrun-baseline-middle.js";
import { testSingleTextRunBaseLineTop } from "./pdf/single-textrun-baseline-top.js";
import { testSingleTextRunSuperScript } from "./pdf/single-textrun-super-subscript.js";
import { testSingleTextRunTransformLowercase } from "./pdf/single-textrun-transform-lowercase.js";
import { testSingleTextRunTransformUppercase } from "./pdf/single-textrun-transform-uppercase.js";
import { testSingleTextRunWithAlignmentThatLinebreaks } from "./pdf/single-textrun-with-center-alignment-that-linebreaks.js";
import { testSingleTextRunWithCenterAlignment } from "./pdf/single-textrun-with-center-alignment.js";
import { testSingleTextRunWithEndAlignmentThatLinebreaks } from "./pdf/single-textrun-with-end-alignment-that-linebreaks.js";
import { testSingleTextRunWithEndAlignment } from "./pdf/single-textrun-with-end-alignment.js";
import { testSingleTextRunWithJustifyAlignment } from "./pdf/single-textrun-with-justify-alignment.js";
import { testSingleTextRunWithStartAlignmentThatLinebreaks } from "./pdf/single-textrun-with-start-alignment-that-linebreaks.js";
import { testSingleTextRunWithStartAlignment } from "./pdf/single-textrun-with-start-alignment.js";
import { testSingleTextRun } from "./pdf/single-textrun.js";
import { testTableOfContentSeparator } from "./pdf/table-of-content-separator.js";
import { testWorld } from "./pdf/world.js";
import { saveBufferInTmpDir, streamToBuffer, diffJson } from "./test-utils/index.js";

describe("export pdf", () => {
  test("an empty fontFamily falls back to Helvetica", async () => {
    const document = render(
      <AbstractDoc>
        <Section>
          <Paragraph>
            <TextRun text="Bold" style={AD.TextStyle.create({ fontFamily: "", bold: true })} />
            <TextRun text="Normal" style={AD.TextStyle.create({ fontFamily: "" })} />
          </Paragraph>
        </Section>
      </AbstractDoc>
    );
    await expect(exportToBytes(document)).resolves.toBeInstanceOf(Uint8Array);
  });

  test("row spans beyond the table render like spans clipped to the remaining rows", async () => {
    const outputs: Array<unknown> = [];
    for (const rowSpan of [2, 5]) {
      const document = render(
        <AbstractDoc>
          <Section>
            <Table columnWidths={[100, 100]}>
              <TableRow>
                <TableCell rowSpan={rowSpan}>
                  <Paragraph>
                    <TextRun text="Spanning cell" />
                  </Paragraph>
                </TableCell>
                <TableCell>
                  <Paragraph>
                    <TextRun text="First row" />
                  </Paragraph>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <Paragraph>
                    <TextRun text="Last row" />
                  </Paragraph>
                </TableCell>
              </TableRow>
            </Table>
          </Section>
        </AbstractDoc>
      );
      const stream = new S.PassThrough();
      exportToStream(stream, document);
      const buffer = await streamToBuffer(stream);
      // pdf2json requires an unpooled buffer, as in the fixture tests below.
      const parserBuffer = Buffer.alloc(buffer.length);
      buffer.copy(parserBuffer);
      outputs.push(neutralizeVolatileMeta(await getJsonFromPdf(parserBuffer)));
    }
    expect(diffJson(outputs[0], outputs[1])).toBe("");
  });

  test("header and footer are laid out and placed within their own margins when they differ from the content margins", async () => {
    const pageStyle = AD.PageStyle.create({
      contentMargins: { top: 100, bottom: 100, left: 100, right: 100 },
      headerMargins: { top: 20, bottom: 0, left: 20, right: 20 },
      footerMargins: { top: 0, bottom: 20, left: 40, right: 60 },
    });
    const page = AD.MasterPage.create({
      style: pageStyle,
      header: [render(text("header-end", "End")), render(text("header-center", "Center"))],
      footer: [
        render(
          <Table columnWidths={[Infinity, 100, Infinity]}>
            <TableRow>
              <TableCell>{text("footer-start")}</TableCell>
              <TableCell>{text("footer-center", "Center")}</TableCell>
              <TableCell>{text("footer-end", "End")}</TableCell>
            </TableRow>
          </Table>
        ),
      ],
    });
    const body = [text("body-start"), text("body-center", "Center"), text("body-end", "End")];
    const document = render(
      <AbstractDoc>
        <Section page={page}>
          {body}
          <PageBreak />
          {body}
        </Section>
      </AbstractDoc>
    );
    const bytes = await exportToBytes(document);
    // pdf2json requires an unpooled buffer, as in the fixture tests below.
    const buffer = Buffer.alloc(bytes.length);
    buffer.set(bytes);
    const parsed = (await getJsonFromPdf(buffer)) as {
      readonly Pages: ReadonlyArray<{
        readonly Width: number;
        readonly Texts: ReadonlyArray<{ readonly x: number; readonly w: number; readonly R: ReadonlyArray<{ readonly T: string }> }>;
      }>;
    };
    expect(parsed.Pages).toHaveLength(2);

    const pointsPerUnit = AD.PageStyle.getWidth(pageStyle) / parsed.Pages[0]!.Width;
    for (const p of parsed.Pages) {
      // pdf2json offsets x by a constant, so compare against the body text whose edges are known
      const edges = (t: string): { readonly start: number; readonly center: number; readonly end: number } => {
        const item = p.Texts.find((i) => decodeURIComponent(i.R[0]!.T) === t);
        if (!item) {
          throw new Error(`Missing text ${t}`);
        }
        const start = item.x * pointsPerUnit;
        return { start, center: start + item.w / 2, end: start + item.w };
      };
      const bodyStart = edges("body-start").start; // content left = 100
      const bodyCenter = edges("body-center").center; // page center
      const bodyEnd = edges("body-end").end; // page width - content right 100

      // Header margins 20/20: right edge 80 to the right of the content, same center as the content
      expect(edges("header-end").end - bodyEnd).toBeCloseTo(80, 0);
      expect(edges("header-center").center - bodyCenter).toBeCloseTo(0, 0);
      // Footer margins 40/60: the Infinity columns fill the width between them
      expect(edges("footer-start").start - bodyStart).toBeCloseTo(-60, 0);
      expect(edges("footer-center").center - bodyCenter).toBeCloseTo(-10, 0);
      expect(edges("footer-end").end - bodyEnd).toBeCloseTo(40, 0);
    }
  });

  // "64559050/64559051" is about 94 pt wide in 10 pt Helvetica, wider than the 60 pt cell
  const longWord = "64559050/64559051";

  test("a word wider than the row is split between its characters by default", async () => {
    const rows = await wordBreakRows(undefined);
    expect(rows.join(" ").replaceAll(" ", "")).toBe(`short${longWord}word`);
    expect(rows).not.toContain(longWord);
    // The long word continues on the rows after "short", in pieces that fit the cell
    const pieces = rows.filter((r) => r !== "short" && r !== "word");
    expect(pieces.length).toBeGreaterThan(1);
  });

  test("a word wider than the row overflows it, unsplit, when wordBreak is Whitespace", async () => {
    expect(await wordBreakRows("Whitespace")).toEqual(["short", longWord, "word"]);
  });

  test("a paragraph gets wordBreak from its named style", async () => {
    expect(await wordBreakRows(undefined, "Whitespace")).toEqual(["short", longWord, "word"]);
  });

  async function wordBreakRows(
    wordBreak: AD.ParagraphStyle.WordBreak | undefined,
    namedStyleWordBreak?: AD.ParagraphStyle.WordBreak
  ): Promise<ReadonlyArray<string>> {
    const styles = namedStyleWordBreak
      ? {
          [AD.StyleKey.create("ParagraphStyle", "Cell")]: AD.ParagraphStyle.create({ wordBreak: namedStyleWordBreak }),
        }
      : undefined;
    const document = render(
      <AbstractDoc styles={styles}>
        <Section>
          <Table columnWidths={[60, Infinity]}>
            <TableRow>
              <TableCell>
                <Paragraph styleName={namedStyleWordBreak ? "Cell" : undefined} style={AD.ParagraphStyle.create({ wordBreak })}>
                  <TextRun text={`short ${longWord} word`} />
                </Paragraph>
              </TableCell>
              <TableCell>
                <Paragraph>
                  <TextRun text="next" />
                </Paragraph>
              </TableCell>
            </TableRow>
          </Table>
        </Section>
      </AbstractDoc>
    );
    const bytes = await exportToBytes(document);
    // pdf2json requires an unpooled buffer, as in the fixture tests below.
    const buffer = Buffer.alloc(bytes.length);
    buffer.set(bytes);
    const parsed = (await getJsonFromPdf(buffer)) as {
      readonly Pages: ReadonlyArray<{
        readonly Texts: ReadonlyArray<{ readonly x: number; readonly y: number; readonly R: ReadonlyArray<{ readonly T: string }> }>;
      }>;
    };
    // The cell's text joined per row, top to bottom, without the other cell
    const texts = parsed.Pages[0]!.Texts.map((t) => ({ y: t.y, x: t.x, text: decodeURIComponent(t.R[0]!.T) })).filter((t) => t.text !== "next");
    const ys = [...new Set(texts.map((t) => t.y))].sort((a, b) => a - b);
    return ys.map((y) =>
      texts
        .filter((t) => t.y === y)
        .sort((a, b) => a.x - b.x)
        .map((t) => t.text)
        .join("")
        .trim()
    );
  }

  [
    testAbsolutePositionGroup,
    testAbsolutePositionHeaderAndFooter,
    testAbsolutePositionParagraph,
    testAbsolutePositionSectionInGroup,
    testAbsolutePositionSectionInTable,
    testAbsolutePositionTable,
    testDate,
    testGroupNoKeepTogether,
    testGroupParagraphs,
    testGroupTables,
    testGroupTooBigForOnePage,
    testHeaderAndFooter,
    testHelloWithDifferentFont,
    testHello,
    testHyperLinkInternalLinkTarget,
    testHyperLinkInternal,
    testManualLineBreakEmptyLines,
    testManualLineBreak,
    testMarginsHeaderBodyFooter,
    testMixedHyperLinkAndTextRunNoUnderline,
    testMixedHyperLinkAndTextRunWithUnderline,
    testMixedHyperLinkAndTextRun,
    testMixedTextRunAndImages,
    testMultipleImagesAndOverflow,
    testMultipleImages,
    testMultipleTextRunWithCenterAlignment,
    testMultipleTextRunWithEndAlignment,
    testMultipleTextRunWithStartAlignmentThatLineBreaks,
    textMultipleTextRunWithStartAlignment,
    testNewLineShouldBreak,
    testNewLineShouldBreakLong,
    testPageBreakTableRowThatDoesntFitPage,
    testPageBreakTableSingleRow,
    testPageBreakTableWithGroup,
    testPageBreakTableWithHeader,
    testPageBreakTableWithHeader2,
    testPageBreakTableWithMarginBottom,
    testPageBreakTableWIthMarginTopSingleTable,
    testPageBreakTableWithMarginTop,
    testPageBreakTableWithRowSpanMutliPages,
    testPageBreakTableWithRowSpan,
    testPageNumbering,
    testPagebreak,
    testSimpleTableAllAutoCellWidths,
    testSimpleTableAllFixedCellWidths,
    testSimpleTableBackground,
    testSimpleTableCellPaddingImage,
    testSimpleTableCellPaddingText,
    testSimpleTableCenterAlignment,
    testSimpleTableColSpanAndRowSpan,
    testSimpleTableMinimalRowHeight,
    testSimpleTableMixAutoFixCellWidths,
    testSimpleTablePadding,
    testSimpleTableRightAlignment,
    testSimpleTableRowAlignment,
    testSimpleTableTextAlignmentInCellWrapping,
    testSimpleTableTextAlignmentInCell,
    testSimpleTableWithDefaultColoredBorders,
    testSimpleTableWithHeader,
    testSimpleTableWIthMultiColoredBorders,
    testSimpleTableWithSingleColoredBorders,
    testSingleFigure,
    testSingleHyperLinkCenter,
    testSingleHyperLinkNoUnderline,
    testSingleHyperlinkRightAligned,
    testSingleHyperlinkWithUnderline,
    testSingleHyperlink,
    testSingleImageSvgColorHex,
    testSingleImageSvgColorName,
    testSingleImageSvgColorUrl,
    testSingleImageSvgDashArray,
    testSingleImageurl,
    testSingleImage,
    testSingleTextRunBaseLineAlphabetic,
    testSingleTextRunBaseLineBottom,
    testSingleTextRunBaseLineHanging,
    testSingleTextRunBaseLineMiddle,
    testSingleTextRunBaseLineTop,
    testSingleTextRunSuperScript,
    testSingleTextRunWithAlignmentThatLinebreaks,
    testSingleTextRunWithCenterAlignment,
    testSingleTextRunWithEndAlignmentThatLinebreaks,
    testSingleTextRunWithEndAlignment,
    testSingleTextRunWithJustifyAlignment,
    testSingleTextRunWithStartAlignmentThatLinebreaks,
    testSingleTextRunWithStartAlignment,
    testSingleTextRun,
    testSingleTextRunTransformUppercase,
    testSingleTextRunTransformLowercase,
    testTableOfContentSeparator,
    testWorld,
    testPageColumnLayout,
    testLongTextRun,
    testLongTextRunWithSeparateAtStart,
    testLongTextRunWithSeparateAtEnd,
    testLongTextRunWithSeparateAtStartAndEnd,
  ]
    //.filter((i) => i === testPageColumnLayout)
    .forEach((item) => {
      test(item.name, async () => {
        const abstractDoc = render(item.abstractDocJsx);
        // console.log("----------");
        // console.log(JSON.stringify(abstractDoc));
        // console.log("----------");

        const pdfStream = new S.PassThrough();
        exportToStream(pdfStream, abstractDoc);
        const pdfBuffer1 = await streamToBuffer(pdfStream);
        saveBufferInTmpDir(path.join(__dirname, "tmp"), item.name + ".pdf", pdfBuffer1);
        // Need to copy to new buffer to workaround this issue:
        // https://github.com/modesty/pdf2json/issues/163
        const pdfBuffer2 = Buffer.alloc(pdfBuffer1.length);
        pdfBuffer1.copy(pdfBuffer2);
        const parsed = await getJsonFromPdf(pdfBuffer2);
        // console.log("----------");
        // console.log("parsed", JSON.stringify(parsed));
        // console.log("----------");
        // console.log(diffJson(item.expectedPdfJson, parsed));
        // expect(parsed).toEqual(item.expectedPdfJson);

        const result = diffJson(item.expectedPdfJson, parsed);
        expect(result).toEqual("");
      });
    });
});

function text(t: string, alignment?: AD.ParagraphStyle.TextAlignment): React.JSX.Element {
  return (
    <Paragraph style={AD.ParagraphStyle.create({ alignment })}>
      <TextRun text={t} />
    </Paragraph>
  );
}

// pdfkit stamps Info.CreationDate with the wall-clock time of export (pdfkit.js: `CreationDate: new Date()`),
// so two exports of otherwise-identical content can legitimately disagree by a second or more under load
// (observed in CI, not locally). Blank it out before an exact-JSON diff between two live exports.
function neutralizeVolatileMeta(parsed: unknown): unknown {
  const meta = (parsed as { Meta?: Record<string, unknown> }).Meta;
  if (meta) {
    for (const key of ["CreationDate", "ModDate"]) {
      if (key in meta) {
        meta[key] = "*";
      }
    }
  }
  return parsed;
}

function getJsonFromPdf(pdfBuffer: Buffer): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (errData: { parserError: string }) => {
      reject(errData);
    });
    pdfParser.on("pdfParser_dataReady", (pdfData: unknown) => {
      resolve(pdfData);
    });
    pdfParser.parseBuffer(pdfBuffer);
  });
}
