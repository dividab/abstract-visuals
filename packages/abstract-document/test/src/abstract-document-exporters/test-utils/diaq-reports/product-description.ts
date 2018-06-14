// tslint:disable:max-line-length

// import {
//   AbstractDoc, MasterPage,
//   Section, Paragraph,
//   Table, TableRow, TableCell,
//   DefaultStyles, PageStyle, HeaderStyle, TextProperties,
//   TextRun, Markdown
//   // AbstractLength
// } from "../../../../src/abstract-document";
//
// // import * as AbstractImage from "../../../../src/abstract-image";
// import * as Diaq from "../../test-utils/diaq-reports/common";
// export type ProductDescriptionData = Diaq.ProductDescriptionData;
// export type CombinedImageResource = Diaq.CombinedImageResource;
//
//
// function header(data: ProductDescriptionData, page: MasterPage.MasterPage, imageLogo: CombinedImageResource): Table.Table {
//   return Table.create({
//     columnWidths: [
//       (MasterPage.getPrintableWidth(page) * 0.72),
//       (MasterPage.getPrintableWidth(page) * 0.28),
//     ],
//     children: [
//
//       TableRow.create({ children: [
//
//         TableCell.create({ children: [ Paragraph.create({ children: [ imageLogo.image ]})], }), // Systemair logo to the left
//
//         // 0.5 of page
//         TableCell.create({children: [
//           Table.create({
//             tableCellProperties: { padding: { top: 0, left: 0, right: 0, bottom: 0}, borders: { top: 0, left: 0, right: 0, bottom: 0}, },
//             columnWidths: [
//               (MasterPage.getPrintableWidth(page) * 0.12),
//               (MasterPage.getPrintableWidth(page) * 0.16),
//             ],
//             children: [
//               TableRow.create({children: [
//                 TableCell.create({ children: [ Paragraph.create({ paragraphProperties: { alignment: "End"}, children: [ TextRun.create({text: "Report type", textProperties: TextProperties.create({fontFamily: "Arial", fontSize: 8, bold: false})}) ]})] }), // Systemair logo to the left
//                 TableCell.create({ children: [ Paragraph.create({ paragraphProperties: { alignment: "End"}, children: [ TextRun.create({text: data.reportType, textProperties: TextProperties.create({fontFamily: "Arial", fontSize: 8, bold: true})}) ]})] }), // Systemair logo to the right
//               ]}),
//               TableRow.create({ children: [
//                 TableCell.create({ children: [ Paragraph.create({ paragraphProperties: { alignment: "End"}, children: [ TextRun.create({text: "Report date", textProperties: TextProperties.create({fontFamily: "Arial", fontSize: 8, bold: false})}) ]})] }), // Systemair logo to the left
//                 TableCell.create({ children: [ Paragraph.create({ paragraphProperties: { alignment: "End"}, children: [ TextRun.create({text: data.reportDate, textProperties: TextProperties.create({fontFamily: "Arial", fontSize: 8, bold: true})}) ]})] }), // Systemair logo to the right
//               ]}),
//               TableRow.create({ children: [
//                 TableCell.create({ children: [ Paragraph.create({ paragraphProperties: { alignment: "End"}, children: [ TextRun.create({text: "Generated by", textProperties: TextProperties.create({fontFamily: "Arial", fontSize: 8, bold: false})}) ]})] }), // Systemair logo to the left
//                 TableCell.create({ children: [ Paragraph.create({ paragraphProperties: { alignment: "End"}, children: [ TextRun.create({text: data.generatedBy, textProperties: TextProperties.create({fontFamily: "Arial", fontSize: 8, bold: true})}) ]})] }), // Systemair logo to the right
//               ]}),
//             ],
//           })
//
//
//
//           ],
//         }),
//
//       ]}),
//     ]
//   })
// }
//
//
// function bread(data: ProductDescriptionData, page: MasterPage.MasterPage, productImage: CombinedImageResource): Table.Table {
//   return Table.create({
//     columnWidths: [
//       (MasterPage.getPrintableWidth(page) * 0.5),
//       (MasterPage.getPrintableWidth(page) * 0.5),
//     ],
//     children: [
//
//       TableRow.create({ children: [
//         TableCell.create({ children: Markdown.create({text: data.description}) }), // Systemair logo to the left
//         TableCell.create({ children: [ Paragraph.create({ children: [ productImage.image ]})], }), // Systemair logo to the left
//
//       ],
//
//     }),
//
//   ]});
// }
//
//
//
// export function generateDescriptionReport(data: ProductDescriptionData): AbstractDoc.AbstractDoc {
//   const pageStyle = PageStyle.create({paperSize: "A4", orientation: "Portrait", header: HeaderStyle.create({marginBottom: 0 /*5.0 * 595.0 / 210.0*/})});
//   const page = MasterPage.create({style: pageStyle});
//
//   const imageLogo = Diaq.createImageResource({image: data.logotype});
//   const productImage = Diaq.createImageResource({image: data.productImage, width: (MasterPage.getPrintableWidth(page) * 0.5)});
//
//   const doc = AbstractDoc.create({
//     imageResources: {"logo": imageLogo.resource },
//
//     children: [
//       Section.create({
//         page, children: [
//           header(data, page, imageLogo),
//           bread(data, page, productImage),
//         ]
//       }),
//     ],
//     styles: DefaultStyles.createDefaultAndStandardStyles(),
//   });
//
//   return doc;
// }
