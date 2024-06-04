import * as A3D from "../../abstract-3d.js";
import { dxfFooter, dxfHeader } from "./dxf-encoding.js";
import { dxfPlane } from "./dxf-geometries/dxf-plane.js";
import { dxfBox } from "./dxf-geometries/dxf-box.js";
import { dxfCylinder } from "./dxf-geometries/dxf-cylinder.js";
import { dxfCone } from "./dxf-geometries/dxf-cone.js";
import { dxfPolygon } from "./dxf-geometries/dxf-polygon.js";
import { dimBoundZero, rotationForCameraPos, sizeCenterForCameraPos } from "../shared.js";

export const toDxf = (scene: A3D.Scene, view: A3D.View): string => {
  const unitRot = A3D.vec3RotCombine(rotationForCameraPos(view), scene.rotation);
  const rotatedCenter = A3D.vec3Rot(scene.center, A3D.vec3Zero, scene.rotation);
  const [size, center] = sizeCenterForCameraPos(scene.size, rotatedCenter, dimBoundZero, A3D.vec3Zero, view, 1);
  return dxfHeader(size, center) + scene.groups.reduce((a, c) => a + dxfGroup(c, center, unitRot), "") + dxfFooter;
};

function dxfGroup(g: A3D.Group, parentPos: A3D.Vec3, parentRot: A3D.Vec3): string {
  const pos = A3D.vec3TransRot(g.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, g.rot);
  return (
    g.meshes.reduce((a, c) => {
      switch (c.geometry.type) {
        case "Plane":
          return a + dxfPlane(c.geometry, c.material, pos, rot);
        case "Box":
          return a + dxfBox(c.geometry, c.material, pos, rot);
        case "Cylinder":
          return a + dxfCylinder(c.geometry, c.material, 18, pos, rot);
        case "Cone":
          return a + dxfCone(c.geometry, c.material, 18, pos, rot);
        case "Polygon":
          return a + dxfPolygon(c.geometry, c.material, pos, rot);
        default:
          return a;
      }
    }, "") + g.groups.reduce((a, c) => a + dxfGroup(c, pos, rot), "")
  );
}
