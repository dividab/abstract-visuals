import { Resources } from "../resources";
import * as TableRow from "../table/table-row";
import * as TableStyle from "../styles/table-style";

export type Table = Resources & {
  readonly type: "Table";
  readonly columnWidths: Array<number>;
  readonly styleName: string;
  readonly style: TableStyle.TableStyle;
  readonly children: Array<TableRow.TableRow>;
};

export type TableProps = Resources & {
  readonly columnWidths: Array<number>;
  readonly styleName?: string;
  readonly style?: TableStyle.TableStyle;
  readonly children?: Array<TableRow.TableRow>;
};

export function create(props: TableProps): Table {
  const {
    columnWidths,
    styleName = "",
    style = TableStyle.create(),
    children = [],
    ...rest
  } = props;
  return {
    type: "Table",
    columnWidths,
    styleName,
    style,
    children,
    ...rest
  };
}
