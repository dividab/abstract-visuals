import * as LayoutFoundation from "../primitives/layout-foundation";

export type RowAlignment = "Top" | "Middle" | "Bottom";

export interface TableCellStyle {
  readonly type: "TableCellStyle";
  readonly background?: string;
  readonly borders: LayoutFoundation.LayoutFoundation;
  readonly borderColor?: string;
  readonly padding: LayoutFoundation.LayoutFoundation;
  readonly verticalAlignment?: RowAlignment;
}

export interface TableCellStyleProps {
  readonly background?: string;
  readonly borders?: LayoutFoundation.LayoutFoundation;
  readonly borderColor?: string;
  readonly padding?: LayoutFoundation.LayoutFoundation;
  readonly verticalAlignment?: RowAlignment;
}

export function create(props?: TableCellStyleProps): TableCellStyle {
  const {
    background = undefined,
    borders = LayoutFoundation.create(),
    borderColor = undefined,
    padding = LayoutFoundation.create(),
    verticalAlignment = undefined
  } =
    props || {};
  return {
    type: "TableCellStyle",
    background,
    borders,
    borderColor,
    padding,
    verticalAlignment
  };
}

export function overrideWith(
  overrider: TableCellStyle | undefined,
  toOverride: TableCellStyle | undefined
): TableCellStyle {
  const a: TableCellStyleProps = overrider || {};
  const b: TableCellStyleProps = toOverride || {};
  return create({
    background: a.background || b.background,
    borders: LayoutFoundation.overrideWith(a.borders, b.borders),
    borderColor: a.borderColor || b.borderColor,
    padding: LayoutFoundation.overrideWith(a.padding, b.padding),
    verticalAlignment: a.verticalAlignment || b.verticalAlignment
  });
}
