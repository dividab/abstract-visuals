export interface CornerRadius {
  readonly topLeft?: number;
  readonly topRight?: number;
  readonly bottomRight?: number;
  readonly bottomLeft?: number;
}

export function create(props?: CornerRadius): CornerRadius {
  return {
    topLeft: props?.topLeft,
    topRight: props?.topRight,
    bottomRight: props?.bottomRight,
    bottomLeft: props?.bottomLeft,
  };
}

export function overrideWith(overrider: CornerRadius | undefined, toOverride: CornerRadius | undefined): CornerRadius {
  return {
    topLeft: overrider?.topLeft ?? toOverride?.topLeft,
    topRight: overrider?.topRight ?? toOverride?.topRight,
    bottomRight: overrider?.bottomRight ?? toOverride?.bottomRight,
    bottomLeft: overrider?.bottomLeft ?? toOverride?.bottomLeft,
  };
}
