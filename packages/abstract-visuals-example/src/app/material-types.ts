import type { Group, Material, MaterialType, Scene } from "../../../abstract-3d/src/abstract-3d.js";

/**
 * The example scenes' materials typed by the name the material database gives them, and abstract parts, e.g. symbols, markers and air arrows, kept
 * from casting shadows, as the data will say both itself
 */

const typesByName: Record<string, MaterialType> = {
  panel: "painted",
  panel_middle: "painted",
  panel_border: "painted",
  connection_frame: "painted",
  fan_motor: "painted",
  fan_holder: "painted",
  menerga: "painted",
  silencer_frame: "painted",
  profile: "aluminum",
  profile_outer: "aluminum",
  profile_inner: "aluminum",
  rotor_profile: "aluminum",
  damper_blades: "aluminum",
  c_fin: "aluminum",
  rt: "aluminum",
  ptd: "aluminum",
  zn_mg: "galvanized",
  bf: "galvanized",
  bf_light: "galvanized",
  bf_adjustable: "galvanized",
  damper_frame: "galvanized",
  damper_mounting_cylinder: "galvanized",
  c_frame: "galvanized",
  filt_frame: "galvanized",
  filt_panelFrame: "galvanized",
  st_flange: "galvanized",
  flexible_flange: "galvanized",
  bf_skrew: "stainless",
  c_pipe: "copper",
  door_handle: "plastic",
  corner: "plastic",
  bf_feet: "plastic",
  rubber: "rubber",
  filt_bag1PINK: "fabric",
  filt_bag2PINK: "fabric",
  filt_bag1YELLOW: "fabric",
  filt_bag2YELLOW: "fabric",
  st_fabric: "fabric",
  flexible_fabric: "fabric",
  silencer_media: "fabric",
  transparent: "glass",
  menerga_transparent: "glass",
  menerga_transparent2: "glass",
};

const abstractNames = new Set(["image", "hot_spot", "supply_air", "outdoor_air", "extract_air", "exhaust_air"]);

export function assignMaterialTypes(scene: Scene): Scene {
  return { ...scene, groups: scene.groups.map(assignGroup) };
}

function assignGroup(g: Group): Group {
  return {
    ...g,
    meshes: g.meshes?.map((m) => {
      const name = (m.material as Material & { readonly name?: string }).name ?? "";
      const type = typesByName[name];
      return type
        ? { ...m, material: { ...m.material, type } }
        : abstractNames.has(name)
          ? { ...m, material: { ...m.material, castShadow: false } }
          : m;
    }),
    groups: g.groups?.map(assignGroup),
  };
}
