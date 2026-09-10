declare module "svg-to-pdfkit" {
  function svgToPdfKit(doc: PDFKit.PDFDocument, svg: string, x: number, y: number, options?: Record<string, unknown>): void;
  export default svgToPdfKit;
}
