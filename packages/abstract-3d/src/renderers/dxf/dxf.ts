import * as A3D from "../../abstract-3d";
import { dxfFooter, dxfHeader } from "./dxf-encoding";
import { dxfPlane } from "./dxf-geometries/dxf-plane";
import { dxfBox } from "./dxf-geometries/dxf-box";
import { dxfCylinder } from "./dxf-geometries/dxf-cylinder";
import { dxfCone } from "./dxf-geometries/dxf-cone";
import { dxfPolygon } from "./dxf-geometries/dxf-polygon";
import { dimBoundZero, rotationForCameraPos, sizeCenterForCameraPos } from "../shared";

export const toDxf = (scene: A3D.Scene, view: A3D.View): string => {
  const unitRot = A3D.vec3RotCombine(rotationForCameraPos(view), scene.rotation ?? A3D.vec3Zero);
  const rotatedCenter = A3D.vec3Rot(scene.center, A3D.vec3Zero, scene.rotation ?? A3D.vec3Zero);
  const [size, center] = sizeCenterForCameraPos(scene.size, rotatedCenter, dimBoundZero, A3D.vec3Zero, view, 1);
  return dxfHeader(size, center) + scene.groups.reduce((a, c) => a + dxfGroup(c, center, unitRot), "") + dxfFooter;
};

function dxfGroup(g: A3D.Group, parentPos: A3D.Vec3, parentRot: A3D.Vec3): string {
  const pos = A3D.vec3TransRot(g.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, g.rot ?? A3D.vec3Zero);
  return (
    (g.meshes?.reduce((a, c) => {
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
    }, "") ?? "") + g.groups?.reduce((a, c) => a + dxfGroup(c, pos, rot), "") ?? ""
  );
}
