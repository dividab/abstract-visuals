import * as S from "stream";
import path from "path";
import PDFParser from "pdf2json";
import PdfKit from "pdfkit";
import { describe, test, expect } from "vitest";
import { saveBufferInTmpDir, streamToBuffer, diffJson } from "./test-utils/index.js";
import { exportToStream } from "../pdf/render.js";
import { render } from "../../abstract-document-jsx/index.js";
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
import { testNewLineShouldBreak } from "./pdf/new-line-should-line-break.js";
import { testNewLineShouldBreakLong } from "./pdf/new-line-should-line-break-long.js";

describe("export pdf", () => {
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
    testTableOfContentSeparator,
    testWorld,
  ].forEach((item) => {
    test(item.name, async () => {
      const abstractDoc = render(item.abstractDocJsx);
      const pdfStream = new S.PassThrough();
      exportToStream(PdfKit, pdfStream, abstractDoc);
      const pdfBuffer1 = await streamToBuffer(pdfStream);
      saveBufferInTmpDir(path.join(__dirname, "tmp"), item.name + ".pdf", pdfBuffer1);
      // Need to copy to new buffer to workaround this issue:
      // https://github.com/modesty/pdf2json/issues/163
      let pdfBuffer2 = Buffer.alloc(pdfBuffer1.length);
      pdfBuffer1.copy(pdfBuffer2);
      const parsed = await getJsonFromPdf(pdfBuffer2);
      // console.log("parsed", JSON.stringify(parsed));
      // console.log(diffJson(item.expectedPdfJson, parsed));
      // expect(parsed).toEqual(item.expectedPdfJson);

      const result = diffJson(item.expectedPdfJson, parsed);
      expect(result).toEqual("");
    });
  });
});

function getJsonFromPdf(pdfBuffer: Buffer): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let pdfParser = new PDFParser();
    pdfParser.on("pdfParser_dataError", (errData: { parserError: string }) => {
      reject(errData);
    });
    pdfParser.on("pdfParser_dataReady", (pdfData: unknown) => {
      resolve(pdfData);
    });
    pdfParser.parseBuffer(pdfBuffer);
  });
}
