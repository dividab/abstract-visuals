import { TableCell } from "./table-cell.js";

export interface TableRow {
  readonly children: ReadonlyArray<TableCell>;
}

export interface TableRowProps {}

export function create(props?: TableRowProps, children?: ReadonlyArray<TableCell>): TableRow {
  const {} = props || {};
  return {
    children: children || [],
  };
}
