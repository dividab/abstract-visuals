import { Vec3 } from "../../abstract-3d";

export const CARTESIAN_POINT = (v: Vec3, cartRef: number): string =>
  `#${cartRef} = CARTESIAN_POINT('', (${v.x}, ${v.y}, ${v.z}));`;

export const POLY_LOOP = (
  cartRef1: number,
  cartRef2: number,
  cartRef3: number,
  cartRef4: number,
  polyRef: number
): string => `#${polyRef} = POLY_LOOP('', (#${cartRef1}, #${cartRef2}, #${cartRef3}, #${cartRef4}));`;

export const ADVANCED_FACE = (polyRef: number, advRef: number): string =>
  `#${advRef} = ADVANCED_FACE('', (#${polyRef}), .T.);`;

export const CLOSED_SHELL = (
  advRef1: number,
  advRef2: number,
  advRef3: number,
  advRef4: number,
  advRef5: number,
  advRef6: number,
  closedRef: number
): string =>
  `#${closedRef} = CLOSED_SHELL('', (#${advRef1}, #${advRef2}, #${advRef3}, #${advRef4}, #${advRef5}, #${advRef6}));`;

export const MANIFOLD_SOLID_BREP = (closedRef: number, maniRef: number): string =>
  `#${maniRef} = MANIFOLD_SOLID_BREP('', #${closedRef});`;
