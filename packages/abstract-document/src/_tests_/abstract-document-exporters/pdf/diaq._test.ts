// import * as ADPdf from "../../../src/abstract-document-exporters/pdf/render";
// // import {assert} from "chai";
// import * as fs from "fs";
// import * as path from "path";
// import {generateDescriptionReport} from "../test-utils/diaq-reports/product-description";
// import {BitmapImage} from "../test-utils/diaq-reports/common";
//
// const productDescriptionData = {
//   productId: "12345678-9abc-def0-1234-5789abcdef01",
//   productCodes: [{type: "main", code: "TEST-0-00", m3: "123456"}],
//   description: `### Description
// Single skin rectangular or square Variable air flow control terminal unit is commonly
// used for supply air applications or for return air applications at low to medium system
// pressures. Optima-S VAV terminal units are ideal for multi-zone control with supply
// and return in Master and Slave setup such as offices, hotel rooms or meeting rooms
// where the required cooling and heating load will vary on demand.
//
// #### Highlights:
// • Damper tightness class 3 or 4 (depending on size)
// according to EN 1751
// • Casing tightness class C according to EN 1751
// • High measuring accuracy of 5%
// • Air volume range of 144 to 56160 m3/h
// • Operating range of up to 1000 Pa
//
// #### Accessories for OPTIMA-S:
// • Attenuators Optima-ASB
// Silencers are available to reduce the discharge sound
// power levels when required.
//
// #### Design
// Optima-S units are constructed from sheet steel frame and Aluminium profile blades. The frame construction contains a robust flanged mounting
// frame to assure the sturdiness of the unit and to facilitate the mounting to upstream and downstream ducts.
// The aerofoil blades are opposed action and are constructed from extruded aluminium and enforce corrosionfree throughout the blade to add rigidity
// and reduce the pressure loss and sound levels which may be contributed to airflow stream passing over the blades. The blades are equipped by
// rubber gaskets eliminating leakage in closed position. The blade axe are sitting in self lubricating bearings which are connected together by a gear
// wheel - rod combination to assure a smooth ratio and transition from blade to blade. The pressure difference averaging measuring cross is applied for
// a precise flow measurement and control.
//
// #### Available sizes:
// 200 × 100 mm to 1200 × 1000 mm with steps of 50 mm in height and length
// `,
// // #### Controls
// // The VAV terminal units are as standard equipped with BLC (Belimo compact) controllers (LMV-D3 or NMV-D3) without any bus- communication
// // capability to be used as stand alone or in master and slave setting. The compact controllers are equally available with MPBus,
// // ModBus and LON communication capability. On demand as alternative, gateway communication units can be provided and can be connected later
// // in time to building management systems to create a zone control by creating bus-rings solutions (only possible if MP-Bus or Modbus communication
// // is installed).
// // VAV and Compact controllers are factory calibrated as standard to the air volume indicated in the table or upon request can be adjusted to site
// // required settings prior to dispatch on Vmin and Vmax range. The air volumes can also be readjusted on site with ZTH-Gen hand held
// // service tool or, for the type OPTIMA-S-...GO... by dials on the controller. If specific air volumes for Vmin and Vmax would be required, this must be
// // indicated prior to order of the units for adequate calibration in the factory.
// // • BLC1 = Belimo LMV-D3 compact controller WITH MP-Bus communication
// // • BLC4 = Belimo LMV-D3 compact controller WITHOUT MPBus communication
// // • BLC1-MOD = Belimo LMV-D3 compact controller WITH MODBUS communication
// // • GO = Compact controller with parametrizing dials and display for immediate adjustment at site.
//
// // #### Mounting
// // On duct installations after elbow, reduction, T-branch etc. L to be min. 3 times duct equivalent effective diameter (Deff).
// // If L can not be respected, then minimum of 2 × Deff with perforated equalizing grid should be installed
// // `,
//   productImage: loadPNG(path.normalize(path.join(__dirname, "../test-utils/diaq-reports/product-image.jpeg")), 400, 400),
//   reportType: "Product Description",
//   reportDate: "1970-01-01",
//   generatedBy: "Testrunner",
//
//   logotype: loadPNG(path.normalize(path.join(__dirname, "../test-utils/diaq-reports/company-logo.png")), 90, 20),
//   language: "sv-SE", // FIXME: ALTERNATE THIS!
//   measureSystem: "SI", // FIXME: ALTERNATE THIS!
// };
//
// function loadPNG(fileName: string, width: number, height: number): BitmapImage {
//   return {
//     name: path.basename(fileName),
//     width: width,
//     height: height,
//     data: new Uint8Array(fs.readFileSync(fileName)),
//   }
// }
//
// describe("PdfExporter should export DIAQ reports", () => {
//   it.skip("product description", function(done) {
//     const doc = generateDescriptionReport(productDescriptionData);
//     let stream = fs.createWriteStream("diaq-description.pdf");
//     stream.on('finish', function() { done(); });
//     ADPdf.exportToPdf(doc, stream);
//   });
//
// });
//
//
