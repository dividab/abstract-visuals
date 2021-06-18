export interface Size {
  readonly height: number;
  readonly width: number;
  readonly availableWidth?: number;
}

export function create(width: number, height: number, availableWidth?: number): Size {
  return {
    width: width,
    height: height,
    availableWidth: availableWidth,
  };
}
