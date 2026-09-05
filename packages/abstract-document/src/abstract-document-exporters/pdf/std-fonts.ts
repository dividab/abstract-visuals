import * as PdfkitModule from "pdfkit";
import Helvetica from "pdfkit/standard-fonts/Helvetica";
import HelveticaBold from "pdfkit/standard-fonts/HelveticaBold";
import HelveticaOblique from "pdfkit/standard-fonts/HelveticaOblique";
import HelveticaBoldOblique from "pdfkit/standard-fonts/HelveticaBoldOblique";

// pdfkit 0.20's browser build stopped bundling standard font data and requires
// registering it explicitly via `registerStdFonts` before it's used, or `.font("Helvetica")`
// (the default fallback in font.ts) throws. The Node build self-registers standard fonts
// lazily instead and doesn't export `registerStdFonts` at all, so this reads it off the
// namespace object with a feature check instead of a named import - a named import of a
// binding that doesn't exist would fail to resolve entirely under Node's ESM loader.
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
