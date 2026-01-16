export interface LayoutFoundationColor {
  readonly bottom?: string;
  readonly left?: string;
  readonly right?: string;
  readonly top?: string;
}

export function create(props?: LayoutFoundationColor): LayoutFoundationColor {
  return {
    top: props?.top ?? "",
    bottom: props?.bottom ?? "",
    left: props?.left ?? "",
    right: props?.right ?? "",
  };
}

export function orDefault(colorLayout: LayoutFoundationColor | undefined): LayoutFoundationColor {
  return {
    top: colorLayout?.top ?? "",
    bottom: colorLayout?.bottom ?? "",
    left: colorLayout?.left ?? "",
    right: colorLayout?.right ?? "",
  };
}

export function overrideWith(
  overrider: LayoutFoundationColor | undefined,
  toOverride: LayoutFoundationColor | undefined
): LayoutFoundationColor {
  const a = overrider;
  const b = toOverride;
  return create({
    top: (a?.top ?? b?.top),
    bottom: (a?.bottom ?? b?.bottom),
    left: (a?.left ?? b?.left),
    right: (a?.right ?? b?.right),
  });
}
