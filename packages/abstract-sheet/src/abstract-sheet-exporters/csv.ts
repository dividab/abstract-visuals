import * as XLSX from "xlsx-js-style";
import { AbstractSheet } from "../abstract-sheet/abstract-sheet";
import { createStyle, xlsxWorkSheet } from "./_xlsx-sheet";

export type CsvFile = { readonly name: string; readonly csv: string };

export function toCsv(
  as: AbstractSheet,
  options?: {
    readonly separator?: string;
    readonly rowSeparator?: string;
    readonly noTrailingSeparator?: boolean;
    readonly blankRows?: boolean;
    readonly skipHidden?: boolean;
    readonly forceQuotes?: boolean;
    readonly rawNumber?: boolean;
    readonly dateFormat?: string;
  }
): ReadonlyArray<CsvFile> {
  const styles = Object.fromEntries(as.styles?.map((s) => [s.name, createStyle(s)]) ?? []);
  const mappedOptions: XLSX.Sheet2CSVOpts | undefined = options
    ? {
        FS: options.separator,
        RS: options.rowSeparator,
        strip: options.noTrailingSeparator,
        blankrows: options.blankRows,
        skipHidden: options.skipHidden,
        forceQuotes: options.forceQuotes,
        rawNumbers: options.rawNumber,
        dateNF: options.dateFormat,
      }
    : undefined;
  return as.sheets.map(
    (s): CsvFile => ({ name: s.name, csv: XLSX.utils.sheet_to_csv(xlsxWorkSheet(s, styles), mappedOptions) })
  );
}
