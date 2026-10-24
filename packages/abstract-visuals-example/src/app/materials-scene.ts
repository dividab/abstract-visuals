import type { MaterialType, Scene } from "../../../abstract-3d/src/abstract-3d.js";
import { box, cylinder, group, materialTypes, sphere, text, vec3, vec3Zero } from "../../../abstract-3d/src/abstract-3d.js";

/** A row of samples, a rounded box, a sphere and a cylinder, of each material type, labelled on the floor, to compare the types' finishes */

const colors: Record<MaterialType, string> = {
  painted: "rgb(222, 224, 228)",
  galvanized: "rgb(186, 190, 195)",
  aluminum: "rgb(205, 208, 212)",
  stainless: "rgb(196, 198, 200)",
  copper: "rgb(184, 115, 51)",
  plastic: "rgb(45, 45, 50)",
  rubber: "rgb(30, 30, 32)",
  fabric: "rgb(245, 95, 170)",
  glass: "rgb(200, 222, 232)",
};

const step = 450;
const label = { normal: "rgb(90, 90, 90)" };

export const materialsScene: Scene = {
  size_deprecated: vec3(materialTypes.length * step, 320, 1300),
  center_deprecated: vec3(((materialTypes.length - 1) * step) / 2, 160, -200),
  groups: materialTypes.map((type, i) => {
    const material = { normal: colors[type], type };
    return group(
      [
        box(vec3(300, 300, 300), material, vec3(0, 150, 200), vec3Zero, [], 2),
        sphere(150, material, vec3(0, 150, -200)),
        cylinder(vec3(0, 150, -580), 90, 300, material),
        text(vec3(0, 1, 480), type, 70, label, vec3(-Math.PI / 2, 0, 0)),
      ],
      vec3(i * step, 0, 0)
    );
  }),
};
