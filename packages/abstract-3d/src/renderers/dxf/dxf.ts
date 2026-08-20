import {
  type Bounds3,
  type Dimensions,
  type Group,
  type Scene,
  type Vec3,
  type View,
  bounds3Center,
  bounds3FromPosAndSize,
  bounds3Merge,
  bounds3ToSize,
  boundsScene,
  group,
  rotationForCameraPos,
  sizeBoundsForCameraPos,
  vec3,
  vec3Add,
  vec3RotCombine,
  vec3Sub,
  vec3TransRot,
  vec3Zero
} from "../../abstract-3d.js";
import { DEFAULT_CIRCLE_SIDE_COUNT, type DxfOrigin, type Handle, dxfBuild, dxfHandleInit } from "./dxf-encoding/dxf-common.js";
import { type Optional, calculateVisibleViews } from "../../utils.js";
import { dxfPlane } from "./dxf-geometries/dxf-plane.js";
import { dxfBox } from "./dxf-geometries/dxf-box.js";
import { dxfCylinder } from "./dxf-geometries/dxf-cylinder.js";
import { dxfCone } from "./dxf-geometries/dxf-cone.js";
import { dxfPolygon } from "./dxf-geometries/dxf-polygon.js";
import { dxfImage } from "./dxf-geometries/dxf-image.js";
import { dxfDimension } from "./dxf-geometries/dxf-dimension.js";
import { DxfDimensionDefinition } from "./dxf-encoding/dxf-dimension.js";

export type DxfOptions = {
  readonly view: View;
  readonly origin: DxfOrigin;
  readonly cylinderSideCount: number;
  readonly showDimensions: boolean;
};

export type DxfScenesOptionsBase = Omit<DxfOptions, "origin"> & { readonly origin: Exclude<DxfOrigin, "SameAsScene"> };

export type DxfScene = {
  readonly scene: Scene;
  readonly options?: Optional<DxfOptions>;
  readonly pos: Vec3;
};

export function renderScenes(scenes: ReadonlyArray<DxfScene>, baseOptions?: Optional<DxfScenesOptionsBase>): string {
  let allGroups = "";
  let allDimensions: DxfDimensionDefinition = {
    block: "",
    entity: "",
    blockRecord: "",
  };

  const allBounds = Array<Bounds3>();
  const handle = dxfHandleInit();
  const originOffset = originOffsetFromScenes(scenes, baseOptions?.origin ?? "Center");
  for (const view of scenes) {
    const { groups, dimensions, size, center } = renderInternal(
      view.scene,
      optionsDef({ ...baseOptions, ...view.options, origin: "Center" }),
      vec3Add(view.pos, originOffset),
      handle
    );
    allGroups += groups;
    allDimensions = {
      entity: allDimensions.entity + dimensions.entity,
      block: allDimensions.block + dimensions.block,
      blockRecord: allDimensions.blockRecord + dimensions.blockRecord
    };
    allBounds.push(bounds3FromPosAndSize(center, size));
  }
  const bounds = bounds3Merge(...allBounds);
  return dxfBuild(allGroups, allDimensions, bounds, bounds3ToSize(bounds), bounds3Center(bounds));
}

export const render = (scene: Scene, options?: Optional<DxfOptions>): string => {
  const opts = optionsDef(options);
  const bounds = boundsScene(scene);
  const { groups, dimensions, size, center } = renderInternal(scene, opts, vec3Zero, dxfHandleInit());
  return dxfBuild(groups, dimensions, bounds, size, center);
};

const renderInternal = (
  scene: Scene,
  options: DxfOptions,
  offset: Vec3,
  handleRef: Handle
): { readonly groups: string; readonly dimensions: DxfDimensionDefinition; readonly size: Vec3; readonly center: Vec3 } => {
  const unitRot = vec3RotCombine(rotationForCameraPos(options.view), scene.rotation_deprecated ?? vec3Zero);
  const unitCenter = scene.center_deprecated ?? vec3Zero;
  const [size] = sizeBoundsForCameraPos(scene.size_deprecated, unitCenter, unitRot);
  const bounds = bounds3FromPosAndSize(unitCenter, size);
  const dxfOriginOffset = originOffsetFromBounds(bounds, options.origin);
  const pos =
    options.origin === "SameAsScene" ? vec3Zero : vec3NegateY(vec3Add(unitCenter, vec3Add(offset, dxfOriginOffset)));
  const visibleViews = calculateVisibleViews(options.view, scene.rotation_deprecated);
  return {
    groups: scene.groups.reduce((a, c) => a + dxfGroup(c, pos, unitRot, options, handleRef), ""),
    dimensions: dxfDimensions(scene.dimensions_deprecated, pos, unitRot, scene.rotation_deprecated ?? vec3Zero, visibleViews, options, handleRef),
    size,
    center: pos,
  };
};

function vec3NegateY(vec: Vec3): Vec3 {
  return {
    x: vec.x,
    y: -vec.y,
    z: vec.z,
  };
}

function originOffsetFromScenes(scenes: ReadonlyArray<DxfScene>, origin: DxfOrigin): Vec3 {
  const allBounds = Array<Bounds3>();
  for (const scene of scenes) {
    const center = scene.scene.center_deprecated ?? vec3Zero;
    const size = scene.scene.size_deprecated;
    allBounds.push(bounds3FromPosAndSize(center, size));
  }
  return originOffsetFromBounds(bounds3Merge(...allBounds), origin);
}

function originOffsetFromBounds(bounds: Bounds3, origin: DxfOrigin): Vec3 {
  switch (origin) {
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

function dxfDimensions(d: Dimensions | undefined, parentPos: Vec3, parentRot: Vec3, sceneRotation: Vec3, visibleViews: Record<string, boolean>, options: DxfOptions, handleRef: Handle): DxfDimensionDefinition {
  if(!d || !options.showDimensions) {
   return {
    entity: "",
    block: "",
    blockRecord: ""
   };
  }
  return d.dimensions
    .filter((d) => d.views?.[0] && visibleViews[d.views[0]] === true)
    .map((d) => dxfDimension(d, parentPos, parentRot, sceneRotation, handleRef))
    .reduce<DxfDimensionDefinition>((prev, curr) => ({ block: prev.block + curr.block, entity: prev.entity + curr.entity, blockRecord: prev.blockRecord + curr.blockRecord }), {block: "", entity: "", blockRecord: ""});
}

function optionsDef(options: Optional<DxfOptions> | undefined): DxfOptions {
  return {
    view: options?.view ?? "front",
    origin: options?.origin ?? "BottomLeftFront",
    cylinderSideCount: options?.cylinderSideCount ?? DEFAULT_CIRCLE_SIDE_COUNT,
    showDimensions: options?.showDimensions ?? true,
  };
}

// This is the original
export const renderOld = (scene: Scene, options?: Optional<DxfOptions>): string => {
  const opts = optionsDef(options);
  const center = scene.center_deprecated ?? vec3Zero;
  const unitRot = vec3RotCombine(rotationForCameraPos(opts.view), scene.rotation_deprecated ?? vec3Zero);
  const bounds = bounds3FromPosAndSize(center, scene.size_deprecated);
  const offset = vec3Sub(
    opts.origin === "Center" ? vec3Zero : vec3(Math.abs(bounds.min.x), Math.abs(bounds.min.y), -bounds.max.z),
    center
  );
  const dimensionsPos = vec3TransRot(center, offset, unitRot);
  const visibleViews = calculateVisibleViews(opts.view, scene.rotation_deprecated);

  const bounds2 = bounds3FromPosAndSize(offset, scene.size_deprecated);
  const groupRoot = group([], offset, vec3Zero, scene.groups);
  const handleRef = dxfHandleInit();
  const dimensions = dxfDimensions(scene.dimensions_deprecated, dimensionsPos, unitRot, scene.rotation_deprecated ?? vec3Zero, visibleViews, opts, handleRef);
  return dxfBuild(dxfGroup(groupRoot, center, unitRot, opts, handleRef), dimensions, bounds2, scene.size_deprecated, center);
};
