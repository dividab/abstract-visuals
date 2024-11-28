import * as A3D from "../../abstract-3d.js";
import {
  MutableStep,
  GEOMETRIC_REPRESENTATION_CONTEXT_3D,
  LENGTH_UNIT,
  NAMED_UNIT,
  UNCERTAINTY_MEASURE_WITH_UNIT,
  GEOMETRIC_REPRESENTATION_CONTEXT_2D,
  HEADER,
  ENDSEC,
} from "./step-encoding.js";
import { stepBox } from "./step-geometries/step-box.js";
import { stepPlane } from "./step-geometries/step-plane.js";

// export const toStep2 = (scene: A3D.Scene): string => {
//   const start = performance.now();
//   for (let i = 0; i < 100; i++) {
//     toStep(scene);
//   }
//   console.log((performance.now() - start) / 100);
//   return "";
// };

export const toStep = (scene: A3D.Scene): string => {
  const m: MutableStep = { refs: new Map<string, number>([]), step: "" };
  GEOMETRIC_REPRESENTATION_CONTEXT_3D(
    // 1
    LENGTH_UNIT(m),
    NAMED_UNIT("PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.)", m),
    NAMED_UNIT("SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT()", m),
    m
  );
  UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_UNIT(m), m);
  GEOMETRIC_REPRESENTATION_CONTEXT_2D(m); //

  for (const g of scene.groups) {
    stepGroup(g, scene.center_deprecated ?? A3D.vec3Zero, scene.rotation_deprecated ?? A3D.vec3Zero, m);
  }

  return `${HEADER()}${m.step}${ENDSEC()}`;
};

function stepGroup(g: A3D.Group, parentPos: A3D.Vec3, parentRot: A3D.Vec3, m: MutableStep): void {
  const pos = A3D.vec3TransRot(g.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, g.rot ?? A3D.vec3Zero);
  for (const mesh of g.meshes ?? []) {
    switch (mesh.geometry.type) {
      case "Box":
        stepBox(mesh.geometry, mesh.material, pos, rot, m);
        break;
      case "Plane":
        stepPlane(mesh.geometry, mesh.material, pos, rot, m);
        break;
      default:
        break;
    }
  }

  for (const c of g.groups ?? []) {
    stepGroup(c, pos, rot, m);
  }
}
