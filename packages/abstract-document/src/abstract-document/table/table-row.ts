import { TableCell } from "./table-cell";

export interface TableRow {
  readonly children: Array<TableCell>;
}

export interface TableRowProps {
  readonly children?: Array<TableCell>;
}

export function create(props?: TableRowProps): TableRow {
  const { children = [] } = props || {};
  return {
    children
  };
}
