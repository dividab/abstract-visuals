import { Resources } from "../resources.js";
import * as TableRow from "../table/table-row.js";
import * as TableStyle from "../styles/table-style.js";

export const sectionType = "Table";

export type Table = Resources & {
  readonly type: typeof sectionType;
  readonly columnWidths: ReadonlyArray<number>;
  readonly styleName: string;
  readonly style: TableStyle.TableStyle;
  readonly headerRows: ReadonlyArray<TableRow.TableRow>;
  readonly children: ReadonlyArray<TableRow.TableRow>;
};

export type TableProps = Resources & {
  readonly columnWidths: ReadonlyArray<number>;
  readonly styleName?: string;
  readonly headerRows?: ReadonlyArray<TableRow.TableRow>;
  readonly style?: TableStyle.TableStyle;
};

export function create(props: TableProps, children?: ReadonlyArray<TableRow.TableRow>): Table {
  const { columnWidths, styleName = "", headerRows, style = TableStyle.create(), ...rest } = props;
  return {
    type: sectionType,
    columnWidths,
    styleName,
    style,
    headerRows: headerRows || [],
    children: children || [],
    ...rest,
  };
}
