import type { TableCell } from "./table-cell.js";

export interface TableRow {
  readonly children: ReadonlyArray<TableCell>;
}

export type TableRowProps = object;

export function create(_props?: TableRowProps, children?: ReadonlyArray<TableCell>): TableRow {
  return {
    children: children ?? [],
  };
}
