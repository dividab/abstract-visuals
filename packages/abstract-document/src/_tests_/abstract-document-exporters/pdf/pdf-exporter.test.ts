import * as R from "ramda";
import * as ADPdf from "../../../../src/abstract-document-exporters/pdf/render";
import * as AD from "../../../../src/abstract-document";
// import * as AI from "../../../src/abstract-image";
// import {assert} from "chai";
import * as fs from "fs";
// import * as path from "path";
// import {generateExample, generateHyperlink} from "../test-utils/example-document";
// import {generateText, generateTextInTable, generateMarkdownText} from "../test-utils/textrun";
import * as path from "path";

// tslint:disable-next-line:no-var-requires no-require-imports
const pdfKit = require("pdfkit");

describe("PdfExporter", () => {
  // it("should not crash", function(done) {
  //   const doc = generateExample();
  //   let stream = fs.createWriteStream("test.pdf");
  //   stream.on('finish', function() { done(); });
  //   ADPdf.exportToPdf(doc, stream);
  // });
  //
  // it("should render hyperlinks", function(done) {
  //   const doc = generateHyperlink();
  //   let stream = createWriteStreamInOutDir("test_hyperlink.pdf");
  //   stream.on('finish', function() { done(); });
  //   ADPdf.exportToPdf(doc, stream);
  // });
  //
  // it("should render text", function(done) {
  //   const doc = generateText();
  //   let stream = createWriteStreamInOutDir("test_text.pdf");
  //   stream.on('finish', function() { done(); });
  //   ADPdf.exportToPdf(doc, stream);
  // });
  //
  // it("should render text in tables", function(done) {
  //   const doc = generateTextInTable();
  //   let stream = createWriteStreamInOutDir("test_text-in-table.pdf");
  //   stream.on('finish', function() { done(); });
  //   ADPdf.exportToPdf(doc, stream);
  // });
  //
  // it("should render simple markdown text", function(done) {
  //   const doc = generateMarkdownText(0);
  //   let stream = createWriteStreamInOutDir("test_markdown0.pdf");
  //   stream.on('finish', function() { done(); });
  //   ADPdf.exportToPdf(doc, stream);
  // });
  //
  // it("should render more advanced markdown text", function(done) {
  //   const doc = generateMarkdownText(1);
  //   let stream = createWriteStreamInOutDir("test_markdown1.pdf");
  //   stream.on('finish', function() { done(); });
  //   ADPdf.exportToPdf(doc, stream);
  // });
  //
  // it("should render even MORE advanced markdown text", function(done) {
  //   const doc = generateMarkdownText(2);
  //   let stream = createWriteStreamInOutDir("test_markdown2.pdf");
  //   stream.on('finish', function() { done(); });
  //   ADPdf.exportToPdf(doc, stream);
  // });

  // it("should render abstract image correctly", function (done) {
  //   const abstractImage = AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(200, 200), AI.white, [
  //     AI.createPolyLine([
  //       AI.createPoint(100, 0),
  //       AI.createPoint(100, 200),
  //       AI.createPoint(50, 250),
  //     ], AI.black, 1),
  //     AI.createPolyLine([AI.createPoint(0, 100), AI.createPoint(200, 100)], AI.black, 1),
  //     AI.createText(AI.createPoint(100, 100), "Test", "Helvetica", 10, AI.black, "normal", -90, "left", "uniform", "uniform", 0, AI.black)
  //   ]);
  //   const image = AD.ImageResource.create({ id: "image", abstractImage: abstractImage });
  //   const doc = AD.AbstractDoc.create({
  //     imageResources: { "image": image },   [
  //       AD.Section.create({
  //           [
  //           AD.Paragraph.create({
  //               [
  //               AD.Image.create({ imageResource: image, width: 100, height: 100 })
  //             ]
  //           }),
  //           AD.Paragraph.create({
  //               [
  //               AD.Image.create({ imageResource: image, width: 100, height: 100 })
  //             ]
  //           })
  //         ]
  //       })
  //     ]
  //   });
  //   let stream = createWriteStreamInOutDir("test_abstractimage.pdf");
  //   stream.on('finish', function () { done(); });
  //   ADPdf.exportToStream(pdfKit, stream, doc);
  // });

  it("should render tables correctly", (done) => {
    const tableCellStyle = AD.TableCellStyle.create({
      background: "#AAAAFF",
      padding: AD.LayoutFoundation.create({
        top: 10,
        bottom: 20,
        left: 30,
        right: 40,
      }),
    });
    const text = R.range(0, 30)
      .map((i) => "Test" + i.toString())
      .join(" ");
    const defaultTextStyle = AD.TextStyle.create({ fontSize: 20 });
    const styles: AD.Types.Indexer<AD.Style.Style> = {};
    styles[AD.StyleKey.create("ParagraphStyle", "Default")] = AD.ParagraphStyle.create({ textStyle: defaultTextStyle });
    styles[AD.StyleKey.create("TextStyle", "Default")] = defaultTextStyle;

    const doc = AD.AbstractDoc.create(
      {
        styles: styles,
      },
      [
        AD.Section.create({}, [
          AD.Table.create(
            {
              columnWidths: [Infinity, 200],
            },
            [
              AD.TableRow.create({}, [
                AD.TableCell.create(
                  {
                    style: tableCellStyle,
                  },
                  [AD.Paragraph.create({}, [AD.TextRun.create({ text: text })])]
                ),
                AD.TableCell.create(
                  {
                    style: tableCellStyle,
                  },
                  [AD.Paragraph.create({}, [AD.TextRun.create({ text: text })])]
                ),
              ]),
              AD.TableRow.create({}, [
                AD.TableCell.create(
                  {
                    style: tableCellStyle,
                  },
                  [AD.Paragraph.create({}, [AD.TextRun.create({ text: "Apa apa" })])]
                ),
                AD.TableCell.create(
                  {
                    style: tableCellStyle,
                  },
                  [AD.Paragraph.create({}, [AD.TextRun.create({ text: "123.33 Pa" })])]
                ),
              ]),
              AD.TableRow.create({}, [
                AD.TableCell.create(
                  {
                    style: tableCellStyle,
                  },
                  [AD.Paragraph.create({}, [AD.TextRun.create({ text: "Torsk" })])]
                ),
                AD.TableCell.create(
                  {
                    style: tableCellStyle,
                  },
                  [AD.Paragraph.create({}, [AD.TextRun.create({ text: "5.5 l/s" })])]
                ),
              ]),
              AD.TableRow.create({}, [
                AD.TableCell.create(
                  {
                    style: tableCellStyle,
                  },
                  [AD.Paragraph.create({}, [AD.TextRun.create({ text: "Mugg" })])]
                ),
                AD.TableCell.create(
                  {
                    style: tableCellStyle,
                  },
                  [AD.Paragraph.create({}, [AD.TextRun.create({ text: "23" })])]
                ),
              ]),
            ]
          ),
        ]),
      ]
    );
    let stream = createWriteStreamInOutDir("test_table.pdf");
    stream.on("finish", () => {
      done();
    });
    ADPdf.exportToStream(pdfKit, stream, doc);
  });

  it("should render paragraphs in Daxline correctly", (done) => {
    const loadFile = (fileName: string) => {
      const buffer = fs.readFileSync(fileName);
      const array = new Uint8Array(buffer);
      return array;
    };
    const fonts = {
      Daxline: AD.Font.create({
        normal: loadFile(path.join(__dirname, "../../fonts/DaxlinePro-Regular_13131.ttf")),
        bold: loadFile(path.join(__dirname, "../../fonts/DaxlinePro-Regular_13131.ttf")),
        italic: loadFile(path.join(__dirname, "../../fonts/DaxlinePro-Regular_13131.ttf")),
        boldItalic: loadFile(path.join(__dirname, "../../fonts/DaxlinePro-Regular_13131.ttf")),
      }),
    };
    const fontStyle = AD.TextStyle.create({ fontFamily: "Daxline" });
    const doc = AD.AbstractDoc.create(
      {
        fonts: fonts,
      },
      [
        AD.Section.create({}, [
          AD.Paragraph.create(
            {
              styleName: "H1",
            },
            [AD.TextRun.create({ text: "Testing" })]
          ),
          AD.Paragraph.create(
            {
              styleName: "H2",
            },
            [AD.TextRun.create({ style: fontStyle, text: "Testing" })]
          ),
          AD.Paragraph.create(
            {
              styleName: "H3",
            },
            [AD.TextRun.create({ style: fontStyle, text: "Testing" })]
          ),
          AD.Paragraph.create({}, [
            AD.TextRun.create({
              style: fontStyle,
              text: "Testing paragraph 1",
            }),
          ]),
          AD.Paragraph.create({}, [
            AD.TextRun.create({
              style: fontStyle,
              text: "Testing paragraph 2",
            }),
          ]),
        ]),
      ]
    );
    let stream = createWriteStreamInOutDir("test_paragraphstyling_daxline.pdf");
    stream.on("finish", () => {
      done();
    });
    ADPdf.exportToStream(pdfKit, stream, doc);
  });

  // it("should render paragraphs in Arial correctly", function (done) {
  //   const fonts = {
  //     "Arial": AD.Font.create({
  //       normal: "fonts/Arial.ttf",
  //       bold: "fonts/Arial-Bold.ttf",
  //       italic: "fonts/Arial-Oblique.ttf",
  //       boldItalic: "fonts/Arial-BoldOblique.ttf"
  //     }),
  //   };
  //   const fontStyle = AD.TextStyle.create({ fontFamily: "Arial" });
  //   const doc = AD.AbstractDoc.create({
  //     fonts: fonts,   [
  //       AD.Section.create({
  //           [
  //           AD.Paragraph.create({
  //             styleName: "H1",   [
  //               AD.TextRun.create({ style: fontStyle, text: "Testing" })
  //             ]
  //           }),
  //           AD.Paragraph.create({
  //             styleName: "H2",   [
  //               AD.TextRun.create({ style: fontStyle, text: "Testing" })
  //             ]
  //           }),
  //           AD.Paragraph.create({
  //             styleName: "H3",   [
  //               AD.TextRun.create({ style: fontStyle, text: "Testing" })
  //             ]
  //           }),
  //           AD.Paragraph.create({
  //               [
  //               AD.TextRun.create({ style: fontStyle, text: "Testing paragraph 1" })
  //             ]
  //           }),
  //           AD.Paragraph.create({
  //               [
  //               AD.TextRun.create({ style: fontStyle, text: "Testing paragraph 2" })
  //             ]
  //           }),
  //         ]
  //       })
  //     ]
  //   });
  //   let stream = createWriteStreamInOutDir("test_paragraphstyling_arial.pdf");
  //   stream.on('finish', function () { done(); });
  //   ADPdf.exportToStream(pdfKit, stream, doc);
  // });

  // it("should render page number correctly", function (done) {
  //   const doc = AD.AbstractDoc.create({
  //       [
  //       AD.Section.create({
  //           [
  //           AD.Paragraph.create({
  //               [
  //               AD.TextField.create({ fieldType: "PageNumber" })
  //             ]
  //           })
  //         ]
  //       }),
  //       AD.Section.create({
  //           [
  //           AD.Paragraph.create({
  //               [
  //               AD.TextField.create({ fieldType: "PageNumber" })
  //             ]
  //           })
  //         ]
  //       }),
  //       AD.Section.create({
  //           [
  //           AD.Paragraph.create({
  //               [
  //               AD.TextField.create({ fieldType: "PageNumber" })
  //             ]
  //           })
  //         ]
  //       })
  //     ]
  //   });
  //   let stream = createWriteStreamInOutDir("test_pagenumber.pdf");
  //   stream.on('finish', function () { done(); });
  //   ADPdf.exportToStream(pdfKit, stream, doc);
  // });

  // it("should render header and footer correctly", function (done) {
  //   const pageStyle = AD.PageStyle.create({
  //     headerMargins: AD.LayoutFoundation.create({ bottom: 50 }),
  //     contentMargins: AD.LayoutFoundation.create({ left: 30, right: 20 }),
  //     footerMargins: AD.LayoutFoundation.create({ top: 50 }),
  //   });
  //   const header = [
  //     AD.Paragraph.create({
  //         [
  //         AD.TextRun.create({ text: "Header" }),
  //         AD.TextField.create({ fieldType: "PageNumber" })
  //       ]
  //     })
  //   ];
  //   const footer = [
  //     AD.Paragraph.create({
  //         [
  //         AD.TextRun.create({ text: "Footer" }),
  //         AD.TextField.create({ fieldType: "PageNumber" })
  //       ]
  //     })
  //   ];
  //   const page = AD.MasterPage.create({ style: pageStyle, header: header, footer: footer });
  //   const doc = AD.AbstractDoc.create({
  //       [
  //       AD.Section.create({
  //         page: page,   R.range(0, 100).map(() =>
  //           AD.Paragraph.create({
  //               [
  //               AD.TextField.create({ fieldType: "PageNumber" })
  //             ]
  //           })
  //         )
  //       }),
  //     ]
  //   });
  //   const stream = createWriteStreamInOutDir("test_headerfooter.pdf");
  //   stream.on('finish', function () { done(); });
  //   ADPdf.exportToStream(pdfKit, stream, doc);
  // });

  // it("should render bitmap images correctly", function (done) {
  //   const data = fs.readFileSync("images/diffusers.png");
  //   const abstractImage = AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(40, 38), AI.white, [
  //     AI.createBitmapImage(AI.createPoint(0, 0), AI.createPoint(40, 38), "png", data)
  //   ]);
  //   const imageResource = AD.ImageResource.create({
  //     id: "image",
  //     abstractImage: abstractImage
  //   });
  //   const doc = AD.AbstractDoc.create({
  //       [
  //       AD.Section.create({
  //           [
  //           AD.Paragraph.create({
  //               [
  //               AD.Image.create({
  //                 width: 40,
  //                 height: 38,
  //                 imageResource: imageResource
  //               })
  //             ]
  //           })
  //         ]
  //       }),
  //     ]
  //   });
  //   const stream = createWriteStreamInOutDir("test_image.pdf");
  //   stream.on('finish', function () { done(); });
  //   ADPdf.exportToStream(pdfKit, stream, doc);
  // });

  it("should handle styling correctly", (done) => {
    const textBlue = AD.TextStyle.create({ fontSize: 20 });
    const textRed = AD.TextStyle.create({ fontSize: 7 });

    const paragraphBlue = AD.ParagraphStyle.create({ textStyle: textBlue });
    const paragraphRed = AD.ParagraphStyle.create({ textStyle: textRed });

    const styles: AD.Types.Indexer<AD.Style.Style> = {};
    styles[AD.StyleKey.create("ParagraphStyle", "Default")] = paragraphBlue;
    styles[AD.StyleKey.create("TextStyle", "Default")] = textBlue;
    styles[AD.StyleKey.create("ParagraphStyle", "Red")] = paragraphRed;
    styles[AD.StyleKey.create("TextStyle", "Red")] = textRed;

    const doc = AD.AbstractDoc.create(
      {
        styles: styles,
      },
      [
        AD.Section.create({}, [
          AD.Paragraph.create({}, [
            AD.TextRun.create({
              text: "Blue from default style",
            }),
          ]),
          AD.Paragraph.create(
            {
              styleName: "Red",
            },
            [
              AD.TextRun.create({
                text: "Red from paragraph style name",
              }),
            ]
          ),
          AD.Paragraph.create({}, [
            AD.TextRun.create({
              styleName: "Red",
              text: "Red from text style name",
            }),
          ]),
          AD.Paragraph.create(
            {
              style: paragraphRed,
            },
            [
              AD.TextRun.create({
                text: "Red from paragraph element",
              }),
            ]
          ),
          AD.Paragraph.create({}, [
            AD.TextRun.create({
              style: textRed,
              text: "Red from text element",
            }),
          ]),
          AD.Paragraph.create(
            {
              style: paragraphBlue,
            },
            [
              AD.TextRun.create({
                styleName: "Red",
                text: "Red from paragraph element, overriding parent style",
              }),
            ]
          ),
        ]),
      ]
    );
    let stream = createWriteStreamInOutDir("test_paragraphstyling_hierarchy.pdf");
    stream.on("finish", () => {
      done();
    });
    ADPdf.exportToStream(pdfKit, stream, doc);
  });

  it("should handle new lines correctly", (done) => {
    const paragraphStyle = AD.ParagraphStyle.create({
      textStyle: AD.TextStyle.create({
        fontSize: 12,
      }),
    });
    const cellStyle = AD.TableCellStyle.create({
      padding: AD.LayoutFoundation.create({
        top: 20,
        bottom: 20,
        left: 50,
        right: 50,
      }),
    });

    const doc = AD.AbstractDoc.create({}, [
      AD.Section.create({
        page: AD.MasterPage.create({
          header: [
            AD.Table.create(
              {
                columnWidths: [Infinity],
              },
              [
                AD.TableRow.create({}, [
                  AD.TableCell.create(
                    {
                      style: cellStyle,
                    },
                    [
                      AD.Paragraph.create(
                        {
                          style: paragraphStyle,
                        },
                        [
                          AD.TextRun.create({
                            text: "THOR-100, THOR-100, THOR-100, THOR-100",
                          }),
                        ]
                      ),
                    ]
                  ),
                  AD.TableCell.create(),
                ]),
              ]
            ),
          ],
        }),
      }),
    ]);
    let stream = createWriteStreamInOutDir("test_new_line.pdf");
    stream.on("finish", () => {
      done();
    });
    ADPdf.exportToStream(pdfKit, stream, doc);
  });

  it("should handle line breaks and wrapping correctly", (done) => {
    const longString =
      "Testing with a very long text that should either be wrapped or" +
      " truncated depending on the text setting. So here we go trying to figureoutif that works or not.";
    const oneString =
      "Testingwithaverytextthatshouldeitheraaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa aaaaaaaaaaaaaaaaa" +
      "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.";
    const shortString = "Short string";

    const cellStyle = AD.TableCellStyle.create({
      borders: AD.LayoutFoundation.create({
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
      }),
      borderColor: "blue",
      verticalAlignment: "Middle",
    });

    const breakStyle = AD.TextStyle.create({ lineBreak: false, fontSize: 6 });

    const r1 = AD.TableRow.create({}, [
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "Start" }) }, [
          AD.TextRun.create({
            text: "top left" + longString,
            style: breakStyle,
          }),
        ]),
      ]),
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "Center" }) }, [
          AD.TextRun.create({
            text: "top center" + longString,
            style: breakStyle,
          }),
        ]),
      ]),
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "End" }) }, [
          AD.TextRun.create({
            text: "top right" + longString,
            style: breakStyle,
          }),
        ]),
      ]),
    ]);

    const r2 = AD.TableRow.create({}, [
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "Start" }) }, [
          AD.TextRun.create({
            text: "middle left" + oneString,
            style: AD.TextStyle.create({ lineBreak: true, fontSize: 5 }),
          }),
        ]),
      ]),
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "Center" }) }, [
          AD.TextRun.create({
            text: "middle center" + oneString,
            style: AD.TextStyle.create({ lineBreak: true, fontSize: 5 }),
          }),
        ]),
      ]),
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "End" }) }, [
          AD.TextRun.create({
            text: "middle right" + oneString,
            style: AD.TextStyle.create({ lineBreak: true, fontSize: 5 }),
          }),
        ]),
      ]),
    ]);

    const r3 = AD.TableRow.create({}, [
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "Start" }) }, [
          AD.TextRun.create({
            text: "bottom left" + shortString,
            style: AD.TextStyle.create({ fontSize: 20 }),
          }),
        ]),
      ]),
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "Center" }) }, [
          AD.TextRun.create({
            text: "bottom center" + shortString,
            style: AD.TextStyle.create({ fontSize: 20 }),
          }),
        ]),
      ]),
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "End" }) }, [
          AD.TextRun.create({
            text: "bottom right" + shortString,
            style: AD.TextStyle.create({ fontSize: 20 }),
          }),
        ]),
      ]),
    ]);
    const rNested = AD.TableRow.create({}, [
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "Start" }) }, [
          AD.TextRun.create({
            text: "bottom left" + shortString,
          }),
        ]),
      ]),
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "Center" }) }, [
          AD.TextRun.create({
            text: "bottom center" + shortString,
          }),
        ]),
      ]),
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "End" }) }, [
          AD.TextRun.create({
            text: "bottom right" + shortString,
          }),
        ]),
      ]),
    ]);

    const r4 = AD.TableRow.create({}, [
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "Start" }) }, [
          AD.TextRun.create({
            text: "empty",
          }),
        ]),
      ]),
      AD.TableCell.create({}, [
        AD.Table.create(
          {
            columnWidths: [50, 50, 50],
            style: AD.TableStyle.create({ cellStyle: cellStyle, alignment: "Center" }),
          },
          [rNested]
        ),
      ]),
      AD.TableCell.create({}, [
        AD.Paragraph.create({ style: AD.ParagraphStyle.create({ alignment: "End" }) }, [
          AD.TextRun.create({
            text: "empty",
          }),
        ]),
      ]),
    ]);

    const doc = AD.AbstractDoc.create({}, [
      AD.Section.create({}, [
        AD.Paragraph.create({}, [
          AD.TextRun.create({
            text: oneString,
          }),
        ]),
        AD.Table.create(
          {
            columnWidths: [100, 200, 100],
            style: AD.TableStyle.create({ cellStyle: cellStyle, alignment: "Center" }),
          },
          [r1, r2, r3, r4]
        ),
      ]),
    ]);
    let stream = createWriteStreamInOutDir("test_line_break.pdf");
    stream.on("finish", () => {
      done();
    });
    ADPdf.exportToStream(pdfKit, stream, doc);
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
