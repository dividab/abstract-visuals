import * as R from "ramda";
import * as ADPdf from "../../../../src/abstract-document-exporters/pdf/render";
import * as AD from "../../../../src/abstract-document";
import * as fs from "fs";
import * as path from "path";

// tslint:disable-next-line:no-var-requires no-require-imports
const pdfKit = require("pdfkit");
const fontPath = "test/src/fonts/Arial-Unicode-MS.ttf";

describe("SpecialCharacters", () => {
  //   it("should render paragraphs with regular characters (e.g. ABC)", (done) => {
  //     const loadFile = (fileName: string) => {
  //       const buffer = fs.readFileSync(fileName);
  //       const array = new Uint8Array(buffer);
  //       return array;
  //     };
  //     const fonts = {
  //       ArialUnicodeMS: AD.Font.create({
  //         normal: loadFile(fontPath),
  //         bold: loadFile(fontPath),
  //         italic: loadFile(fontPath),
  //         boldItalic: loadFile(fontPath),
  //       }),
  //     };
  //     const fontStyle = AD.TextStyle.create({ fontFamily: "ArialUnicodeMS" });
  //     const doc = AD.AbstractDoc.create({
  //       fonts: fonts,
  //       children: [
  //         AD.Section.create({
  //           children: [
  //             AD.Paragraph.create({
  //               styleName: "H1",
  //               children: [AD.TextRun.create({ text: "Test ABC" })],
  //             }),
  //             AD.Paragraph.create({
  //               styleName: "H2",
  //               children: [
  //                 AD.TextRun.create({ style: fontStyle, text: "Test 123" }),
  //               ],
  //             }),
  //             AD.Paragraph.create({
  //               styleName: "H3",
  //               children: [AD.TextRun.create({ style: fontStyle, text: "Test" })],
  //             }),
  //             AD.Paragraph.create({
  //               children: [
  //                 AD.TextRun.create({
  //                   style: fontStyle,
  //                   text: "Testing paragraph 1",
  //                 }),
  //               ],
  //             }),
  //             AD.Paragraph.create({
  //               children: [
  //                 AD.TextRun.create({
  //                   style: fontStyle,
  //                   text: "Testing paragraph 2",
  //                 }),
  //               ],
  //             }),
  //           ],
  //         }),
  //       ],
  //     });
  //     let stream = createWriteStreamInOutDir("test_ABC.pdf");
  //     stream.on("finish", () => {
  //       done();
  //     });

  //     let kit = new pdfKit();

  //     ADPdf.exportToStream(kit, stream, doc);
  //   });

  it("should render paragraphs with regular characters (e.g. 选型工程师)", done => {
    const loadFile = (fileName: string) => {
      const buffer = fs.readFileSync(fileName);
      const array = new Uint8Array(buffer);
      return array;
    };
    const fonts = {
      ArialUnicodeMS: AD.Font.create({
        normal: loadFile(fontPath),
        bold: loadFile(fontPath),
        italic: loadFile(fontPath),
        boldItalic: loadFile(fontPath)
      })
    };
    const fontStyle = AD.TextStyle.create({ fontFamily: "ArialUnicodeMS" });
    const doc = AD.AbstractDoc.create({
      fonts: fonts,
      children: [
        AD.Section.create({
          children: [
            AD.Paragraph.create({
              styleName: "H1",
              children: [AD.TextRun.create({ text: "选型工程师" })]
            }),
            AD.Paragraph.create({
              styleName: "H2",
              children: [AD.TextRun.create({ style: fontStyle, text: "选定" })]
            }),
            AD.Paragraph.create({
              styleName: "H3",
              children: [
                AD.TextRun.create({ style: fontStyle, text: "Test 技术" })
              ]
            }),
            AD.Paragraph.create({
              children: [
                AD.TextRun.create({
                  style: fontStyle,
                  text: "Testing paragraph 定"
                })
              ]
            }),
            AD.Paragraph.create({
              children: [
                AD.TextRun.create({
                  style: fontStyle,
                  text: "Testing paragraph 型工"
                })
              ]
            })
          ]
        })
      ]
    });
    let stream = createWriteStreamInOutDir("test_Chinese.pdf");
    stream.on("finish", () => {
      done();
    });

    let kit = new pdfKit();

    ADPdf.exportToStream(kit, stream, doc);
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
