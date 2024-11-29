import * as SectionElement from "../section-elements/section-element.js";
import * as TableCellStyle from "../styles/table-cell-style.js";

export interface TableCell {
  readonly styleName: string;
  readonly columnSpan: number;
  readonly rowSpan: number;
  readonly style?: TableCellStyle.TableCellStyle;
  readonly children: ReadonlyArray<SectionElement.SectionElement>;
  readonly dummy?: boolean;
}

export interface TableCellProps {
  readonly styleName?: string;
  readonly columnSpan?: number;
  readonly rowSpan?: number;
  readonly style?: TableCellStyle.TableCellStyle;
  readonly dummy?: boolean;
}

export function create(props?: TableCellProps, children?: ReadonlyArray<SectionElement.SectionElement>): TableCell {
  const { styleName = "", columnSpan = 1, rowSpan = 1, style = TableCellStyle.create(), dummy = false } = props || {};
  return {
    styleName,
    columnSpan,
    rowSpan,
    style,
    dummy,
    children: children || [],
  };
}
