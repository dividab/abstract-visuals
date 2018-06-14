export interface LayoutFoundation {
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
}

export interface LayoutFoundationProps {
  readonly bottom?: number;
  readonly left?: number;
  readonly right?: number;
  readonly top?: number;
}

export function create(props?: LayoutFoundationProps): LayoutFoundation {
  const { top = 0, bottom = 0, left = 0, right = 0 } = props || {};
  return {
    top,
    bottom,
    left,
    right
  };
}

export function overrideWith(
  overrider: LayoutFoundation | undefined,
  toOverride: LayoutFoundation | undefined
): LayoutFoundation {
  const a = overrider || create();
  const b = toOverride || create();
  return create({
    top: a.top || b.top,
    bottom: a.bottom || b.bottom,
    left: a.left || b.left,
    right: a.right || b.right
  });
}
