declare module "pdfkit/js/pdfkit.standalone.js" {
  import PDFDocument = require("pdfkit");
  // reuse official types
  export = PDFDocument;
}
