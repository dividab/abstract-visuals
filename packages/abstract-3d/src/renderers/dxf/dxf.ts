import {
  Scene,
  View,
  vec3RotCombine,
  vec3Zero,
  Group,
  Vec3,
  vec3TransRot,
  group,
  bounds3ToSize,
  vec3,
  boundsScene,
} from "../../abstract-3d.js";
import { dxfFooter, dxfHeader } from "./dxf-encoding.js";
import { dxfPlane } from "./dxf-geometries/dxf-plane.js";
import { dxfBox } from "./dxf-geometries/dxf-box.js";
import { dxfCylinder } from "./dxf-geometries/dxf-cylinder.js";
import { dxfCone } from "./dxf-geometries/dxf-cone.js";
import { dxfPolygon } from "./dxf-geometries/dxf-polygon.js";
import { Optional, rotationForCameraPos } from "../shared.js";
import { generateUUID } from "three/src/math/MathUtils.js";

export type DxfOrigin = "BottomLeftFront" | "Center";
export type DxfOptions = { readonly view: View; readonly origin: DxfOrigin };

export const render = (scene: Scene, options: Optional<DxfOptions>): string => {
  const opts: DxfOptions = { view: options.view ?? "front", origin: options.origin ?? "BottomLeftFront" };
  const unitRot = vec3RotCombine(rotationForCameraPos(opts.view), scene.rotation_deprecated ?? vec3Zero);
  const boundingBox = boundsScene(scene);
  const boundingBoxSize = bounds3ToSize(boundingBox);
  const center = vec3Zero;
  const offset =
    opts.origin === "Center"
      ? vec3Zero
      : vec3(Math.abs(boundingBox.min.x), Math.abs(boundingBox.min.y), -boundingBox.max.z);
  const groupRoot = group([], offset, vec3Zero, scene.groups);
  const id = generateUUID();
  const handleRef = { handle: 0x1000 }; //make sure we start with a value higher than any other handle id's used in the header
  return dxfHeader(boundingBoxSize, center, id) + dxfGroup(groupRoot, center, unitRot, handleRef) + dxfFooter(id);
};

function dxfGroup(g: Group, parentPos: Vec3, parentRot: Vec3, handleRef: { handle: number }): string {
  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);
  return (
    (g.meshes?.reduce((a, c) => {
      switch (c.geometry.type) {
        case "Plane": {
          return a + dxfPlane(c.geometry, c.material, pos, rot, handleRef);
        }
        case "Box": {
          return a + dxfBox(c.geometry, c.material, pos, rot, handleRef);
        }
        case "Cylinder": {
          return a + dxfCylinder(c.geometry, c.material, 18, pos, rot, handleRef);
        }
        case "Cone": {
          return a + dxfCone(c.geometry, c.material, 18, pos, rot, handleRef);
        }
        case "Polygon": {
          return a + dxfPolygon(c.geometry, c.material, pos, rot, handleRef);
        }
        default: {
          return a;
        }
      }
    }, "") ?? "") + g.groups?.reduce((a, c) => a + dxfGroup(c, pos, rot, handleRef), "")
  );
}
