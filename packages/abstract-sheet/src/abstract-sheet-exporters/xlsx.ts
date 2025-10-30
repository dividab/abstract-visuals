import XLSX from "xlsx-js-style";
import { AbstractSheet } from "../abstract-sheet/abstract-sheet.js";
import { xlsxWorkSheet } from "./_xlsx-sheet.js";
import { createStyle } from "./_style.js";
import * as fflate from "fflate";

export function toXlsx(as: AbstractSheet): Uint8Array<ArrayBuffer> {
  const sheets: Record<string, XLSX.WorkSheet> = {};

  const styles = Object.fromEntries(as.styles?.map((s) => [s.name, createStyle(s)]) ?? []);
  for (const s of as.sheets) {
    sheets[s.name] = xlsxWorkSheet(s, styles);
  }

  const wb: XLSX.WorkBook = { Sheets: sheets, SheetNames: Object.keys(sheets) };

  const buffer = XLSX.write(wb, {
    bookType: "xlsx",
    bookSST: false,
    type: "buffer",
    compression: true,
    cellDates: false,
  });

  // Remove metadata.xml to fix office repair warning
  try {
    return removeMetadata(buffer);
  } catch (e) {
    // If it fails just return the original buffer
    return buffer;
  }
}

const METADATA_CONTENT_TYPE_RX = /<Override PartName="\/xl\/metadata\.xml"[^>]*>/g;

const METADATA_RELATIONSHIP_RX =
  /<Relationship[^>]*Type="http:\/\/schemas\.openxmlformats\.org\/officeDocument\/2006\/relationships\/sheetMetadata"[^>]*\/>/g;

function removeMetadata(xlsxBuffer: Uint8Array<ArrayBuffer>): Uint8Array<ArrayBuffer> {
  const unzipped = fflate.unzipSync(new Uint8Array(xlsxBuffer));

  delete unzipped["xl/metadata.xml"];

  const contentTypesKey = "[Content_Types].xml";

  if (unzipped[contentTypesKey]) {
    let contentTypes = new TextDecoder().decode(unzipped[contentTypesKey]);

    contentTypes = contentTypes.replace(METADATA_CONTENT_TYPE_RX, "");
    unzipped[contentTypesKey] = new TextEncoder().encode(contentTypes);
  }

  const relsKey = "xl/_rels/workbook.xml.rels";

  if (unzipped[relsKey]) {
    let rels = new TextDecoder().decode(unzipped[relsKey]);
    rels = rels.replace(METADATA_RELATIONSHIP_RX, "");

    unzipped[relsKey] = new TextEncoder().encode(rels);
  }

  const rezipped = fflate.zipSync(unzipped, { level: 9 });

  return rezipped as Uint8Array<ArrayBuffer>;
}
