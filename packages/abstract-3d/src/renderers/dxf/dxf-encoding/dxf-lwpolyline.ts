import { vec3, vec3Cross, vec3Dot, vec3Length, vec3Normalize, vec3Sub, type Vec3 } from "../../../abstract-3d.js";
import { type DxfColor, dxfColor } from "./dxf-color.js";
import { DXF_MODEL_SPACE_HANDLE, dxfHandleNext, dxfOCSXYAxis, type Handle } from "./dxf-common.js";

type LwPolylinePlane = {
  readonly pos: Vec3;
  readonly normal: Vec3;
  readonly xAxis: Vec3;
  readonly yAxis: Vec3;
};

const EPSILON = 1e-6;

/*
  returns undefined if the points given
  aren't all on the same plane or if the
  amount of points isn't higher than 1
*/
export function dxfEncLwPolyline(
  planePos: Vec3,
  points: ReadonlyArray<Vec3>,
  col: DxfColor,
  closed: boolean,
  handleRef: Handle,
  blockRefHandle?: string
): string | undefined {
  if (points.length < 2) {
    return undefined;
  }

  if (points.length === 2) {
    const a = points[0];
    const b = points[1];
    if (a === undefined || b === undefined) {
      return undefined;
    }

    const direction = vec3Normalize(vec3Sub(b, a));
    const reference = Math.abs(direction.z) < 0.9 ? vec3(0, 0, 1) : vec3(0, 1, 0);
    const normal = vec3Normalize(vec3Cross(direction, reference));

    const plane: LwPolylinePlane = {
      normal,
      pos: planePos,
      ...dxfOCSXYAxis(normal),
    };

    return encodeLwPolyline(points, plane, col, false, handleRef, blockRefHandle);
  }

  const plane = findPlane(planePos, points);
  if (!plane || !isCoplanar(points, plane)) {
    return undefined;
  }
  return encodeLwPolyline(points, plane, col, closed, handleRef, blockRefHandle);
}

function encodeLwPolyline(
  points: ReadonlyArray<Vec3>,
  plane: LwPolylinePlane,
  col: DxfColor,
  closed: boolean,
  handleRef: Handle,
  blockRefHandle?: string
): string {
  let dxf = "";
  const planeElevation = vec3Dot(plane.pos, plane.normal);

  dxf += "0\nLWPOLYLINE\n";
  dxf += `5\n${dxfHandleNext(handleRef)}\n`;
  dxf += `330\n${blockRefHandle ?? DXF_MODEL_SPACE_HANDLE}\n`;
  dxf += "100\nAcDbEntity\n";
  dxf += `${dxfColor(col)}\n`;
  dxf += "8\n0\n";
  dxf += "100\nAcDbPolyline\n";
  dxf += `90\n${points.length}\n`;
  dxf += `70\n${closed ? 1 : 0}\n`;
  dxf += `38\n${planeElevation}\n`;

  for (const point of points) {
    dxf += `10\n${vec3Dot(point, plane.xAxis)}\n`;
    dxf += `20\n${vec3Dot(point, plane.yAxis)}\n`;
  }

  //extrusion vector (plane normal)
  dxf += `210\n${plane.normal.x}\n`;
  dxf += `220\n${plane.normal.y}\n`;
  dxf += `230\n${plane.normal.z}\n`;
  return dxf;
}

function findPlane(planePos: Vec3, points: ReadonlyArray<Vec3>): LwPolylinePlane | undefined {
  if (points.length < 3) {
    return undefined;
  }
  for (let i = 1; i < points.length; i++) {
    const aRaw = points[i];
    if (aRaw === undefined) {
      continue;
    }
    const a = vec3Sub(aRaw, planePos);
    for (let j = i + 1; j < points.length; j++) {
      const bRaw = points[j];
      if (bRaw === undefined) {
        continue;
      }
      const b = vec3Sub(bRaw, planePos);
      const normal = vec3Cross(a, b);
      if (vec3Length(normal) > EPSILON) {
        const normalizedNormal = vec3Normalize(normal);
        return {
          normal: normalizedNormal,
          pos: planePos,
          ...dxfOCSXYAxis(normalizedNormal),
        };
      }
    }
  }
  return undefined;
}

function isCoplanar(points: ReadonlyArray<Vec3>, plane: LwPolylinePlane): boolean {
  return points.every((p) => {
    const distance = vec3Dot(vec3Sub(p, plane.pos), plane.normal);
    return Math.abs(distance) < EPSILON;
  });
}
