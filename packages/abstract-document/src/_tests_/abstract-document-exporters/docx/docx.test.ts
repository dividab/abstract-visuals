import * as R from "ramda";
import { exportToStream } from "../../../abstract-document-exporters/docx2/render";
import * as AD from "../../../abstract-document";
import * as fs from "fs";
import * as path from "path";

describe("docx-test", () => {
  it("Hyperlinks", (done) => {
    const ad = AD.AbstractDoc.create(undefined, [
      AD.Section.create(
        {
          id: "#t1",
        },
        [
          AD.Paragraph.create(undefined, [
            AD.TextRun.create({
              text: "Paragraph 1",
            }),
          ]),
          AD.Paragraph.create(undefined, [
            AD.TextRun.create({
              text: "Paragraph 2",
            }),
          ]),
          AD.Paragraph.create(undefined, [
            AD.TextRun.create({
              text: "Paragraph 3",
            }),
            AD.HyperLink.create({
              target: "#t2",
              text: "Link to t2",
            }),
          ]),
        ]
      ),
      AD.Section.create(
        {
          id: "#t2",
        },
        [
          AD.Paragraph.create(undefined, [
            AD.TextRun.create({
              text: "Paragraph 1",
            }),
            AD.HyperLink.create({
              target: "https://google.com",
              text: "Google",
            }),
          ]),
          AD.Paragraph.create(undefined, [
            AD.TextRun.create({
              text: "Paragraph 2",
            }),
          ]),
          AD.Paragraph.create(undefined, [
            AD.TextRun.create({
              text: "Paragraph 3",
            }),
            AD.HyperLink.create({
              target: "#t1",
              text: "Link to t1",
            }),
          ]),
        ]
      ),
    ]);

    let stream = createWriteStreamInOutDir("hyperlinks-test.docx");
    stream.on("finish", () => {
      done();
    });
    exportToStream(stream, ad as any);
  });
});

function createWriteStreamInOutDir(pathToStream: string): fs.WriteStream {
  const OUT_DIR = "test_out";
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR);
  }
  const fullPath = path.join(OUT_DIR, pathToStream);
  const stream = fs.createWriteStream(fullPath);
  return stream;
}
