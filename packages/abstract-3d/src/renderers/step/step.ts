import * as A3D from "../../abstract-3d";
import { PLANEbig } from "./step-encoding";
import { stepBox } from "./step-geometries/step-box";
import { stepPlane } from "./step-geometries/step-plane";

export const toStep = (scene: A3D.Scene): string => {
  let step = "";
  let nbrRefs = 12;

  for (const g of scene.groups ?? []) {
    const [newStep, newNbrRefs] = stepGroup(
      g,
      scene.center_deprecated ?? A3D.vec3Zero,
      scene.rotation_deprecated ?? A3D.vec3Zero,
      nbrRefs
    );
    step += newStep;
    nbrRefs += newNbrRefs;
  }

  return `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('FreeCAD Model'),'2;1');
FILE_NAME('Open CASCADE Shape Model','2024-09-10T08:42:01',('Author'),(
    ''),'Open CASCADE STEP processor 7.6','FreeCAD','Unknown');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
ENDSEC;
DATA;${step}
${PLANEbig(A3D.vec3PosZ, A3D.vec3PosX, 7)}
#1 = ( GEOMETRIC_REPRESENTATION_CONTEXT(3) 
GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#6)) GLOBAL_UNIT_ASSIGNED_CONTEXT(
(#3,#4,#5)) REPRESENTATION_CONTEXT('Context #1',
  '3D Context with UNIT and UNCERTAINTY') );
#2 = ( GEOMETRIC_REPRESENTATION_CONTEXT(2) 
PARAMETRIC_REPRESENTATION_CONTEXT() REPRESENTATION_CONTEXT('2D SPACE',''
  ) );
#3 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );
#4 = ( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );
#5 = ( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() );
#6 = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#3,
  'distance_accuracy_value','confusion accuracy');
ENDSEC;
END-ISO-10303-21;`;
};

function stepGroup(g: A3D.Group, parentPos: A3D.Vec3, parentRot: A3D.Vec3, refIdx: number): [string, number] {
  let step = "";
  let nbrRefs = 0;
  const pos = A3D.vec3TransRot(g.pos, parentPos, parentRot);
  const rot = A3D.vec3RotCombine(parentRot, g.rot ?? A3D.vec3Zero);
  for (const m of g.meshes ?? []) {
    switch (m.geometry.type) {
      case "Box": {
        const [newStep, newNbrRefs] = stepBox(m.geometry, m.material, pos, rot, refIdx + nbrRefs);
        step += newStep;
        nbrRefs += newNbrRefs;
        break;
      }
      case "Plane": {
        const [newStep, newNbrRefs] = stepPlane(m.geometry, m.material, pos, rot, refIdx + nbrRefs);
        step += newStep;
        nbrRefs += newNbrRefs;
        break;
      }
      default:
        break;
    }
  }

  for (const c of g.groups ?? []) {
    const [newStep, newNbrRefs] = stepGroup(c, pos, rot, refIdx + nbrRefs);
    step += newStep;
    nbrRefs += newNbrRefs;
  }

  return [step, nbrRefs];
}
