import * as S from "stream";
import path from "path";
import PDFParser from "pdf2json";
import PdfKit from "pdfkit";
import { loadTests, onlySkip, streamToBuffer } from "@abstract-visuals/test-utils";
import { exportToStream } from "../../../abstract-document-exporters/pdf/render";
import { render } from "../../../abstract-document-jsx";
import { ExportTestDef } from "./export-test-def";

export const tests = loadTests<ExportTestDef>(path.join(__dirname, "test-defs/"));

describe("export docx", () => {
  onlySkip(tests).forEach((item) => {
    test(item.name, async () => {
      const abstractDoc = render(item.abstractDocJsx);
      const pdfStream = new S.PassThrough();
      exportToStream(PdfKit, pdfStream, abstractDoc);
      const pdfBuffer = await streamToBuffer(pdfStream);
      const parsed = await getJsonFromPdf(pdfBuffer);
      console.log("item", item);
      console.log("parsed", parsed);
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
      console.log(JSON.stringify(pdfData));
      resolve(pdfData);
    });
    pdfParser.parseBuffer(pdfBuffer);
  });
}
