import { edgesScene } from "../../abstract-visuals-example/src/app/edges-scene.js";
import { demo } from "../../abstract-visuals-example/src/app/generated/demo.js";
import { systemair3 } from "../../abstract-visuals-example/src/app/generated/systemair-3.js";
import { systemair6 } from "../../abstract-visuals-example/src/app/generated/systemair-6.js";
import { assignMaterialTypes } from "../../abstract-visuals-example/src/app/material-types.js";
import { materialsScene } from "../../abstract-visuals-example/src/app/materials-scene.js";
import { roundBoxes } from "../../abstract-visuals-example/src/app/round-boxes.js";
import type { Scene } from "../src/abstract-3d.js";
import { bounds3ToSize } from "../src/abstract-3d.js";

/** The benchmark and screenshot scenes, from the example app, with their boxes rounded and materials typed as there */
export const scenes: Record<string, Scene> = {
  demo: roundBoxes(assignMaterialTypes(demo as Scene)),
  systemair3: roundBoxes(assignMaterialTypes(systemair3)),
  systemair6: roundBoxes(assignMaterialTypes(systemair6)),
  materials: materialsScene,
  edges: edgesScene,
};

/** `count` copies of the scene in a square grid, each group's id made unique per copy */
export function repeatScene(scene: Scene, count: number): Scene {
  const side = Math.ceil(Math.sqrt(count));
  const size = bounds3ToSize(scene.bounds);
  const step = { x: size.x * 1.2, z: size.z * 1.5 };
  return {
    ...scene,
    bounds: {
      min: scene.bounds.min,
      max: { x: scene.bounds.max.x + step.x * (side - 1), y: scene.bounds.max.y, z: scene.bounds.max.z + step.z * (side - 1) },
    },
    groups: Array.from({ length: count }, (_, copy) =>
      scene.groups.map((g) => ({
        ...g,
        pos: { x: g.pos.x + (copy % side) * step.x, y: g.pos.y, z: g.pos.z + Math.floor(copy / side) * step.z },
        data: { ...g.data, id: `${g.data?.["id"] ?? ""}:${copy}` },
      }))
    ).flat(),
  };
}

export const createGroupId = (g: Scene["groups"][number]): string => g.data?.["id"] ?? "";
