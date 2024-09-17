import * as A3D from "../../abstract-3d";
import { stepBox } from "./step-geometries/step-box";
import { stepPlane } from "./step-geometries/step-plane";

export const toStep = (scene: A3D.Scene): string => {
  let step = "";
  let nbrRefs = 14;

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
#1 = ( GEOMETRIC_REPRESENTATION_CONTEXT(3) 
GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#5)) GLOBAL_UNIT_ASSIGNED_CONTEXT(
(#2,#3,#4)) REPRESENTATION_CONTEXT('Context #1',
  '3D Context with UNIT and UNCERTAINTY') );
#2 = ( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) );
#3 = ( NAMED_UNIT(*) PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.) );
#4 = ( NAMED_UNIT(*) SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT() );
#5 = UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#2,
  'distance_accuracy_value','confusion accuracy');
#6 = SURFACE_STYLE_USAGE(.BOTH.,#7);
#7 = SURFACE_SIDE_STYLE('',(#8));
#8 = SURFACE_STYLE_FILL_AREA(#9);
#9 = FILL_AREA_STYLE('',(#10));
#10 = FILL_AREA_STYLE_COLOUR('',#11);
#11 = COLOUR_RGB('',0.800000010877,0.800000010877,0.800000010877);
#12 = CURVE_STYLE('',#13,POSITIVE_LENGTH_MEASURE(0.1),#14);
#13 = DRAUGHTING_PRE_DEFINED_CURVE_FONT('continuous');
#14 = COLOUR_RGB('',9.803921802644E-02,9.803921802644E-02,
  9.803921802644E-02);
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
