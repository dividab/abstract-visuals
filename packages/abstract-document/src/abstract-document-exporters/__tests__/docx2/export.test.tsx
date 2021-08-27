import React from "react";
import * as S from "stream";
import { exportToStream } from "../../../abstract-document-exporters/docx2/render";
import { Paragraph, AbstractDoc, Section, render } from "../../../abstract-document-jsx";
import jszip from "jszip";
import { ExportTestDef } from "./export-test-def";
import { loadTests, onlySkip } from "../test-data-utils";

export const tests = loadTests<ExportTestDef>("docx2/test-defs/");

describe("export docx", () => {
  onlySkip(tests).forEach((item) => {
    test(item.name, async () => {
      const abstractDoc = render(item.abstractDocJsx);
      const docxStream = new S.PassThrough();
      exportToStream(docxStream, abstractDoc);
      // Get the DOCX (which by defintiion is a zipfile following open packaging convention)
      const docxBuffer = await streamToBuffer(docxStream);
      // const docxString = streamToString(docxStream);
      const docxZip = await jszip.loadAsync(docxBuffer);
      for (const [filename, content] of Object.entries(item.expectedDocxZipContexts)) {
        const docxWordDocumentXml = await docxZip.file(filename)?.async("string");
        expect(docxWordDocumentXml).toEqual(content);
      }
    });
  });
});

async function streamToBuffer(stream: S.Stream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(chunk));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
