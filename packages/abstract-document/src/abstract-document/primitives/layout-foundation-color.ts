export interface LayoutFoundationColor {
  readonly bottom: string;
  readonly left: string;
  readonly right: string;
  readonly top: string;
}

export interface LayoutFoundationColorProps {
  readonly bottom?: string;
  readonly left?: string;
  readonly right?: string;
  readonly top?: string;
}

export function create(props?: LayoutFoundationColorProps): LayoutFoundationColor {
  const { top = "", bottom = "", left = "", right = "" } = props || {};
  return {
    top,
    bottom,
    left,
    right,
  };
}

export function overrideWith(
  overrider: LayoutFoundationColor | undefined,
  toOverride: LayoutFoundationColor | undefined
): LayoutFoundationColor {
  const a = overrider || create();
  const b = toOverride || create();
  return create({
    top: a.top || b.top,
    bottom: a.bottom || b.bottom,
    left: a.left || b.left,
    right: a.right || b.right,
  });
}
