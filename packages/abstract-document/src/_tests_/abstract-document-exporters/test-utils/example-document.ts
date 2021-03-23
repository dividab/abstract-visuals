// import {
//   MasterPage, PageStyle, HeaderStyle, DefaultStyles,
//   TextProperties, Section, Paragraph, HyperLink, Table, TableRow, TableCell, TextRun, ImageResource, Image
// } from "../../../src/abstract-document/index";
// import * as AbstractDoc from "../../../src/abstract-document/abstract-doc";
// import * as AI from "../../../src/abstract-image";
// import * as fs from "fs";
//
// export function generateExample(): AbstractDoc.AbstractDoc {
//
//   const pageStyle = PageStyle.create({paperSize: "A4", orientation: "Portrait", header: HeaderStyle.create({marginBottom: 5.0 * 595.0 / 210.0})});
//   const page = MasterPage.create({style: pageStyle});
//
//   /*
//    const builder = new DocumentBuilder();
//
//    builder.beginSection(page);
//    builder.beginTable([Infinity, Infinity], true);
//
//    builder.beginTableRow();
//    builder.beginTableCell();
//    builder.beginParagraph();
//    builder.insertTextRun2("NOVA-A-1-2-400X150-H-AN", TextProperties.create({
//    fontFamily: "Helvetica",
//    fontSize: 14,
//    underline: false,
//    bold: false,
//    italic: false,
//    color: "#007385",
//    subScript: false,
//    superScript: false
//    }));
//    builder.endParagraph();
//    builder.endTableCell();
//
//    builder.beginTableCell();
//    builder.beginParagraph();
//    builder.insertTextRun2("Test", TextProperties.create({
//    fontFamily: "Helvetica",
//    fontSize: 10,
//    underline: false,
//    bold: false,
//    italic: false,
//    color: "black",
//    subScript: false,
//    superScript: false
//    }));
//    builder.endParagraph();
//    builder.endTableCell();
//
//    builder.endTableRow();
//
//    builder.beginTableRow();
//
//    builder.beginTableCell();
//    builder.beginParagraph();
//    builder.insertTextRun2("Test", TextProperties.create({
//    fontFamily: "Helvetica",
//    fontSize: 10,
//    underline: false,
//    bold: false,
//    italic: false,
//    color: "black",
//    subScript: false,
//    superScript: false
//    }));
//    builder.endParagraph();
//    builder.endTableCell();
//
//    builder.beginTableCell();
//    builder.beginParagraph();
//    builder.insertTextRun2("Test", TextProperties.create({
//    fontFamily: "Helvetica",
//    fontSize: 10,
//    underline: false,
//    bold: false,
//    italic: false,
//    color: "black",
//    subScript: false,
//    superScript: false
//    }));
//    builder.endParagraph();
//    builder.endTableCell();
//
//    builder.endTableRow();
//
//    builder.endTable();
//
//    builder.beginParagraph();
//    builder.insertTextRun("bild1 star");
//    const b = fs.readFileSync("test/abstract-document-exporters/test-utils/googlelogo.png");
//    const png = new Uint8Array(b.buffer);
//    const components = [AI.createBitmapImage(AI.createPoint(0, 0), AI.createPoint(200, 200), "png", png)];
//    const image = AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(200, 200), AI.white, components);
//    builder.insertImageWithResource("a", image, 100, 100, 1);
//    builder.insertTextRun("end bild1");
//    builder.endParagraph();
//
//    builder.beginParagraph();
//    builder.insertTextRun("bild 2 start");
//    const components2 = [
//    AI.createRectangle(AI.createPoint(10, 10), AI.createPoint(180, 180), AI.blue, 2, AI.red),
//    AI.createText(AI.createPoint(10, 10), "Test", "Helvetica", 10, AI.black, "normal", 0, "left", "uniform", "uniform", 0, AI.black),
//    AI.createLine(AI.createPoint(25, 25), AI.createPoint(80, 60), AI.black, 2),
//    ];
//    const image2 = AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(200, 200), AI.white, components2);
//    builder.insertImageWithResource("b", image2, 100, 100, 1);
//    builder.insertTextRun("end bild 2");
//    builder.endParagraph();
//
//    builder.endSection();
//
//    const doc = builder.build();
//
//    */
//
//   const b = fs.readFileSync("abstract-document-exporters/test-utils/googlelogo.png");
//   const png = new Uint8Array(b.buffer);
//   const components = [AI.createBitmapImage(AI.createPoint(0, 0), AI.createPoint(200, 200), "png", png)];
//   const image = AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(200, 200), AI.white, components);
//   const imageResource = ImageResource.create({id: "a", abstractImage: image});
//
//   const components2 = [
//     AI.createRectangle(AI.createPoint(10, 10), AI.createPoint(180, 180), AI.blue, 2, AI.red),
//     AI.createText(AI.createPoint(10, 10), "Test", "Helvetica", 10, AI.black, "normal", 0, "left", "uniform", "uniform", 0, AI.black),
//     AI.createLine(AI.createPoint(25, 25), AI.createPoint(80, 60), AI.black, 2),
//   ];
//   const image2 = AI.createAbstractImage(AI.createPoint(0, 0), AI.createSize(200, 200), AI.white, components2);
//   const imageResource2 = ImageResource.create({id: "b", abstractImage: image2});
//
//   const doc = AbstractDoc.create({
//     imageResources: {"a": imageResource, "b": imageResource2},
//     children: [
//       Section.create({
//         page,
//         children: [Table.create({
//           columnWidths: [Infinity, Infinity],
//           children: [
//             TableRow.create({
//               height: 10, children: [
//                 TableCell.create({
//                   children: [
//                     Paragraph.create({
//                       children: [TextRun.create({
//                         text: "NOVA-A-1-2-400X150-H-AN", textProperties: TextProperties.create({fontFamily: "Helvetica", fontSize: 14, color: "#007385",})
//                       })]
//                     })
//                   ]
//                 }),
//                 TableCell.create({
//                   children: [
//                     Paragraph.create({
//                       children: [TextRun.create({text: "Test", textProperties: TextProperties.create({fontFamily: "Helvetica", fontSize: 10,})})]
//                     })
//                   ]
//                 })
//
//               ]
//             }),
//             TableRow.create({
//               height: 10, children: [
//                 TableCell.create({
//                   children: [
//                     Paragraph.create({
//                       children: [TextRun.create({text: "test", textProperties: TextProperties.create({fontFamily: "Helvetica", fontSize: 10,})})]
//                     })
//                   ]
//                 }),
//                 TableCell.create({
//                   children: [
//                     Paragraph.create({
//                       children: [TextRun.create({text: "Test", textProperties: TextProperties.create({fontFamily: "Helvetica", fontSize: 10})})]
//                     })
//                   ]
//                 })
//               ]
//             })
//           ]
//         }),
//           Paragraph.create({
//             children: [
//               TextRun.create({text: "bild 1 start", textProperties: TextProperties.create({fontFamily: "Helvetica", fontSize: 10})}),
//               Image.create({imageResource: imageResource, width: 100, height: 100}),
//               TextRun.create({text: "end bild 1", textProperties: TextProperties.create({fontFamily: "Helvetica", fontSize: 10})}),
//             ]
//           }),
//           Paragraph.create({
//             children: [
//               TextRun.create({text: "bild 2 start", textProperties: TextProperties.create({fontFamily: "Helvetica", fontSize: 10})}),
//               Image.create({imageResource: imageResource2, width: 100, height: 100}),
//               TextRun.create({text: "end bild 2", textProperties: TextProperties.create({fontFamily: "Helvetica", fontSize: 10})}),
//             ]
//           }),
//         ]
//       })
//     ],
//     styles: DefaultStyles.createDefaultAndStandardStyles(),
//   });
//
//   return doc;
// }
//
// export function generateHyperlink(): AbstractDoc.AbstractDoc {
//
//   const pageStyle = PageStyle.create({paperSize: "A4", orientation: "Portrait", header: HeaderStyle.create({marginBottom: 5.0 * 595.0 / 210.0})});
//   const page = MasterPage.create({style: pageStyle});
//
//   /*
//    const builder = new DocumentBuilder();
//
//    builder.beginSection(page);
//
//    builder.beginParagraph();
//    builder.insertHyperlink("this is a link to google", "https://www.google.com");
//    builder.endParagraph();
//
//    builder.endSection();
//
//    const doc = builder.build();
//    return doc;
//    */
//
//   return AbstractDoc.create({
//     children: [Section.create({
//       page: page, children: [
//         Paragraph.create({children: [HyperLink.create({text: "this is a link to google", target: "https://www.google.com"})]})
//       ]
//     })],
//     styles: DefaultStyles.createDefaultAndStandardStyles(),
//   });
//
// }
