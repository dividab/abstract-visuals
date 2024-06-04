import * as A3D from "../../abstract-3d.js";
import { stlPlane } from "./stl-geometries/stl-plane.js";
import { stlBox } from "./stl-geometries/stl-box.js";
import { stlCylinder } from "./stl-geometries/stl-cylinder.js";
import { stlCone } from "./stl-geometries/stl-cone.js";
import { stlPolygon } from "./stl-geometries/stl-polygon.js";

export const toStl = (scene: A3D.Scene): string =>
  `solid
` + scene.groups.reduce((a, c) => a + stlGroup(c, scene.center, scene.rotation), "");

function stlGroup(g: A3D.Group, parentPos: A3D.Vec3, parentRot: A3D.Vec3): string {
  const pos = A3D.vec3TransRot(g.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, g.rot);
  return (
    g.meshes.reduce((a, m) => {
      switch (m.geometry.type) {
        case "Plane":
          return a + stlPlane(m.geometry, m.material, pos, rot);
        case "Box":
          return a + stlBox(m.geometry, m.material, pos, rot);
        case "Cylinder":
          return a + stlCylinder(m.geometry, m.material, 18, pos, rot);
        case "Cone":
          return a + stlCone(m.geometry, m.material, 18, pos, rot);
        case "Polygon":
          return a + stlPolygon(m.geometry, m.material, pos, rot);
        default:
          return a;
      }
    }, "") + g.groups.reduce((a, c) => a + stlGroup(c, pos, rot), "")
  );
}
