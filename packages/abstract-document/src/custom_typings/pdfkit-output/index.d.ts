declare module "pdfkit/output" {
  function toBlob(document: PDFKit.PDFDocument): Promise<Blob>;
  function toBytes(document: PDFKit.PDFDocument): Promise<Uint8Array>;
  export { toBlob, toBytes };
}
