import { Scene, vec3Zero, Group, Vec3, vec3TransRot, vec3RotCombine } from "../../abstract-3d.js";
import { stlPlane } from "./stl-geometries/stl-plane.js";
import { stlBox } from "./stl-geometries/stl-box.js";
import { stlCylinder } from "./stl-geometries/stl-cylinder.js";
import { stlCone } from "./stl-geometries/stl-cone.js";
import { stlPolygon } from "./stl-geometries/stl-polygon.js";

export const toStl = (scene: Scene): string =>
  `solid
` +
  scene.groups.reduce(
    (a, c) => a + stlGroup(c, scene.center_deprecated ?? vec3Zero, scene.rotation_deprecated ?? vec3Zero),
    ""
  );

function stlGroup(g: Group, parentPos: Vec3, parentRot: Vec3): string {
  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);
  return (
    (g.meshes?.reduce((a, m) => {
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
    }, "") ?? "") + (g.groups?.reduce((a, c) => a + stlGroup(c, pos, rot), "") ?? "")
  );
}
