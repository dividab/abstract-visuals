//tslint:disable

// import {assert} from "chai";
// import * as DocxDocumentRenderer from "../../../src/abstract-document-exporters/docx/docx-document-renderer";
// import {ExportedImage, ImageFormat} from "../../../src/abstract-document-exporters/docx/docx-document-renderer";
// import * as AbstractImage from "../../../src/abstract-image";
// import * as fs from "fs";
// import {
//   MasterPage, PageStyle, HeaderStyle, Section,
//   Paragraph, ParagraphProperties, TextProperties, TextRun, DefaultStyles,
//   Table, TableRow, TableCell, Image, ImageResource
// } from "../../../src/abstract-document/index";
// import * as AbstractDoc from "../../../src/abstract-document/index";
//
//
// describe("DocxExporter", () => {
//
// //   it("should write hello world document", () => {
// //     const doc = helloWorldDoc;
// //     const result = DocxDocumentRenderer.exportToZipMap(doc);
// //     // console.log(result);
// //     assert.deepEqual(result["word\\Header_rId1.xml"], {type: "XmlString", xml: HelloWorldDocx.word_Header_rId1_xml});
// //     assert.deepEqual(result["word\\document.xml"], {type: "XmlString", xml: HelloWorldDocx.word_document_xml});
// //     assert.deepEqual(result["word\\_rels\\document.xml.rels"], {type: "XmlString", xml: HelloWorldDocx.word_rels_document_xml_rels});
// //     assert.deepEqual(result["[Content_Types].xml"], {type: "XmlString", xml: HelloWorldDocx.Content_Types_xml});
// //   });
//
// //   it("should create hello world docx", (done) => {
// //     const doc = helloWorldDoc;
// //     const exportAbstractImageFunc = (format: ImageFormat, image: AbstractImage.AbstractImage, scale: number): ExportedImage => {
// //       return null;
// //     };
// //     const result = DocxDocumentRenderer.exportToDocx(exportAbstractImageFunc, doc)
// //       .then((result) => {
// //         assert.isOk(result);
// //         fs.writeFileSync("my1.docx", new Buffer(result));
// //         done();
// //       });
// //   });
//
//
//   it("should create doc with table", (done) => {
//     const pageStyle = PageStyle.create({paperSize: "A4", orientation: "Portrait", header: HeaderStyle.create({marginBottom: 5.0 * 595.0 / 210.0})});
//     const page = MasterPage.create({style: pageStyle});
//
//     /*
//      const builder = new DocumentBuilder();
//
//      builder.beginSection(page);
//
//      builder.beginTable([
//      (MasterPage.getPrintableWidth(page) / 2),
//      (MasterPage.getPrintableWidth(page) / 2),
//      ], true);
//
//      builder.beginTableRow();
//
//      builder.beginTableCell();
//      builder.beginParagraph();
//      builder.insertTextRun2("NOVA-A-1-2-400X150-H-AN", TextProperties.create({
//      fontFamily: "Arial",
//      fontSize: 14,
//      underline: false,
//      bold: false,
//      italic: false,
//      color: "#007385",
//      subScript: false,
//      superScript: false
//      }));
//      builder.endParagraph();
//      builder.endTableCell();
//
//
//
//
//
//
//      builder.beginTableCell();
//
//      builder.beginTable([
//      (MasterPage.getPrintableWidth(page) / 8),
//      (MasterPage.getPrintableWidth(page) / 8),
//      ], true);
//
//      builder.beginTableRow();
//
//      builder.beginTableCell();
//      builder.beginParagraph();
//      builder.insertTextRun2("Document type", TextProperties.create({
//      fontFamily: "Arial",
//      fontSize: 6,
//      underline: false,
//      bold: false,
//      italic: false,
//      subScript: false,
//      superScript: false
//      }));
//      builder.endParagraph();
//      builder.endTableCell();
//
//
//      builder.beginTableCell();
//      builder.beginParagraph();
//      builder.insertTextRun2("Product card", TextProperties.create({
//      fontFamily: "Arial",
//      fontSize: 6,
//      underline: false,
//      bold: true,
//      italic: false,
//      subScript: false,
//      superScript: false
//      }));
//      builder.endParagraph();
//      builder.endTableCell();
//
//      builder.endTableRow();
//
//      builder.endTable();
//
//
//
//
//
//      builder.endTableCell();
//
//      builder.endTableRow();
//
//
//      builder.beginTableRow();
//      builder.beginTableCell();
//      builder.beginParagraph();
//      builder.insertTextRun("bild1 star");
//      const components1 = [
//      AbstractImage.createLine(AbstractImage.createPoint(25, 25), AbstractImage.createPoint(80, 60), AbstractImage.black, 2),
//      AbstractImage.createRectangle(AbstractImage.createPoint(10, 50), AbstractImage.createPoint(50, 60), AbstractImage.blue, 2, AbstractImage.red),
//      AbstractImage.createText(AbstractImage.createPoint(100, 100), "hej 1", "Arial", 18, AbstractImage.fromArgb(255, 255, 0, 255), "bold", 90, "left", "right", "uniform", 5, AbstractImage.fromArgb(255, 0, 255, 0)),
//      ];
//      const image1 = AbstractImage.createAbstractImage(AbstractImage.createPoint(0, 0), AbstractImage.createSize(400, 400), AbstractImage.white, components1);
//      builder.insertImageWithResource("a", image1, 100, 100, 1);
//      builder.insertTextRun("end bild1");
//      builder.endParagraph();
//      builder.endTableCell();
//
//      builder.beginTableCell();
//      builder.beginParagraph();
//      builder.insertTextRun("bild 2 start");
//      const components2 = [
//      AbstractImage.createLine(AbstractImage.createPoint(25, 25), AbstractImage.createPoint(80, 60), AbstractImage.black, 2),
//      AbstractImage.createRectangle(AbstractImage.createPoint(10, 10), AbstractImage.createPoint(380, 380), AbstractImage.blue, 2, AbstractImage.red),
//      AbstractImage.createText(AbstractImage.createPoint(100, 100), "hej 2", "Arial", 18, AbstractImage.fromArgb(255, 255, 0, 255), "bold", 90, "left", "right", "uniform", 5, AbstractImage.fromArgb(255, 0, 255, 0)),
//      ];
//      const image2 = AbstractImage.createAbstractImage(AbstractImage.createPoint(0, 0), AbstractImage.createSize(400, 400), AbstractImage.white, components2);
//      builder.insertImageWithResource("b", image2, 100, 100, 1);
//      builder.insertTextRun("end bild 2");
//      builder.endParagraph();
//      builder.endTableCell();
//
//      builder.endTableRow();
//
//
//      builder.endTable();
//
//      builder.endSection();
//
//      const doc = builder.build();
//      */
//
//     const components1 = [
//       AbstractImage.createLine(AbstractImage.createPoint(25, 25), AbstractImage.createPoint(80, 60), AbstractImage.black, 2),
//       AbstractImage.createRectangle(AbstractImage.createPoint(10, 50), AbstractImage.createPoint(50, 60), AbstractImage.blue, 2, AbstractImage.red),
//       AbstractImage.createText(AbstractImage.createPoint(100, 100), "hej 1", "Arial", 18, AbstractImage.fromArgb(255, 255, 0, 255), "bold", 90, "left", "right", "uniform", 5, AbstractImage.fromArgb(255, 0, 255, 0)),
//     ];
//     const image1 = AbstractImage.createAbstractImage(AbstractImage.createPoint(0, 0), AbstractImage.createSize(400, 400), AbstractImage.white, components1);
//     const image1Resource = ImageResource.create({id: "a", abstractImage: image1});
//     const components2 = [
//       AbstractImage.createLine(AbstractImage.createPoint(25, 25), AbstractImage.createPoint(80, 60), AbstractImage.black, 2),
//       AbstractImage.createRectangle(AbstractImage.createPoint(10, 10), AbstractImage.createPoint(380, 380), AbstractImage.blue, 2, AbstractImage.red),
//       AbstractImage.createText(AbstractImage.createPoint(100, 100), "hej 2", "Arial", 18, AbstractImage.fromArgb(255, 255, 0, 255), "bold", 90, "left", "right", "uniform", 5, AbstractImage.fromArgb(255, 0, 255, 0)),
//     ];
//     const image2 = AbstractImage.createAbstractImage(AbstractImage.createPoint(0, 0), AbstractImage.createSize(400, 400), AbstractImage.white, components2);
//     const image2Resource = ImageResource.create({id: "b", abstractImage: image2});
//
//     const doc = AbstractDoc.AbstractDoc.create({
//       imageResources: {"a": image1Resource, "b": image2Resource},
//       children: [
//         Section.create({
//           page, children: [
//             Table.create({
//               columnWidths: [
//                 (MasterPage.getPrintableWidth(page) / 2),
//                 (MasterPage.getPrintableWidth(page) / 2),
//               ],
//               children: [
//                 row1(),
//                 row2(),
//               ]
//             })
//           ]
//         })
//       ],
//       styles: DefaultStyles.createDefaultAndStandardStyles(),
//     });
//
//
//     function row1() {
//       return TableRow.create({
//         children: [
//           TableCell.create({
//             children: [
//               Paragraph.create({
//                 children: [
//                   TextRun.create({text: "NOVA-A-1-2-400X150-H-AN"})
//                 ]
//               })
//             ]
//           }),
//
//           TableCell.create({
//             children: [
//               row1InnerTable()
//             ]
//           })
//         ]
//       });
//     }
//
//     function row2() {
//
//       return TableRow.create({
//         children: [
//           TableCell.create({
//             children: [
//               Paragraph.create({
//                 children: [
//                   TextRun.create({text: "bild 1 start"}),
//                   Image.create({imageResource: image1Resource, width: 100, height: 100}),
//                   TextRun.create({text: "end bild 1"}),
//                 ]
//               })
//             ]
//           }),
//           TableCell.create({
//             children: [
//               Paragraph.create({
//                 children: [
//                   TextRun.create({text: "bild 2 start"}),
//                   Image.create({imageResource: image2Resource, width: 100, height: 100}),
//                   TextRun.create({text: "end bild 2"}),
//                 ]
//               })
//             ]
//           })
//         ]
//       });
//     }
//
//     function row1InnerTable() {
//       return Table.create({
//         columnWidths: [
//           (MasterPage.getPrintableWidth(page) / 8),
//           (MasterPage.getPrintableWidth(page) / 8),
//         ],
//         children: [
//           TableRow.create({
//             children: [
//               TableCell.create({
//                 children: [
//                   Paragraph.create({
//                     children: [
//                       TextRun.create({text: "Document type", textProperties: TextProperties.create({fontFamily: "Arial", fontSize: 6})})
//                     ]
//                   })
//                 ]
//               }),
//               TableCell.create({
//                 children: [
//                   Paragraph.create({
//                     children: [
//                       TextRun.create({text: "Product card", textProperties: TextProperties.create({fontFamily: "Arial", fontSize: 6})})
//                     ]
//                   })
//                 ]
//               }),
//             ]
//           })]
//       });
//     }
//
//     // function str2ab(str): Uint8Array {
//     //   let buf = new ArrayBuffer(str.length); // 2 bytes for each char
//     //   let bufView = new Uint8Array(buf);
//     //   for (let i = 0, strLen = str.length; i < strLen; i++) {
//     //     bufView[i] = str.charCodeAt(i);
//     //   }
//     //   return bufView;
//     // }
//
//
//     const exportAbstractImageFunc = (_format: ImageFormat, _image: AbstractImage.AbstractImage, _scale: number): ExportedImage => {
//       // console.log(`${format},${image},${scale}`);
//       return {format: "SVG", output: new Uint8Array(0)};
//       // Should export PNG not SVG
//       // return {
//       //   format: "SVG",
//       //   output: str2ab(AbstractImageExporters.createSVG(image)),
//       // };
//     };
//
//     DocxDocumentRenderer.exportToDocx(exportAbstractImageFunc, doc)
//       .then((result) => {
//         assert.isOk(result);
//         fs.writeFileSync("my2.docx", new Buffer(result));
//         done();
//       });
//
//
//   })
//   ;
//
//
//   it("should handle special chars", (done) => {
//
//     const pageStyle = PageStyle.create({paperSize: "A4", orientation: "Portrait", header: HeaderStyle.create({marginBottom: 5.0 * 595.0 / 210.0})});
//     const page = MasterPage.create({style: pageStyle});
//
//     // const builder = new DocumentBuilder();
//     // builder.beginSection(page);
//     // builder.beginParagraph();
//     // builder.insertTextRun2("Should <handle> \\special 'chars'.", TextProperties.create("Arial", 14, false, false, false, "#007385", false, false));
//     // builder.endParagraph();
//     // builder.endSection();
//     // const doc = builder.build();
//     // console.log("doc2", JSON.stringify(doc2));
//
//     const doc = AbstractDoc.AbstractDoc.create({
//       children: [Section.create({
//         page,
//         children: [
//           Paragraph.create({
//             paragraphProperties: ParagraphProperties.create(),
//             textProperties: TextProperties.create(),
//             children: [
//               TextRun.create({
//                 text: "Should <handle> \\special 'chars'.",
//                 textProperties: TextProperties.create({fontFamily: "Arial", fontSize: 14, color: "#007385",}),
//               })
//             ]
//           })
//         ]
//       })], styles: DefaultStyles.createDefaultAndStandardStyles(),
//     });
//     // console.log("doc", JSON.stringify(doc));
//
//     // function str2ab(str): Uint8Array {
//     //   let buf = new ArrayBuffer(str.length); // 2 bytes for each char
//     //   let bufView = new Uint8Array(buf);
//     //   for (let i = 0, strLen = str.length; i < strLen; i++) {
//     //     bufView[i] = str.charCodeAt(i);
//     //   }
//     //   return bufView;
//     // }
//
//
//     const exportAbstractImageFunc = (format: ImageFormat, image: AbstractImage.AbstractImage, scale: number): ExportedImage => {
//       console.log(`${format},${image},${scale}`);
//       return {format: "SVG", output: new Uint8Array(0)};
//       // Should export PNG not SVG
//       // return {
//       //   format: "SVG",
//       //   output: str2ab(AbstractImageExporters.createSVG(image)),
//       // };
//     };
//
//     DocxDocumentRenderer.exportToDocx(exportAbstractImageFunc, doc)
//       .then((result) => {
//         assert.isOk(result);
//         fs.writeFileSync("my2_chars.docx", new Buffer(result));
//         done();
//       });
//
//
//   });
//
// })
// ;
