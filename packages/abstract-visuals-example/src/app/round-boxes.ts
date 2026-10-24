import type { Group, Mesh, Scene } from "../../../abstract-3d/src/abstract-3d.js";

/**
 * The scene with the edges of its boxes rounded by `radius`, as the sheet metal of the units in the example scenes is bent; boxes with holes stay
 * sharp
 */
export function roundBoxes(scene: Scene, radius = 2): Scene {
  return { ...scene, groups: scene.groups.map((g) => roundGroup(g, radius)) };
}

function roundGroup(g: Group, radius: number): Group {
  return {
    ...g,
    meshes: g.meshes?.map((m): Mesh => (m.geometry.type === "Box" ? { ...m, geometry: { ...m.geometry, radius } } : m)),
    groups: g.groups?.map((child) => roundGroup(child, radius)),
  };
}
