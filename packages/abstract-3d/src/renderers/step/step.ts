import * as A3D from "../../abstract-3d";
import { stepBox } from "./step-geometries/step-box";

export const toStep = (scene: A3D.Scene): string => {
  let step = "";
  let nbrRefs = 0;

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
FILE_DESCRIPTION(('Aircalc'), '1');
FILE_NAME('aircalc.stp', '2024-09-09T12:00:00', (''), (''), 'Author', '', '');
FILE_SCHEMA(('AP214'));
ENDSEC;
DATA;${step}
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
