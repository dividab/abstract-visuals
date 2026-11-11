import path from "path";
import * as S from "stream";
import * as DiffJsXml from "diff-js-xml";
import jszip from "jszip";
import { describe, test, expect } from "vitest";
import { AbstractDoc, Paragraph, Section, Table, TableCell, TableRow, TextRun, render } from "../../abstract-document-jsx/index.js";
import * as AD from "../../abstract-document/index.js";
import { exportToStream } from "../docx2/render.js";
import { saveBufferInTmpDir, streamToBuffer } from "./test-utils/index.js";
import { testGroup } from "./tests-docx2/group.js";
import { testHeaderAndFooter } from "./tests-docx2/header-and-footer.js";
import { testHelloArialFont } from "./tests-docx2/hello-arial-font.js";
import { testHello } from "./tests-docx2/hello.js";
import { testLetterDimensions } from "./tests-docx2/letter-dimensions.js";
import { testMixedHyperLinkAndTextRun } from "./tests-docx2/mixed-hyperlink-and-textrun.js";
import { testMixedTextRunAndImages } from "./tests-docx2/mixed-textrun-and-images.js";
import { testMultipleImages } from "./tests-docx2/multiple-images.js";
import { testMultipleTables } from "./tests-docx2/multiple-tables.js";
import { testMultipleTextrunWithCenterAlignment } from "./tests-docx2/multiple-textrun-with-center-alignment.js";
import { textMultipleTextRunWithEndAlignmnet } from "./tests-docx2/multiple-textrun-with-end-alignment.js";
import { testMultipleTextRunWithStartAlignmnetThatLineBreaks } from "./tests-docx2/multiple-textrun-with-start-alignment-that-linebreaks.js";
import { testMultipleTextRunWithStartAlignmnet } from "./tests-docx2/multiple-textrun-with-start-alignment.js";
import { testPageNumbering } from "./tests-docx2/page-numbering.js";
import { testPageOrientationLandscape } from "./tests-docx2/page-orientation-landscape.js";
import { testPageOrienationPortrait } from "./tests-docx2/page-orientation-portrait.js";
import { testSimpleTableColSpanAndRowSpan } from "./tests-docx2/simple-table-colSpan-and-rowSpan.js";
import { testSimpleTableWithoutRows } from "./tests-docx2/simple-table-without-rows.js";
import { testSimpleTable } from "./tests-docx2/simple-table.js";
import { testSingleHyperLink } from "./tests-docx2/single-hyperlink.js";
import { testSingleImage } from "./tests-docx2/single-image.js";
import { testSingleTextRunWithCenterAlignmentThatLineBreaks } from "./tests-docx2/single-textrun-with-center-alignment-that-linebreaks.js";
import { testSingleTextRunWithCenterAlignment } from "./tests-docx2/single-textrun-with-center-alignment.js";
import { testSingleTextRunWithEndAlignmentThatLineBreaks } from "./tests-docx2/single-textrun-with-end-alignment-that-linebreaks.js";
import { testSingleTextRunWithEndAlignment } from "./tests-docx2/single-textrun-with-end-alignment.js";
import { testSingleTextRunWithStartAlignmentThatLineBreaks } from "./tests-docx2/single-textrun-with-start-alignment-that-linebreaks.js";
import { testSingleTextRunWithStartAlignment } from "./tests-docx2/single-textrun-with-start-alignment.js";
import { testSingleTextRun } from "./tests-docx2/single-textrun.js";
import { testTocSeparator } from "./tests-docx2/toc-separator.js";
import { testWorld } from "./tests-docx2/world.js";

describe("export docx", () => {
  [
    testGroup,
    testHeaderAndFooter,
    testHelloArialFont,
    testHello,
    testLetterDimensions,
    testMixedHyperLinkAndTextRun,
    testMixedTextRunAndImages,
    testMultipleImages,
    testMultipleTables,
    testMultipleTextrunWithCenterAlignment,
    textMultipleTextRunWithEndAlignmnet,
    testMultipleTextRunWithStartAlignmnetThatLineBreaks,
    testMultipleTextRunWithStartAlignmnet,
    testPageNumbering,
    testPageOrientationLandscape,
    testPageOrienationPortrait,
    testSimpleTableColSpanAndRowSpan,
    testSimpleTableWithoutRows,
    testSimpleTable,
    testSingleHyperLink,
    testSingleImage,
    testSingleTextRunWithCenterAlignmentThatLineBreaks,
    testSingleTextRunWithCenterAlignment,
    testSingleTextRunWithEndAlignmentThatLineBreaks,
    testSingleTextRunWithEndAlignment,
    testSingleTextRunWithStartAlignmentThatLineBreaks,
    testSingleTextRunWithStartAlignment,
    testSingleTextRun,
    testTocSeparator,
    testWorld,
  ].forEach((item) => {
    test(item.name, async () => {
      const abstractDoc = render(item.abstractDocJsx);
      const docxStream = new S.PassThrough();
      exportToStream(docxStream, abstractDoc);
      // Get the DOCX (which by defintion is a zipfile following open packaging convention)
      const docxBuffer = await streamToBuffer(docxStream);
      saveBufferInTmpDir(path.join(__dirname, "tmp"), item.name + ".docx", docxBuffer);
      const docxZip = await jszip.loadAsync(docxBuffer);
      for (const [filename, content] of Object.entries(item.expectedDocxZipContexts)) {
        const docxWordDocumentXml = await docxZip.file(filename)?.async("string");
        expect(docxWordDocumentXml).toBeDefined();
        const isXml = filename.endsWith(".xml");
        const actual = isXml ? await diffXmlStrings(content, docxWordDocumentXml ?? "") : docxWordDocumentXml;
        const expected: unknown = isXml ? [] : content;
        expect(actual).toEqual(expected);
      }
    });
  });

  test("CSS color names and 3 digit hex are exported as 6 digit hex, and unknown colors are left out", async () => {
    // docx only takes 6 digit hex and threw for e.g. "black", so the document was never written
    const border = AD.LayoutFoundation.create({ top: 1, right: 1, bottom: 1, left: 1 });
    const cellStyle = AD.TableCellStyle.create({ background: "white", borderColor: "#abc", borders: border });
    const abstractDoc = render(
      <AbstractDoc>
        <Section>
          <Table columnWidths={[100]}>
            <TableRow>
              <TableCell style={cellStyle}>
                <Paragraph>
                  <TextRun text="named" style={AD.TextStyle.create({ color: "Black" })} />
                  <TextRun text="unknown" style={AD.TextStyle.create({ color: "not-a-color" })} />
                </Paragraph>
              </TableCell>
            </TableRow>
          </Table>
        </Section>
      </AbstractDoc>
    );
    const docxStream = new S.PassThrough();
    const error = new Promise<unknown>((resolve) => docxStream.on("error", resolve));
    exportToStream(docxStream, abstractDoc);
    const docxBuffer = await Promise.race([streamToBuffer(docxStream), error.then((e) => Promise.reject(e))]);
    const xml = (await (await jszip.loadAsync(docxBuffer)).file("word/document.xml")?.async("string")) ?? "";
    expect(xml).toContain('w:color w:val="000000"');
    expect(xml).toContain('w:fill="ffffff"');
    expect(xml).toContain('w:color="aabbcc"');
    expect(xml).not.toContain("not-a-color");
  });
});

type DiffResult = {
  readonly path: string;
  readonly resultType: string;
  readonly message: string;
};

/**
 * It can be very handy to compare with wildcards if for exammple you are not interested in all the data. You can put an * in the first (lhs) xml
 * file. The result of this compare will be no differences.
 */
async function diffXmlStrings(lhs: string, rhs: string): Promise<ReadonlyArray<DiffResult>> {
  return new Promise((resolve) => {
    try {
      DiffJsXml.diffAsXml(
        lhs,
        rhs,
        {},
        {
          compareElementValues: true,
          xml2jsOptions: { ignoreAttributes: false },
        },
        (result: ReadonlyArray<DiffResult>) => {
          resolve(result);
        }
      );
    } catch (e) {
      resolve([{ path: "", resultType: "ERROR", message: "ERROR while calling diffAsXml(): " + (e instanceof Error ? e.message : String(e)) }]);
    }
  });
}
