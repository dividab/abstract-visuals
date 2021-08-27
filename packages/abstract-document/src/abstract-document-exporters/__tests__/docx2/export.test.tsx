import * as S from "stream";
import path from "path";
import * as DiffJsXml from "diff-js-xml";
import { loadTests, onlySkip, streamToBuffer } from "@abstract-visuals/test-utils";
import { exportToStream } from "../../../abstract-document-exporters/docx2/render";
import { render } from "../../../abstract-document-jsx";
import jszip from "jszip";
import { ExportTestDef } from "./export-test-def";

export const tests = loadTests<ExportTestDef>(path.join(__dirname, "test-defs/"));

describe("export docx", () => {
  onlySkip(tests).forEach((item) => {
    test(item.name, async () => {
      const abstractDoc = render(item.abstractDocJsx);
      const docxStream = new S.PassThrough();
      exportToStream(docxStream, abstractDoc);
      // Get the DOCX (which by defintiion is a zipfile following open packaging convention)
      const docxBuffer = await streamToBuffer(docxStream);
      const docxZip = await jszip.loadAsync(docxBuffer);
      for (const [filename, content] of Object.entries(item.expectedDocxZipContexts)) {
        const docxWordDocumentXml = await docxZip.file(filename)?.async("string");
        if (docxWordDocumentXml !== undefined) {
          if (filename.endsWith(".xml")) {
            const result = await diffXmlStrings(content, docxWordDocumentXml);
            // console.log("result", result);
            expect(result).toEqual([]);
          } else {
            expect(docxWordDocumentXml).toEqual(content);
          }
        }
      }
    });
  });
});

type DiffResult = {
  readonly path: string;
  readonly resultType: string;
  readonly message: string;
};

/**
 * It can be very handy to compare with wildcards if for exammple you are not interested in all the data.
 * You can put an * in the first (lhs) xml file. The result of this compare will be no differences.
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
      resolve([{ path: "", resultType: "ERROR", message: "ERROR while calling diffAsXml(): " + e.message }]);
    }
  });
}
