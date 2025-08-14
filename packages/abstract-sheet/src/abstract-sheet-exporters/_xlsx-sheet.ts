import { WorkSheet, CellObject, utils, ColInfo, RowInfo } from "xlsx-js-style";
import { CellType, Sheet } from "../abstract-sheet/abstract-sheet.js";

export function xlsxWorkSheet(sheet: Sheet, styles: Record<string, any>): WorkSheet {
  let colMax = -1;
  const cells: Record<string, CellObject> = {};
  for (let ri = 0; ri < sheet.cells.length; ri++) {
    const r = sheet.cells[ri]!;
    colMax = Math.max(r.length, colMax);
    for (let ci = 0; ci < r.length; ci++) {
      const c = r[ci]!;
      let s: Object | undefined = undefined;
      if (c.styles !== undefined) {
        for (const style of c.styles) {
          s = { ...s!, ...styles[style] };
        }
      }
      const key = sheet.direction === "col" ? `${utils.encode_col(ri)}${ci + 1}` : `${utils.encode_col(ci)}${ri + 1}`;
      cells[key] = { v: c.value, t: cellObject(c.type), s };
    }
  }

  return {
    "!type": "sheet",
    "!ref": `A1:${
      sheet.direction === "col"
        ? `${utils.encode_col(sheet.cells.length)}${colMax}`
        : `${utils.encode_col(colMax)}${sheet.cells.length}`
    }`,
    "!cols": sheet.colInfo?.map((i): ColInfo => ({ wpx: i.widthPixels ?? 64, hidden: i.hidden })),
    "!rows": sheet.rowInfo?.map((i): RowInfo => ({ hpx: i.heightPixels ?? 15, hidden: i.hidden })),
    ...cells,
  };
}

const cellObject = (colType: CellType | undefined): CellObject["t"] => {
  switch (colType) {
    case "number":
      return "n";
    case "boolean":
      return "b";
    case "date":
      return "d";
    case undefined:
    case "string":
      return "s";
    default:
      exhaustiveCheck(colType);
      return "s";
  }
};

const exhaustiveCheck = (check: never): never => check;

//dummy
