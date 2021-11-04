import { TableCell } from "./table-cell";

export interface TableRow {
  readonly children: Array<TableCell>;
}

export interface TableRowProps {}

export function create(props?: TableRowProps, children?: Array<TableCell>): TableRow {
  const {} = props || {};
  return {
    children: children || [],
  };
}
