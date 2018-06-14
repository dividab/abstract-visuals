export interface Size {
  readonly width: number;
  readonly height: number;
}

export function createSize(width: number, height: number): Size {
  return {
    width: width,
    height: height
  };
}
