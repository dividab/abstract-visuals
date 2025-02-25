import { Scene, vec3Zero, Group, Vec3, vec3TransRot, vec3RotCombine, Cylinder, Material } from "../../abstract-3d.js";
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
import { stepCylinder2 } from "./step-geometries/step-cylinder.js";
import { stepPlane } from "./step-geometries/step-plane.js";

// export const toStep2 = (scene: A3D.Scene): string => {
//   const start = performance.now();
//   for (let i = 0; i < 100; i++) {
//     toStep(scene);
//   }
//   console.log((performance.now() - start) / 100);
//   return "";
// };

// eslint-disable-next-line functional/no-let
let cyl = "";

export const toStep = (scene: Scene): string => {
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
    stepGroup(g, scene.center_deprecated ?? vec3Zero, scene.rotation_deprecated ?? vec3Zero, m);
  }
  
  return `${HEADER()}${m.step}${ENDSEC()}`;
  return `${HEADER()}${cyl}${ENDSEC()}`;
};

let i = 0;
function stepGroup(g: Group, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {

  /*const c: Cylinder = {
    pos: { x: 1000, y: 2000, z: 3000 }, radius: 8, length: 5,
    type: "Cylinder"
  };
  const mat: Material = {
    normal: "rgb(100, 0, 0)",
  };
  const r = {x: 0, y: 0, z: Math.PI / 2};
  stepCylinderTest(c, mat, r);*/

  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);
  for (const mesh of g.meshes ?? []) {
    switch (mesh.geometry.type) {
      case "Box":
        //stepBox(mesh.geometry, mesh.material, pos, rot, m);
        break;
      case "Plane":
        stepPlane(mesh.geometry, mesh.material, pos, rot, m);
        break;
      case "Cylinder":
        //cyl += stepCylinder2(mesh.geometry, mesh.material, pos, rot, i);
        //i += 83;
        break;
      default:
        break;
    }
  }

  for (const c of g.groups ?? []) {
    stepGroup(c, pos, rot, m);
  }
}
