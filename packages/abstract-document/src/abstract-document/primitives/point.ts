export interface Point {
  readonly x: number;
  readonly y: number;
}

export function create(x: number, y: number): Point {
  return {
    x: x,
    y: y
  };
}
