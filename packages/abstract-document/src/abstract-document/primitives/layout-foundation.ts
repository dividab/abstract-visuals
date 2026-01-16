export interface LayoutFoundation {
  readonly bottom?: number;
  readonly left?: number;
  readonly right?: number;
  readonly top?: number;
}

export function create(props?: LayoutFoundation): LayoutFoundation {
  return {
    top: props?.top ?? 0,
    bottom: props?.bottom ?? 0,
    left: props?.left ?? 0,
    right: props?.right ?? 0
  };
}

export function orDefault(layout: LayoutFoundation | undefined): Required<LayoutFoundation> {
  return {
    top: layout?.top ?? 0,
    bottom: layout?.bottom ?? 0,
    left: layout?.left ?? 0,
    right: layout?.right ?? 0,
  };
}

export function overrideWith(
  overrider: LayoutFoundation | undefined,
  toOverride: LayoutFoundation | undefined
): LayoutFoundation {
  const a = overrider;
  const b = toOverride;
  return {
    top: a?.top ?? b?.top,
    bottom: a?.bottom ?? b?.bottom,
    left: a?.left ?? b?.left,
    right: a?.right ?? b?.right,
  };
}
