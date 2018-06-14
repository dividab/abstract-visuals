import * as SectionElement from "../section-elements/section-element";
import * as TableCellStyle from "../styles/table-cell-style";

export interface TableCell {
  readonly styleName: string;
  readonly columnSpan: number;
  readonly style?: TableCellStyle.TableCellStyle;
  readonly children: Array<SectionElement.SectionElement>;
}

export interface TableCellProps {
  readonly styleName?: string;
  readonly columnSpan?: number;
  readonly style?: TableCellStyle.TableCellStyle;
  readonly children?: Array<SectionElement.SectionElement>;
}

export function create(props?: TableCellProps): TableCell {
  const {
    styleName = "",
    columnSpan = 1,
    style = TableCellStyle.create(),
    children = []
  } =
    props || {};
  return {
    styleName,
    columnSpan,
    style,
    children
  };
}
