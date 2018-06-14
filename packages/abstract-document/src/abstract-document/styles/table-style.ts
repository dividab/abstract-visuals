import * as LayoutFoundation from "../primitives/layout-foundation";
import * as TableCellStyle from "./table-cell-style";

export type TableAlignment = "Left" | "Center" | "Right";

export interface TableStyle {
  readonly type: "TableStyle";
  readonly margins: LayoutFoundation.LayoutFoundation;
  readonly alignment?: TableAlignment;
  readonly cellStyle: TableCellStyle.TableCellStyle;
}

export interface TableStyleProps {
  readonly margins?: LayoutFoundation.LayoutFoundation;
  readonly alignment?: TableAlignment;
  readonly cellStyle?: TableCellStyle.TableCellStyle;
}

export function create(props?: TableStyleProps): TableStyle {
  const {
    margins = LayoutFoundation.create(),
    alignment = undefined,
    cellStyle = TableCellStyle.create()
  } =
    props || {};
  return {
    type: "TableStyle",
    margins,
    alignment,
    cellStyle
  };
}

export function overrideWith(
  overrider: TableStyle,
  toOverride: TableStyle
): TableStyle {
  const a: TableStyleProps = overrider || {};
  const b: TableStyleProps = toOverride || {};
  return create({
    margins: LayoutFoundation.overrideWith(a.margins, b.margins),
    alignment: a.alignment || b.alignment,
    cellStyle: TableCellStyle.overrideWith(a.cellStyle, b.cellStyle)
  });
}
