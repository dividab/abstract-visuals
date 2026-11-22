import type { Scene, Group, Vec3 } from "../../abstract-3d.js";
import { vec3Zero, vec3TransRot, vec3RotCombine, groupTextBackgrounds, sceneTextHeight, bounds3Center, latheCylinders } from "../../abstract-3d.js";
import { stlBox } from "./stl-geometries/stl-box.js";
import { stlCone } from "./stl-geometries/stl-cone.js";
import { stlCylinder } from "./stl-geometries/stl-cylinder.js";
import { stlPlane } from "./stl-geometries/stl-plane.js";
import { stlPolygon } from "./stl-geometries/stl-polygon.js";

export const render = (scene: Scene): string => {
  const textHeight = sceneTextHeight(scene.groups);
  const center = bounds3Center(scene.bounds);
  return (
    `solid
` + scene.groups.reduce((a, c) => a + stlGroup(groupTextBackgrounds(c, textHeight), center, vec3Zero), "")
  );
};

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
        case "Lathe":
          return (
            a +
            latheCylinders(m.geometry)
              .map((c) => stlCylinder(c, m.material, 18, pos, rot))
              .join("")
          );
        case "Polygon":
          return a + stlPolygon(m.geometry, m.material, pos, rot);
        default:
          return a;
      }
    }, "") ?? "") + (g.groups?.reduce((a, c) => a + stlGroup(c, pos, rot), "") ?? "")
  );
}
