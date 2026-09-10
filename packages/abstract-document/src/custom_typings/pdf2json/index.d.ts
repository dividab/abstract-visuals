declare module "pdf2json" {
  // oxlint-disable-next-line no-redeclare -- value + type share a name, the standard pattern for typing a constructible class from an untyped module
  interface PDFParser {
    on: ((event: "pdfParser_dataError", callback: (data: { parserError: string }) => void) => void) &
      ((event: "pdfParser_dataReady", callback: (data: unknown) => void) => void);
    parseBuffer: (buffer: Buffer) => void;
  }
  const PDFParser: new () => PDFParser;
  export default PDFParser;
}
