import { Vec3 } from "../../abstract-3d";

export const CARTESIAN_POINT = (v: Vec3, cartRef: number): string =>
  `#${cartRef} = CARTESIAN_POINT('', (${v.x}, ${v.y}, ${v.z}));`;

export const DIRECTION = (v: Vec3, dirRef: number): string => `#${dirRef} = DIRECTION('',(${v.x}, ${v.y}, ${v.z}));`;

export const VERTEX_POINT = (cartRef: number, vertRef: number): string => `#${vertRef} = VERTEX_POINT('',#${cartRef});`;

export const LINE = (cartRef: number, vecRef: number, lineRef: number): string =>
  `#${lineRef} = LINE('',#${cartRef},#${vecRef});;`;

export const VECTOR = (dirRef: number, vecRef: number): string => `#${vecRef} = VECTOR('',#${dirRef},1.);`;

export const EDGE_CURVE = (vert1Ref: number, vert2Ref: number, lineRef: number, edgeRef: number): string =>
  `#${edgeRef} = EDGE_CURVE('',#${vert1Ref},#${vert2Ref},#${lineRef},.T.);`;

export const ORIENTED_EDGE = (edgeRef: number, oriRef: number): string =>
  `#${oriRef} = ORIENTED_EDGE('',*,*,#${edgeRef},.F.);`;

export const POLY_LOOP = (
  cartRef1: number,
  cartRef2: number,
  cartRef3: number,
  cartRef4: number,
  polyRef: number
): string => `#${polyRef} = POLY_LOOP('', (#${cartRef1}, #${cartRef2}, #${cartRef3}, #${cartRef4}));`;

export const ADVANCED_FACE = (faceRef: number, planeRef: number, advRef: number): string =>
  `#${advRef} = ADVANCED_FACE('',(#${faceRef}),#${planeRef},.T.);`;

export const OPEN_SHELL = (advRef: number, openRef: number): string => `#${openRef} = OPEN_SHELL('',(#${advRef}));`;

export const FACE_BOUND = (edgeRef: number, faceRef: number): string => `#${faceRef} = FACE_BOUND('',#${edgeRef},.T.);`;

export const EDGE_LOOP = (
  edge1Ref: number,
  edge2Ref: number,
  edge3Ref: number,
  edge4Ref: number,
  loopRef: number
): string => `#${loopRef} = EDGE_LOOP('',(#${edge1Ref},#${edge2Ref},#${edge3Ref},#${edge4Ref}));`;

export const SHELL_BASED_SURFACE_MODEL = (openShellRef: number, shellRef: number): string =>
  `#${shellRef} = SHELL_BASED_SURFACE_MODEL('',(#${openShellRef}));`;

export const MANIFOLD_SURFACE_SHAPE_REPRESENTATION = (axisRef: number, shellRef: number, maniFoldRef: number): string =>
  `#${maniFoldRef} = MANIFOLD_SURFACE_SHAPE_REPRESENTATION('',(#${axisRef},#${shellRef}),#1);`;

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

export const AXIS2_PLACEMENT_3D = (cartRef: number, dir1Ref: number, dir2Ref: number, axisRef: number): string =>
  `#${axisRef} = AXIS2_PLACEMENT_3D('',#${cartRef},#${dir1Ref},#${dir2Ref});`;

export const PLANE = (axisRef: number, planeRef: number): string => `#${planeRef} = PLANE('',#${axisRef});`;
