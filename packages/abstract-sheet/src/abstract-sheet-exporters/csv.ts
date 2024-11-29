import * as XLSX from "xlsx-js-style";
import { AbstractSheet } from "../abstract-sheet/abstract-sheet.js";
import { xlsxWorkSheet } from "./_xlsx-sheet.js";
import { createStyle } from "./_style.js";

export type CsvFile = { readonly name: string; readonly csv: string };

export type CsvOptions = {
  readonly separator?: string;
  readonly rowSeparator?: string;
  readonly noTrailingSeparator?: boolean;
  readonly blankRows?: boolean;
  readonly skipHidden?: boolean;
  readonly forceQuotes?: boolean;
  readonly rawNumber?: boolean;
  readonly dateFormat?: string;
};

export function toCsv(
  abstractSheets: ReadonlyArray<AbstractSheet>,
  options?: CsvOptions
): ReadonlyArray<ReadonlyArray<CsvFile>> {
  return (abstractSheets as Array<AbstractSheet>).map((as) => {
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
  }) as unknown as ReadonlyArray<ReadonlyArray<CsvFile>>;
}
