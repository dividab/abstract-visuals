import * as LayoutFoundation from "../primitives/layout-foundation.js";
import * as TableCellStyle from "./table-cell-style.js";
import * as Position from "./position.js";

export type TableAlignment = "Left" | "Center" | "Right";

export interface TableStyle {
  readonly type: "TableStyle";
  readonly margins: LayoutFoundation.LayoutFoundation;
  readonly position: Position.Position;
  readonly alignment?: TableAlignment;
  readonly cellStyle: TableCellStyle.TableCellStyle;
}

export interface TableStyleProps {
  readonly position?: Position.Position;
  readonly margins?: LayoutFoundation.LayoutFoundation;
  readonly alignment?: TableAlignment;
  readonly cellStyle?: TableCellStyle.TableCellStyle;
}

export function create(props?: TableStyleProps): TableStyle {
  const {
    margins = LayoutFoundation.create(),
    alignment = undefined,
    position = "relative",
    cellStyle = TableCellStyle.create(),
  } = props || {};
  return {
    type: "TableStyle",
    position,
    margins,
    alignment,
    cellStyle,
  };
}

export function overrideWith(overrider: TableStyle, toOverride: TableStyle): TableStyle {
  const a: TableStyleProps = overrider || {};
  const b: TableStyleProps = toOverride || {};
  return create({
    margins: LayoutFoundation.overrideWith(a.margins, b.margins),
    alignment: a.alignment || b.alignment,
    cellStyle: TableCellStyle.overrideWith(a.cellStyle, b.cellStyle),
  });
}
