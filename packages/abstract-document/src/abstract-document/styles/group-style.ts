import * as LayoutFoundation from "../primitives/layout-foundation.js";
import * as Position from "./position.js";

export interface GroupStyle {
  readonly type: "GroupStyle";
  readonly position: Position.Position;
  readonly margins: LayoutFoundation.LayoutFoundation;
}

export interface GroupStyleProps {
  readonly position?: Position.Position;
  readonly margins?: LayoutFoundation.LayoutFoundation;
}

export function create(props?: GroupStyleProps): GroupStyle {
  const { margins = LayoutFoundation.create(), position = "relative" } = props || {};
  return { type: "GroupStyle", margins, position };
}

export function overrideWith(overrider: GroupStyle | undefined, toOverride: GroupStyle | undefined): GroupStyle {
  const a: GroupStyleProps = overrider || {};
  const b: GroupStyleProps = toOverride || {};
  return create({
    margins: LayoutFoundation.overrideWith(a.margins, b.margins),
  });
}
