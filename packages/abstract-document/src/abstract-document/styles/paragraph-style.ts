import * as TextStyle from "./text-style";
import * as LayoutFoundation from "../primitives/layout-foundation";

export type TextAlignment = "Start" | "Center" | "End" | "Justify";

export interface ParagraphStyle {
  readonly type: "ParagraphStyle";
  readonly alignment?: TextAlignment;
  readonly margins: LayoutFoundation.LayoutFoundation;
  readonly textStyle: TextStyle.TextStyle;
}

export interface ParagraphStyleProps {
  readonly alignment?: TextAlignment;
  readonly margins?: LayoutFoundation.LayoutFoundation;
  readonly textStyle?: TextStyle.TextStyle;
}

export function create(props?: ParagraphStyleProps): ParagraphStyle {
  const {
    alignment = undefined,
    margins = LayoutFoundation.create(),
    textStyle = TextStyle.create()
  } =
    props || {};
  return {
    type: "ParagraphStyle",
    alignment,
    margins,
    textStyle
  };
}

export function overrideWith(
  overrider: ParagraphStyle | undefined,
  toOverride: ParagraphStyle | undefined
): ParagraphStyle {
  const a: ParagraphStyleProps = overrider || {};
  const b: ParagraphStyleProps = toOverride || {};
  return create({
    alignment: a.alignment || b.alignment,
    margins: LayoutFoundation.overrideWith(a.margins, b.margins),
    textStyle: TextStyle.overrideWith(a.textStyle, b.textStyle)
  });
}
