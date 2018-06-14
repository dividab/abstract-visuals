//tslint:disable

// import {
//   AbstractDoc, MasterPage,
//   Section, Paragraph,
//   Table, TableRow, TableCell,
//   DefaultStyles, PageStyle, HeaderStyle, //TextProperties,
//   TextRun, Markdown
//   // AbstractLength
// } from "../../../src/abstract-document";
//
// const loremIpsum = `
// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
// Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?
//
// At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
// Et harum quidem rerum facilis est et expedita distinctio.
// Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.
// Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.
// Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.`
//
// const markdownTexts = [
// // SIMPLE
// `# Header 1
// This is a single line paragraph.
//
// ## Header 2
// This is the first multi-
// line paragraph.
//
// ## Header 2 again
// This is the second multi-
// line paragraph.
// `,
//
// // MORE ADVANCED
// `# One paragraph one line
// Testing styles *italic* + **bold** + 'FIX TEST FOR CODE' all in one line.
//
// # One paragraph two lines
// Testing styles *italic* + **bold** + 'FIX TEST FOR CODE' all in one line.
// Testing styles *italic* + **bold** + 'FIX TEST FOR CODE' all in one line.
// `,
//
// // MORE ADVANCED
// `# BUGS
//
// #### UTF-8 doesn't work
// Euro --> [\u20AC] <-- ... works!
//
// Swedish chars: åäöÅÄÖ ... swedish works!
//
// Crazy chars: & % < > / ... works!
//
// #### Bold and italic
// ***bold italic*** does not work
//
// #### Empty lines dissapears
// There should be an empty line after this one.
//
// There should be an empty line before this one.
//
// # Header 1
//
// *This* is some **paragraph** text.
//
// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
//
//
// ## Header 2
// This *is* some **paragraph** text
// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
//
// ### Header 3
// This is *some* **paragraph** text
// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
//
// #### Header 4
// This is some *paragraph* text.
//
// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
//
// ##### Header 5
// This is some **paragraph** *text*
// Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
//
// ###### Header 6
// *This is some paragraph text*
//
// **Lorem ipsum dolor sit amet**, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
//
// Should be empty lines above and below this line.
//
// Alternatively, for H1 and H2, an underline-ish style:
//
// Alt-H1
// ======
// This is normal text
// *this is bold text*
//
// Alt-H2
// ------
// ♯♫♬♩ The end of the world as we know it. ♬♫♩♫
// `
// ];
//
//
// export function generateText(): AbstractDoc.AbstractDoc {
//   const pageStyle = PageStyle.create({paperSize: "A4", orientation: "Portrait", header: HeaderStyle.create({marginBottom: 0 /*5.0 * 595.0 / 210.0*/})});
//   const page = MasterPage.create({style: pageStyle});
//
//   const doc = AbstractDoc.create({
//     imageResources: {},
//     children: [
//       Section.create({
//         page, children: [
//             Paragraph.create({ children: [ TextRun.create({ text: "This is a long\nmultiline text\nall of this text\nshould\nbe\non\nseparate\nlines\nbefore the ipsum below.\n\n" + loremIpsum}) ]}),
//         ]
//       }),
//     ],
//     styles: DefaultStyles.createDefaultAndStandardStyles(),
//   });
//
//   return doc;
// }
//
// export function generateMarkdownText(id: number): AbstractDoc.AbstractDoc {
//   const pageStyle = PageStyle.create({paperSize: "A4", orientation: "Portrait", header: HeaderStyle.create({marginBottom: 0 /*5.0 * 595.0 / 210.0*/})});
//   const page = MasterPage.create({style: pageStyle});
//
//   const doc = AbstractDoc.create({
//     imageResources: {},
//     children: [
//       Section.create({
//         page, children: Markdown.create({ text: markdownTexts[id] }),
//       }),
//     ],
//     styles: DefaultStyles.createDefaultAndStandardStyles(),
//   });
//
//   return doc;
// }
// // export function generateMixedContent(id: number): AbstractDoc.AbstractDoc {
// //   const pageStyle = PageStyle.create({paperSize: "A4", orientation: "Portrait", header: HeaderStyle.create({marginBottom: 0 /*5.0 * 595.0 / 210.0*/})});
// //   const page = MasterPage.create({style: pageStyle});
//
// //   const doc = AbstractDoc.create({
// //     imageResources: {},
// //     children: [
// //       Section.create({
// //         page, children: [
// //           Paragraph.create({ children: [ Markdown.create({ text: markdownTexts[id] }), TextRun.create({ text: markdownTexts[id] }) ]}),
// //         ]
// //       }),
// //     ],
// //     styles: DefaultStyles.createDefaultAndStandardStyles(),
// //   });
//
// //   return doc;
// // }
//
// export function generateTextInTable(): AbstractDoc.AbstractDoc {
//   const pageStyle = PageStyle.create({paperSize: "A4", orientation: "Portrait", header: HeaderStyle.create({marginBottom: 0 /*5.0 * 595.0 / 210.0*/})});
//   const page = MasterPage.create({style: pageStyle});
//   const doc = AbstractDoc.create({
//     imageResources: {},
//     children: [
//       Section.create({
//         page, children: [
//             // Paragraph.create({ atoms: [ TextRun.create({text: "This is the second\nmultiline text\nit is longer.\n\n" + loremIpsum}) ]}),
//             Table.create({
//                 columnWidths: [
//                 (MasterPage.getPrintableWidth(page) * 0.5),
//                 (MasterPage.getPrintableWidth(page) * 0.5),
//                 ],
//               children: [
//
//                 TableRow.create({ children: [
//                     TableCell.create({ children: [ Paragraph.create({ children: [ TextRun.create({text: "This is the first\nmultiline text\nit ends here.\n"}) ]})], }), // Systemair logo to the left
//                     TableCell.create({ children: [ Paragraph.create({ children: [ TextRun.create({text: "This is the second\nmultiline text\nit is longer.\n\n" + loremIpsum}) ]})], }), // Systemair logo to the left
//
//                 ],
//
//                 }),
//
//             ]})
//         ]
//       }),
//     ],
//     styles: DefaultStyles.createDefaultAndStandardStyles(),
//   });
//
//   return doc;
// }
