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
  rotationForCameraPos,
  bounds3FromPosAndSize,
  Bounds3,
  bounds3Merge,
  bounds3Center,
  vec3Add,
  vec3Rot,
  sizeCenterBoundsForCameraPos,
} from "../../abstract-3d.js";
import { dxf, DxfOrigin, Handle } from "./dxf-encoding.js";
import { dxfPlane } from "./dxf-geometries/dxf-plane.js";
import { dxfBox } from "./dxf-geometries/dxf-box.js";
import { dxfCylinder } from "./dxf-geometries/dxf-cylinder.js";
import { dxfCone } from "./dxf-geometries/dxf-cone.js";
import { dxfPolygon } from "./dxf-geometries/dxf-polygon.js";
import { Optional } from "../shared.js";

const DEFAULT_CYLINDER_SIDE_COUNT = 18;

export type DxfOptions = { readonly view: View; readonly origin: DxfOrigin; readonly cylinderSideCount: number };

export type DxfScene = { readonly scene: Scene; readonly options?: Optional<DxfOptions>; readonly pos: Vec3 };

export function renderScenes(scenes: ReadonlyArray<DxfScene>, baseOptions?: Optional<DxfOptions>): string {
  let allGroups = "";
  const allBounds = Array<Bounds3>();
  const handle = { handle: 0x1000 };
  for (const view of scenes) {
    const { groups, size, center } = dxfGroups(
      view.scene,
      optionsDef({ ...baseOptions, ...view.options, view: undefined, origin: "Center" }),
      view.pos,
      handle
    );
    allGroups += groups;
    allBounds.push(bounds3FromPosAndSize(center, size));
  }
  const bounds = bounds3Merge(...allBounds);
  return dxf(allGroups, bounds3Center(bounds), bounds3ToSize(bounds), "Center");
}

export const renderNew = (scene: Scene, options?: Optional<DxfOptions>): string => {
  const opts = optionsDef(options);
  const { groups, size, center } = dxfGroups(scene, opts, vec3Zero, { handle: 0x1000 });
  return dxf(groups, center, size, opts.origin);
};

// This is the original
export const render = (scene: Scene, options: Optional<DxfOptions>): string => {
  const opts = optionsDef(options);
  const unitRot = vec3RotCombine(rotationForCameraPos(opts.view), scene.rotation_deprecated ?? vec3Zero);
  const bounds = bounds3FromPosAndSize(scene.center_deprecated ?? vec3Zero, scene.size_deprecated);
  const center = vec3Zero;
  const offset =
    opts.origin === "Center" ? vec3Zero : vec3(Math.abs(bounds.min.x), Math.abs(bounds.min.y), -bounds.max.z);
  const groupRoot = group([], offset, vec3Zero, scene.groups);
  const handleRef = { handle: 0x1000 };
  return dxf(dxfGroup(groupRoot, center, unitRot, opts, handleRef), center, scene.size_deprecated, opts.origin);
};

const dxfGroups = (
  scene: Scene,
  options: DxfOptions,
  offset: Vec3,
  handleRef: Handle //make sure we start with a value higher than any other handle id's used in the header
): { readonly groups: string; readonly size: Vec3; readonly center: Vec3 } => {
  const unitRot = vec3RotCombine(rotationForCameraPos(options.view), scene.rotation_deprecated ?? vec3Zero);
  const unitPos = vec3Rot(scene.center_deprecated ?? vec3Zero, vec3Zero, scene.rotation_deprecated ?? vec3Zero);
  const [size, center] = sizeCenterBoundsForCameraPos(scene.size_deprecated, unitPos, unitRot, 1);
  const centerWithOffset = vec3Add(center, offset);
  return {
    groups: scene.groups.reduce((a, c) => a + dxfGroup(c, centerWithOffset, unitRot, options, handleRef), ""),
    size,
    center: centerWithOffset,
  };
};

function dxfGroup(g: Group, parentPos: Vec3, parentRot: Vec3, options: DxfOptions, handleRef: Handle): string {
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
          return a + dxfCylinder(c.geometry, c.material, options.cylinderSideCount, pos, rot, handleRef);
        }
        case "Cone": {
          return a + dxfCone(c.geometry, c.material, options.cylinderSideCount, pos, rot, handleRef);
        }
        case "Polygon": {
          return a + dxfPolygon(c.geometry, c.material, pos, rot, handleRef);
        }
        default: {
          return a;
        }
      }
    }, "") ?? "") + g.groups?.reduce((a, c) => a + dxfGroup(c, pos, rot, options, handleRef), "")
  );
}

function optionsDef(options: Optional<DxfOptions> | undefined): DxfOptions {
  return {
    view: options?.view ?? "front",
    origin: options?.origin ?? "BottomLeftFront",
    cylinderSideCount: DEFAULT_CYLINDER_SIDE_COUNT,
  };
}
