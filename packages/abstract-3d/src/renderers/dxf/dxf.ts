import type { Color } from "abstract-image";
import { exhaustiveCheck } from "ts-exhaustive-check";
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
  dimensionPlacements,
  group,
  groupTextBackgrounds,
  rotationForCameraPos,
  sceneTextHeight,
  sizeBoundsForCameraPos,
  vec3,
  vec3Add,
  vec3RotCombine,
  vec3Sub,
  vec3TransRot,
  vec3Zero,
  latheCylinders,
} from "../../abstract-3d.js";
import type { Optional } from "../../utils.js";
import { dxfBuild } from "./dxf-encoding/dxf-build.js";
import { dxfColor, dxfEncLayerDefs, type DxfColor } from "./dxf-encoding/dxf-color.js";
import { DEFAULT_CIRCLE_SIDE_COUNT, type DxfOrigin, type Handle, dxfHandleInit } from "./dxf-encoding/dxf-common.js";
import type { DxfDimensionDefinition } from "./dxf-encoding/dxf-dimension.js";
import { dxfBox } from "./dxf-geometries/dxf-box.js";
import { dxfCone } from "./dxf-geometries/dxf-cone.js";
import { dxfCylinder } from "./dxf-geometries/dxf-cylinder.js";
import { dxfDimension } from "./dxf-geometries/dxf-dimension.js";
import { dxfImage } from "./dxf-geometries/dxf-image.js";
import { dxfLine } from "./dxf-geometries/dxf-line.js";
import { dxfPlane } from "./dxf-geometries/dxf-plane.js";
import { dxfPolygon } from "./dxf-geometries/dxf-polygon.js";
import { dxfShape } from "./dxf-geometries/dxf-shape.js";
import { dxfSphere } from "./dxf-geometries/dxf-sphere.js";
import { dxfText } from "./dxf-geometries/dxf-text.js";
import { dxfTube } from "./dxf-geometries/dxf-tube.js";

export type DxfOptions = {
  readonly view: View;
  readonly origin: DxfOrigin;
  readonly cylinderSideCount: number;
  readonly showDimensions: boolean;
  readonly layers?: DxfLayerOptions;
};

export type DxfLayerOptions = {
  /**
   * The groups have their own layers that are inherited down to its children unless a child group has its own layer name. The names of the group's
   * layers will be the ones that this option will use to match against the defined layers that can be defined in `baseLayer` and `layers`. Specific
   * layers can be overridden inside the `layers` option, whilst a matched layer that doesn't exist there will use the `baseLayer` instead as a
   * fallback
   */
  readonly type: "ByGroupLayer";

  /** The layer to use as the fallback base layer. Automatically named `0` */
  readonly baseLayer: DxfLayer;

  /**
   * Definitions of specific layers that must match the layers of a group.\
   * The key is the name of the group layer to override.\
   * The layer named `0` is defined on the `baseLayer` property.
   */
  readonly layers: Record<string, DxfLayer> & { ["0"]?: never };

  /** Dimension layer name. If undefined, the base layer will be used */
  readonly dimLayer?: string;
};

export type DxfLayer = {
  readonly color: Color;
};

export type DxfScenesOptionsBase = Omit<DxfOptions, "origin"> & { readonly origin: Exclude<DxfOrigin, "SameAsScene"> };

export type DxfScene = {
  readonly scene: Scene;
  readonly options?: Optional<Omit<DxfOptions, "layers">>;
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
  const handleRef = dxfHandleInit();
  const originOffset = originOffsetFromScenes(scenes, baseOptions?.origin ?? "Center");
  // The file has one dimension style, so it's scaled by the largest of the scenes' text heights, usually views of one unit with the same
  let allTextHeight: number | undefined = undefined;
  for (const view of scenes) {
    const { groups, dimensions, size, center, textHeight } = renderInternal(
      view.scene,
      optionsDef({ ...baseOptions, ...view.options, origin: "Center" }),
      vec3Add(view.pos, originOffset),
      handleRef
    );
    allGroups += groups;
    allDimensions = {
      entity: allDimensions.entity + dimensions.entity,
      block: allDimensions.block + dimensions.block,
      blockRecord: allDimensions.blockRecord + dimensions.blockRecord,
    };
    allBounds.push(bounds3FromPosAndSize(center, size));
    allTextHeight = Math.max(allTextHeight ?? textHeight, textHeight);
  }
  const bounds = bounds3Merge(...allBounds);
  const layers = dxfEncLayerDefs(handleRef, baseOptions?.layers);
  return dxfBuild(allGroups, allDimensions, layers, allTextHeight, bounds, bounds3ToSize(bounds), bounds3Center(bounds));
}

export const render = (scene: Scene, options?: Optional<DxfOptions>): string => {
  const opts = optionsDef(options);
  const bounds = boundsScene(scene);
  const handleRef = dxfHandleInit();
  const { groups, dimensions, size, center, textHeight } = renderInternal(scene, opts, vec3Zero, handleRef);
  const layers = dxfEncLayerDefs(handleRef, options?.layers);
  return dxfBuild(groups, dimensions, layers, textHeight, bounds, size, center);
};

const renderInternal = (
  scene: Scene,
  options: DxfOptions,
  offset: Vec3,
  handleRef: Handle
): {
  readonly groups: string;
  readonly dimensions: DxfDimensionDefinition;
  readonly size: Vec3;
  readonly center: Vec3;
  readonly textHeight: number;
} => {
  const viewRotation = rotationForCameraPos(options.view);
  const unitCenter = bounds3Center(scene.bounds);
  const [size] = sizeBoundsForCameraPos(scene.bounds, viewRotation);
  const bounds = bounds3FromPosAndSize(unitCenter, size);
  const dxfOriginOffset = originOffsetFromBounds(bounds, options.origin);
  const pos = options.origin === "SameAsScene" ? vec3Zero : vec3NegateY(vec3Add(unitCenter, vec3Add(offset, dxfOriginOffset)));
  const textHeight = sceneTextHeight(scene.groups);
  return {
    groups: scene.groups.reduce(
      (a, c) => a + dxfGroup(groupTextBackgrounds(c, textHeight), pos, viewRotation, undefined, options, textHeight, handleRef),
      ""
    ),
    dimensions: dxfDimensions(scene.dimensions, pos, viewRotation, options, textHeight, handleRef),
    size,
    center: pos,
    textHeight,
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
    allBounds.push(scene.scene.bounds);
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

function dxfDimStyle(options: DxfOptions): string {
  if (!options.layers) {
    return `8\n0\n${dxfColor(7)}`;
  }

  const dimensionLayer = options.layers.dimLayer;
  if (dimensionLayer && Object.hasOwn(options.layers.layers, dimensionLayer)) {
    return `8\n${dimensionLayer}`;
  }

  return `8\n0`;
}

function dxfEntityStyle(layer: string | undefined, color: DxfColor, options: DxfOptions): string {
  if (!options.layers) {
    return `8\n0\n${dxfColor(color)}`;
  }

  switch (options.layers.type) {
    // oxlint-disable-next-line typescript/no-unnecessary-condition -- only one layer strategy so far; the switch keeps adding the next one exhaustive
    case "ByGroupLayer": {
      return `8\n${layer !== undefined && Object.hasOwn(options.layers.layers, layer) ? layer : "0"}\n62\n256`;
    }
    default:
      return exhaustiveCheck(options.layers.type);
  }
}

function dxfGroup(
  g: Group,
  parentPos: Vec3,
  parentRot: Vec3,
  parentLayer: string | undefined,
  options: DxfOptions,
  textHeight: number,
  handleRef: Handle
): string {
  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);
  const layer = g.layer ?? parentLayer;

  let dxf = "";
  for (const mesh of g.meshes ?? []) {
    const color = mesh.geometry.type === "Image" ? 7 : mesh.material.normal;
    const entityStyle = dxfEntityStyle(layer, color, options);
    switch (mesh.geometry.type) {
      case "Plane": {
        dxf += dxfPlane(mesh.geometry, entityStyle, pos, rot, handleRef);
        break;
      }
      case "Box": {
        dxf += dxfBox(mesh.geometry, entityStyle, pos, rot, handleRef);
        break;
      }
      case "Cylinder": {
        dxf += dxfCylinder(mesh.geometry, entityStyle, options.cylinderSideCount, pos, rot, handleRef);
        break;
      }
      case "Cone": {
        dxf += dxfCone(mesh.geometry, entityStyle, options.cylinderSideCount, pos, rot, handleRef);
        break;
      }
      case "Lathe": {
        dxf += latheCylinders(mesh.geometry)
          .map((c) => dxfCylinder(c, entityStyle, options.cylinderSideCount, pos, rot, handleRef))
          .join("");
        break;
      }
      case "Polygon": {
        dxf += dxfPolygon(mesh.geometry, entityStyle, pos, rot, handleRef);
        break;
      }
      case "Image": {
        dxf += dxfImage(mesh.geometry, entityStyle, pos, rot, handleRef);
        break;
      }
      case "Shape": {
        dxf += dxfShape(mesh.geometry, entityStyle, pos, rot, handleRef);
        break;
      }
      case "Sphere": {
        dxf += dxfSphere(mesh.geometry, entityStyle, options.cylinderSideCount, pos, rot, handleRef);
        break;
      }
      case "Tube": {
        dxf += dxfTube(mesh.geometry, entityStyle, options.cylinderSideCount, pos, rot, handleRef);
        break;
      }
      case "Line":
      case "CulledLine": {
        dxf += dxfLine(mesh.geometry, entityStyle, pos, rot, handleRef);
        break;
      }
      case "Text": {
        dxf += dxfText(mesh.geometry, entityStyle, textHeight, pos, rot, handleRef);
        break;
      }
      default:
        exhaustiveCheck(mesh.geometry);
    }
  }

  for (const group of g.groups ?? []) {
    dxf += dxfGroup(group, pos, rot, layer, options, textHeight, handleRef);
  }

  return dxf;
}

function dxfDimensions(
  d: Dimensions | undefined,
  parentPos: Vec3,
  viewRotation: Vec3,
  options: DxfOptions,
  textHeight: number,
  handleRef: Handle
): DxfDimensionDefinition {
  if (!d || !options.showDimensions) {
    return {
      entity: "",
      block: "",
      blockRecord: "",
    };
  }
  const style = dxfDimStyle(options);
  const placements = dimensionPlacements(d.dimensions, textHeight);
  return d.dimensions
    .flatMap((dim, i) =>
      dim.views?.[0] === options.view ? [dxfDimension(dim, parentPos, viewRotation, viewRotation, textHeight, style, placements[i], handleRef)] : []
    )
    .reduce<DxfDimensionDefinition>(
      (prev, curr) => ({
        block: prev.block + curr.block,
        entity: prev.entity + curr.entity,
        blockRecord: prev.blockRecord + curr.blockRecord,
      }),
      { block: "", entity: "", blockRecord: "" }
    );
}

function optionsDef(options: Optional<DxfOptions> | undefined): DxfOptions {
  return {
    view: options?.view ?? "front",
    origin: options?.origin ?? "BottomLeftFront",
    cylinderSideCount: options?.cylinderSideCount ?? DEFAULT_CIRCLE_SIDE_COUNT,
    showDimensions: options?.showDimensions ?? true,
    layers: options?.layers,
  };
}

// This is the original
export const renderOld = (scene: Scene, options?: Optional<DxfOptions>): string => {
  const opts = optionsDef(options);
  const center = bounds3Center(scene.bounds);
  const size = bounds3ToSize(scene.bounds);
  const viewRotation = rotationForCameraPos(opts.view);
  const bounds = scene.bounds;
  const offset = vec3Sub(opts.origin === "Center" ? vec3Zero : vec3(Math.abs(bounds.min.x), Math.abs(bounds.min.y), -bounds.max.z), center);
  const dimensionsPos = vec3TransRot(center, offset, viewRotation);

  const bounds2 = bounds3FromPosAndSize(offset, size);
  const textHeight = sceneTextHeight(scene.groups);
  const groupRoot = group(
    [],
    offset,
    vec3Zero,
    scene.groups.map((g) => groupTextBackgrounds(g, textHeight))
  );
  const handleRef = dxfHandleInit();
  const dimensions = dxfDimensions(scene.dimensions, dimensionsPos, viewRotation, opts, textHeight, handleRef);
  const layers = dxfEncLayerDefs(handleRef, options?.layers);
  return dxfBuild(
    dxfGroup(groupRoot, center, viewRotation, undefined, opts, textHeight, handleRef),
    dimensions,
    layers,
    textHeight,
    bounds2,
    size,
    center
  );
};
