import XLSX from "xlsx-js-style";
import { AbstractSheet } from "../abstract-sheet/abstract-sheet.js";
import { xlsxWorkSheet } from "./_xlsx-sheet.js";
import { createStyle } from "./_style.js";

export function toXlsx(as: AbstractSheet): Buffer {
  const sheets: Record<string, XLSX.WorkSheet> = {};
  const sheetNames = Array<string>();

  const styles = Object.fromEntries(as.styles?.map((s) => [s.name, createStyle(s)]) ?? []);
  for (const s of as.sheets) {
    sheetNames.push(s.name);
    sheets[s.name] = xlsxWorkSheet(s, styles);
  }

  const wb: XLSX.WorkBook = { Sheets: sheets, SheetNames: Object.keys(sheets) };
  return XLSX.write(wb, { bookType: "xlsx", bookSST: false, type: "buffer" });
}
