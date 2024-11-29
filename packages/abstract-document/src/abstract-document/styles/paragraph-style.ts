import * as TextStyle from "./text-style.js";
import * as LayoutFoundation from "../primitives/layout-foundation.js";
import * as Position from "./position.js";

export type TextAlignment = "Start" | "Center" | "End" | "Justify";

export interface ParagraphStyle {
  readonly type: "ParagraphStyle";
  readonly position: Position.Position;
  readonly alignment?: TextAlignment;
  readonly margins: LayoutFoundation.LayoutFoundation;
  readonly textStyle: TextStyle.TextStyle;
}

export interface ParagraphStyleProps {
  readonly position?: Position.Position;
  readonly alignment?: TextAlignment;
  readonly margins?: LayoutFoundation.LayoutFoundation;
  readonly textStyle?: TextStyle.TextStyle;
}

export function create(props?: ParagraphStyleProps): ParagraphStyle {
  const {
    alignment = undefined,
    margins = LayoutFoundation.create(),
    position = "relative",
    textStyle = TextStyle.create(),
  } = props || {};
  return {
    type: "ParagraphStyle",
    alignment,
    margins,
    position,
    textStyle,
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
    textStyle: TextStyle.overrideWith(a.textStyle, b.textStyle),
  });
}
