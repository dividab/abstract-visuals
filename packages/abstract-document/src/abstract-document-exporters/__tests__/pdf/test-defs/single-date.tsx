// Disabled for now, cant compare the width of the date as it changes every day

// import React from "react";
// import { ExportTestDef } from "../export-test-def";
// import * as AD from "../../../../index";
// import { Paragraph, AbstractDoc, Section, TextField } from "../../../../abstract-document-jsx";

// const pdfKit = require("../pdfkit");

// const pdf = new pdfKit();

// export const test: ExportTestDef = {
//   name: "Single date",
//   skip: true,
//   abstractDocJsx: (
//     <AbstractDoc>
//       <Section>
//         <Paragraph>
//           <TextField fieldType="Date" />
//         </Paragraph>
//       </Section>
//     </AbstractDoc>
//   ),
//   expectedPdfJson: {
//     formImage: {
//       Agency: "",
//       Id: {
//         AgencyId: "",
//         MC: false,
//         Max: 1,
//         Name: "",
//         Parent: "",
//       },
//       Pages: [
//         {
//           Boxsets: [],
//           Fields: [],
//           Fills: [
//             {
//               clr: 1,
//               h: 0,
//               w: 0,
//               x: 0,
//               y: 0,
//             },
//           ],
//           HLines: [],
//           Height: 52.625,
//           Texts: [
//             {
//               A: "left",
//               R: [
//                 {
//                   S: -1,
//                   T: encodeURIComponent(new Date(Date.now()).toDateString()),
//                   TS: [0, 13, 0, 0],
//                 },
//               ],
//               clr: 0,
//               sw: 0.32553125,
//               w: 0, // Cant compare width as its changing every day
//               x: -0.25,
//               y: -0.301,
//             },
//           ],
//           VLines: [],
//         },
//       ],
//       Transcoder: "pdf2json@1.2.3 [https://github.com/modesty/pdf2json]",
//       Width: 37.188,
//     },
//   },
// };
