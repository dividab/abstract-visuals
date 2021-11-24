import { Resources } from "../resources";
import * as TableRow from "../table/table-row";
import * as TableStyle from "../styles/table-style";

export type Table = Resources & {
  readonly type: "Table";
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
    type: "Table",
    columnWidths,
    styleName,
    style,
    headerRows: headerRows || [],
    children: children || [],
    ...rest,
  };
}
