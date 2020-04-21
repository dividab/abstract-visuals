import * as SectionElement from "../section-elements/section-element";
import * as TableCellStyle from "../styles/table-cell-style";

export interface TableCell {
  readonly styleName: string;
  readonly columnSpan: number;
  readonly style?: TableCellStyle.TableCellStyle;
  readonly children: ReadonlyArray<SectionElement.SectionElement>;
}

export interface TableCellProps {
  readonly styleName?: string;
  readonly columnSpan?: number;
  readonly style?: TableCellStyle.TableCellStyle;
}

export function create(
  props?: TableCellProps,
  children?: ReadonlyArray<SectionElement.SectionElement>
): TableCell {
  const { styleName = "", columnSpan = 1, style = TableCellStyle.create() } =
    props || {};
  return {
    styleName,
    columnSpan,
    style,
    children: children || []
  };
}
