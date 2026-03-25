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
  sizeCenterBoundsForCameraPos,
  boundsScene,
  vec3Sub,
} from "../../abstract-3d.js";
import { dxf, dxfHandleCreate, DxfOrigin, Handle } from "./dxf-encoding.js";
import { dxfPlane } from "./dxf-geometries/dxf-plane.js";
import { dxfBox } from "./dxf-geometries/dxf-box.js";
import { dxfCylinder } from "./dxf-geometries/dxf-cylinder.js";
import { dxfCone } from "./dxf-geometries/dxf-cone.js";
import { dxfPolygon } from "./dxf-geometries/dxf-polygon.js";
import { Optional } from "../shared.js";
import { dxfImage } from "./dxf-geometries/dxf-image.js";

const DEFAULT_CYLINDER_SIDE_COUNT = 18;

export type DxfOptions = { readonly view: View; readonly origin: DxfOrigin; readonly cylinderSideCount: number };

export type DxfScene = { readonly scene: Scene; readonly options?: Optional<DxfOptions>; readonly pos: Vec3 };

export function renderScenes(scenes: ReadonlyArray<DxfScene>, baseOptions?: Optional<DxfOptions>): string {
  let allGroups = "";
  const allBounds = Array<Bounds3>();
  const handle = dxfHandleCreate();
  const originOffset = originOffsetFromScenes(scenes, baseOptions?.origin ?? "Center");
  for (const view of scenes) {
    const { groups, size, center } = renderInternal(
      view.scene,
      optionsDef({ ...baseOptions, ...view.options, origin: "Center" }),
      vec3Add(view.pos, originOffset),
      handle
    );
    allGroups += groups;
    allBounds.push(bounds3FromPosAndSize(center, size));
  }
  const bounds = bounds3Merge(...allBounds);
  return dxf(allGroups, bounds, bounds3ToSize(bounds), bounds3Center(bounds));
}

export const render = (scene: Scene, options?: Optional<DxfOptions>): string => {
  const opts = optionsDef(options);
  const bounds = boundsScene(scene);
  const { groups, size, center } = renderInternal(scene, opts, vec3Zero, dxfHandleCreate());
  return dxf(groups, bounds, size, center);
};

const renderInternal = (
  scene: Scene,
  options: DxfOptions,
  offset: Vec3,
  handleRef: Handle
): { readonly groups: string; readonly size: Vec3; readonly center: Vec3 } => {
  const unitRot = vec3RotCombine(rotationForCameraPos(options.view), scene.rotation_deprecated ?? vec3Zero);
  const [size, center] = sizeCenterBoundsForCameraPos(
    scene.size_deprecated,
    scene.center_deprecated ?? vec3Zero,
    unitRot
  );
  const bounds = bounds3FromPosAndSize(center, size);
  const dxfOriginOffset = originOffsetFromBounds(bounds, options.origin)
  const pos = vec3NegateY(vec3Add(center, vec3Add(offset, dxfOriginOffset)));
  return {
    groups: scene.groups.reduce((a, c) => a + dxfGroup(c, pos, unitRot, options, handleRef), ""),
    size,
    center: pos,
  };
};

function vec3NegateY(vec: Vec3): Vec3 {
  return {
    x: vec.x,
    y: -vec.y,
    z: vec.z
  };
}

function originOffsetFromScenes(scenes: ReadonlyArray<DxfScene>, origin: DxfOrigin): Vec3 {
  const allBounds = Array<Bounds3>();
  for(const scene of scenes) {
    const center = scene.scene.center_deprecated ?? vec3Zero;
    const size = scene.scene.size_deprecated;
    allBounds.push(bounds3FromPosAndSize(center, size));
  }
  return originOffsetFromBounds(bounds3Merge(...allBounds), origin);
}

function originOffsetFromBounds(bounds: Bounds3, origin: DxfOrigin): Vec3 {
  switch(origin) {
    case "BottomLeftFront": {
      return vec3(Math.abs(bounds.min.x), -Math.abs(bounds.min.y), -Math.abs(bounds.min.z));
    }
    case "Center":
    default:
      return vec3Zero;
  }
}

function dxfGroup(g: Group, parentPos: Vec3, parentRot: Vec3, options: DxfOptions, handleRef: Handle): string {
  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);

  let dxf = "";
  for (const mesh of g.meshes ?? []) {
    switch (mesh.geometry.type) {
      case "Plane": {
        dxf += dxfPlane(mesh.geometry, mesh.material, pos, rot, handleRef);
        break;
      }
      case "Box": {
        dxf += dxfBox(mesh.geometry, mesh.material, pos, rot, handleRef);
        break;
      }
      case "Cylinder": {
        dxf += dxfCylinder(mesh.geometry, mesh.material, options.cylinderSideCount, pos, rot, handleRef);
        break;
      }
      case "Cone": {
        dxf += dxfCone(mesh.geometry, mesh.material, options.cylinderSideCount, pos, rot, handleRef);
        break;
      }
      case "Polygon": {
        dxf += dxfPolygon(mesh.geometry, mesh.material, pos, rot, handleRef);
        break;
      }
      case "Image": {
        dxf += dxfImage(mesh.geometry, pos, rot, handleRef);
        break;
      }
      default:
        break;
    }
  }

  for (const group of g.groups ?? []) {
    dxf += dxfGroup(group, pos, rot, options, handleRef);
  }

  return dxf;
}

function optionsDef(options: Optional<DxfOptions> | undefined): DxfOptions {
  return {
    view: options?.view ?? "front",
    origin: options?.origin ?? "BottomLeftFront",
    cylinderSideCount: DEFAULT_CYLINDER_SIDE_COUNT,
  };
}

// This is the original
export const renderOld = (scene: Scene, options?: Optional<DxfOptions>): string => {
  const opts = optionsDef(options);
  const center = scene.center_deprecated ?? vec3Zero;
  const unitRot = vec3RotCombine(rotationForCameraPos(opts.view), scene.rotation_deprecated ?? vec3Zero);
  const bounds = bounds3FromPosAndSize(center, scene.size_deprecated);
  const offset =
    vec3Sub(opts.origin === "Center" ? vec3Zero : vec3(Math.abs(bounds.min.x), Math.abs(bounds.min.y), -bounds.max.z), center);
  
  const newBounds: Bounds3 = {
    max: {
      x: bounds.max.x + offset.x,
      y: bounds.max.y + offset.y,
      z: bounds.max.z + offset.z,
    },
    min: {
      x: bounds.min.x + offset.x,
      y: bounds.min.y + offset.y,
      z: bounds.min.z + offset.z,
    }
  };

  const bounds2 = bounds3FromPosAndSize(offset, scene.size_deprecated);
  const groupRoot = group([], offset, vec3Zero, scene.groups);
  const handleRef = dxfHandleCreate();
  return dxf(dxfGroup(groupRoot, center, unitRot, opts, handleRef), bounds2, scene.size_deprecated, center);
};
