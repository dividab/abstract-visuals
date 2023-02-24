export interface Point {
  readonly x: number;
  readonly y: number;
}

export function createPoint(x: number, y: number): Point {
  return {
    x: x,
    y: y,
  };
}

export interface Point3D {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export const createPoint3D = (x: number, y: number, z: number): Point3D => ({ x, y, z });
