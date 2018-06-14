export interface Size {
  readonly height: number;
  readonly width: number;
}

export function create(width: number, height: number): Size {
  return {
    width: width,
    height: height
  };
}
