import * as PdfkitModule from "pdfkit";
import Helvetica from "pdfkit/standard-fonts/Helvetica";
import HelveticaBold from "pdfkit/standard-fonts/HelveticaBold";
import HelveticaBoldOblique from "pdfkit/standard-fonts/HelveticaBoldOblique";
import HelveticaOblique from "pdfkit/standard-fonts/HelveticaOblique";

// pdfkit's browser build doesn't bundle standard font data and requires registering it
// explicitly via `registerStdFonts` before it's used, or `.font("Helvetica")` (the default
// fallback in font.ts) throws. The Node build loads standard fonts lazily from pdfkit's
// package directory, which fails once pdfkit is bundled into another file, so they're
// registered there too. pdfkit 0.20's Node build doesn't export `registerStdFonts`, so this
// reads it off the namespace object with a feature check instead of a named import - a named
// import of a binding that doesn't exist would fail to resolve under Node's ESM loader.
const pdfkitExports = PdfkitModule as unknown as {
  registerStdFonts?: (...fonts: ReadonlyArray<unknown>) => void;
};

// oxlint-disable-next-line functional/no-let
let registered = false;

export function registerDefaultStdFonts(): void {
  if (registered || typeof pdfkitExports.registerStdFonts !== "function") {
    return;
  }
  pdfkitExports.registerStdFonts(Helvetica, HelveticaBold, HelveticaOblique, HelveticaBoldOblique);
  registered = true;
}
