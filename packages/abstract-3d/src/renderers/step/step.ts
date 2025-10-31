import {
  Scene,
  vec3Zero,
  Group,
  Vec3,
  vec3TransRot,
  vec3RotCombine,
  Cylinder,
  Material,
  Plane,
  Box,
  Vec2,
  vec3,
  vec3Scale,
  vec3Add,
  vec3Sub,
  vec3Rot,
} from "../../abstract-3d.js";
import {
  MutableStep,
  GEOMETRIC_REPRESENTATION_CONTEXT_3D,
  LENGTH_UNIT,
  NAMED_UNIT,
  UNCERTAINTY_MEASURE_WITH_UNIT,
  HEADER,
  ENDSEC,
  APPLICATION_CONTEXT,
  APPLICATION_PROTOCOL_DEFINITION,
} from "./step-encoding.js";
import { stepBox } from "./step-geometries/step-box.js";
import { stepCone } from "./step-geometries/step-cone.js";
import { stepCylinder } from "./step-geometries/step-cylinder.js";
import { stepPlane } from "./step-geometries/step-plane.js";

const DEFAULT_DATE_UNIX = "1970-01-01T00:00:00";

export const render = (scene: Scene): string => {
  const date = new Date().toISOString().split(".")[0];

  const m: MutableStep = { refs: new Map<string, number>([]), step: "", geoContext3d: 7 };
  const applicationContext = APPLICATION_CONTEXT(m);
  APPLICATION_PROTOCOL_DEFINITION(applicationContext, m);

  const lengthUnit = LENGTH_UNIT(m);
  const uncertainty = UNCERTAINTY_MEASURE_WITH_UNIT(lengthUnit, m);
  const context3D = GEOMETRIC_REPRESENTATION_CONTEXT_3D(
    // 1
    lengthUnit,
    NAMED_UNIT("PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.)", m),
    NAMED_UNIT("SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT()", m),
    uncertainty,
    m
  );
  if (context3D !== m.geoContext3d) {
    throw Error("Context 3d is not correct");
  }

  for (const g of scene.groups) {
    stepGroup(g, scene.center_deprecated ?? vec3Zero, scene.rotation_deprecated ?? vec3Zero, m);
  }

  return `${HEADER(date ?? DEFAULT_DATE_UNIX)}${m.step}${ENDSEC()}`;
};

function stepGroup(g: Group, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);
  for (const mesh of g.meshes ?? []) {
    switch (mesh.geometry.type) {
      case "Box":
        stepBox(mesh.geometry, mesh.material, pos, rot, m);
        break;
      case "Plane": {
        stepPlane(mesh.geometry, mesh.material, pos, rot, m);
        break;
      }
      case "Cylinder":
        stepCylinder(mesh.geometry, mesh.material, pos, rot, m);
        break;
      case "Cone":
        stepCone(mesh.geometry, mesh.material, pos, rot, m);
        break;
      default:
        break;
    }
  }

  for (const c of g.groups ?? []) {
    stepGroup(c, pos, rot, m);
  }
}
