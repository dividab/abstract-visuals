import { Scene, vec3Zero, Group, Vec3, vec3TransRot, vec3RotCombine, Cylinder, Material, Plane, Box } from "../../abstract-3d.js";
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
import { stepCylinder } from "./step-geometries/step-cylinder.js";
import { stepPlane } from "./step-geometries/step-plane.js";

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
};

function stepGroup(g: Group, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {

  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);
  for (const mesh of g.meshes ?? []) {
    switch (mesh.geometry.type) {
      case "Box":
        stepBox(mesh.geometry, mesh.material, pos, rot, m);
        break;
      case "Plane":
        stepPlane(mesh.geometry, mesh.material, pos, rot, m);
        break;
      case "Cylinder":
        stepCylinder(mesh.geometry, mesh.material, pos, rot, m);
        break;
      default:
        break;
    }
  }

  for (const c of g.groups ?? []) {
    stepGroup(c, pos, rot, m);
  }
}
