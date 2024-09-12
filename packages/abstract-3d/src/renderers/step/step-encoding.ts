import { vec3, Vec3, vec3Zero } from "../../abstract-3d";

export const CARTESIAN_POINT = (v: Vec3, CARTESIAN_POINT: number): string =>
  `#${CARTESIAN_POINT} = CARTESIAN_POINT('', (${v.x}, ${v.y}, ${v.z}));`;

export const DIRECTION = (v: Vec3, DIRECTION: number): string =>
  `#${DIRECTION} = DIRECTION('',(${v.x}, ${v.y}, ${v.z}));`;

export const VERTEX_POINT = (CARTESIAN_POINT: number, VERTEX_POINT: number): string =>
  `#${VERTEX_POINT} = VERTEX_POINT('',#${CARTESIAN_POINT});`;

export const LINE = (CARTESIAN_POINT: number, VERTEX_POINT: number, LINE: number): string =>
  `#${LINE} = LINE('',#${CARTESIAN_POINT},#${VERTEX_POINT});;`;

export const VECTOR = (DIRECTION: number, VECTOR: number): string => `#${VECTOR} = VECTOR('',#${DIRECTION},1.);`;

export const EDGE_CURVE = (VERTEX_POINT_1: number, VERTEX_POINT_2: number, LINE: number, EDGE_CURVE: number): string =>
  `#${EDGE_CURVE} = EDGE_CURVE('',#${VERTEX_POINT_1},#${VERTEX_POINT_2},#${LINE},.T.);`;

export const ORIENTED_EDGE = (EDGE_CURVE: number, ORIENTED_EDGE: number): string =>
  `#${ORIENTED_EDGE} = ORIENTED_EDGE('',*,*,#${EDGE_CURVE},.F.);`;

export const POLY_LOOP = (
  cartRef1: number,
  cartRef2: number,
  cartRef3: number,
  cartRef4: number,
  polyRef: number
): string => `#${polyRef} = POLY_LOOP('', (#${cartRef1}, #${cartRef2}, #${cartRef3}, #${cartRef4}));`;

export const ADVANCED_FACE = (faceRef: number, planeRef: number, ADVANCED_FACE: number): string =>
  `#${ADVANCED_FACE} = ADVANCED_FACE('',(#${faceRef}),#${planeRef},.T.);`;

export const ADVANCED_FACE2 = (polyRef: number, ADVANCED_FACE: number): string =>
  `#${ADVANCED_FACE} = ADVANCED_FACE('', (#${polyRef}), .T.);`;

export const OPEN_SHELL = (ADVANCED_FACE: number, OPEN_SHELL: number): string =>
  `#${OPEN_SHELL} = OPEN_SHELL('',(#${ADVANCED_FACE}));`;

export const FACE_BOUND = (EDGE_CURVE: number, FACE_BOUND: number): string =>
  `#${FACE_BOUND} = FACE_BOUND('',#${EDGE_CURVE},.T.);`;

export const EDGE_LOOP = (
  ORIENTED_EDGE_1: number,
  ORIENTED_EDGE_2: number,
  ORIENTED_EDGE_3: number,
  ORIENTED_EDGE_4: number,
  EDGE_LOOP: number
): string =>
  `#${EDGE_LOOP} = EDGE_LOOP('',(#${ORIENTED_EDGE_1},#${ORIENTED_EDGE_2},#${ORIENTED_EDGE_3},#${ORIENTED_EDGE_4}));`;

export const SHELL_BASED_SURFACE_MODEL = (OPEN_SHELL: number, SHELL_BASED_SURFACE_MODEL: number): string =>
  `#${SHELL_BASED_SURFACE_MODEL} = SHELL_BASED_SURFACE_MODEL('',(#${OPEN_SHELL}));`;

export const SHELL_BASED_SURFACE_MODEL_big = (
  ORIENTED_EDGE_1: number,
  ORIENTED_EDGE_2: number,
  ORIENTED_EDGE_3: number,
  ORIENTED_EDGE_4: number,
  PLANE: number,
  i: number
): string =>
  `${SHELL_BASED_SURFACE_MODEL(i + 1, i + 0)}
${OPEN_SHELL(i + 2, i + 1)}
${ADVANCED_FACEbig(ORIENTED_EDGE_1, ORIENTED_EDGE_2, ORIENTED_EDGE_3, ORIENTED_EDGE_4, PLANE, i + 2)}`;

export const MANIFOLD_SURFACE_SHAPE_REPRESENTATION = (
  shellRef: number,
  MANIFOLD_SURFACE_SHAPE_REPRESENTATION: number
): string =>
  `#${MANIFOLD_SURFACE_SHAPE_REPRESENTATION} = MANIFOLD_SURFACE_SHAPE_REPRESENTATION('',(#8,#${shellRef}),#1);`;

export const ADVANCED_BREP_SHAPE_REPRESENTATION = (
  maniFoldRef: number,
  ADVANCED_BREP_SHAPE_REPRESENTATION: number
): string => `#${ADVANCED_BREP_SHAPE_REPRESENTATION} = ADVANCED_BREP_SHAPE_REPRESENTATION('',(#8,#${maniFoldRef}),#1);`;

export const CLOSED_SHELL = (
  ADVANCED_FACE_1: number,
  ADVANCED_FACE_2: number,
  ADVANCED_FACE_3: number,
  ADVANCED_FACE_4: number,
  ADVANCED_FACE_5: number,
  ADVANCED_FACE_6: number,
  CLOSED_SHELL: number
): string =>
  `#${CLOSED_SHELL} = CLOSED_SHELL('', (#${ADVANCED_FACE_1}, #${ADVANCED_FACE_2}, #${ADVANCED_FACE_3}, #${ADVANCED_FACE_4}, #${ADVANCED_FACE_5}, #${ADVANCED_FACE_6}));`;

export const CLOSED_SHELL2 = (ADVANCED_FACE: number, CLOSED_SHELL: number): string =>
  `#${CLOSED_SHELL} = CLOSED_SHELL('', (#${ADVANCED_FACE}));`;

export const MANIFOLD_SOLID_BREP = (closedRef: number, maniRef: number): string =>
  `#${maniRef} = MANIFOLD_SOLID_BREP('', #${closedRef});`;

export const AXIS2_PLACEMENT_3D = (
  CARTESIAN_POINT: number,
  DIRECTION_NORMAL: number,
  DIRECTION_PLANE_DIRECITON: number,
  AXIS2_PLACEMENT_3D: number
): string =>
  `#${AXIS2_PLACEMENT_3D} = AXIS2_PLACEMENT_3D('',#${CARTESIAN_POINT},#${DIRECTION_NORMAL},#${DIRECTION_PLANE_DIRECITON});`;

export const PLANE = (axisRef: number, planeRef: number): string => `#${planeRef} = PLANE('',#${axisRef});`;

export const PLANEbig = (vec1: Vec3, vec2: Vec3, i: number): string => `${PLANE(i + 1, i + 0)}
${AXIS2_PLACEMENT_3D(i + 2, i + 3, i + 4, i + 1)}
${CARTESIAN_POINT(vec3(0, 0, 0), i + 2)}
${DIRECTION(vec1, i + 3)}
${DIRECTION(vec2, i + 4)}`;

export const ORIENTED_EDGE_big = (cord1Ref: number, vec1Ref: number, vec2Ref: number, i: number): string => {
  return `${ORIENTED_EDGE(i + 1, i + 0)}
${EDGE_CURVE(vec2Ref, vec1Ref, i + 2, i + 1)}
${LINE(cord1Ref, i + 3, i + 2)}
${VECTOR(i + 4, i + 3)}
${DIRECTION(vec3Zero, i + 4)}`;
};

export const ADVANCED_FACEbig = (
  edge1Ref: number,
  edge2Ref: number,
  edge3Ref: number,
  edge4Ref: number,
  planeRef: number,
  i: number
): string =>
  `${ADVANCED_FACE(i + 1, planeRef, i + 0)}
${FACE_BOUND(i + 2, i + 1)}
${EDGE_LOOP(edge1Ref, edge2Ref, edge3Ref, edge4Ref, i + 2)}`;

export const MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION = (
  color: { r: number; g: number; b: number },
  maniRef: number,
  i: number
): string => `#${i} = MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION('',(#${i + 1}),#1);
#${i + 1} = STYLED_ITEM('color',(#${i + 2}),#${maniRef});
#${i + 2} = PRESENTATION_STYLE_ASSIGNMENT((#${i + 3},#${i + 9}));
#${i + 3} = SURFACE_STYLE_USAGE(.BOTH.,#${i + 4});
#${i + 4} = SURFACE_SIDE_STYLE('',(#${i + 5}));
#${i + 5} = SURFACE_STYLE_FILL_AREA(#${i + 6});
#${i + 6} = FILL_AREA_STYLE('',(#${i + 7}));
#${i + 7} = FILL_AREA_STYLE_COLOUR('',#${i + 8});
#${i + 8} = COLOUR_RGB('',${color.r / 255},${color.g / 255},${color.b / 255});
#${i + 9} = CURVE_STYLE('',#${i + 10},POSITIVE_LENGTH_MEASURE(0.1),#${i + 11});
#${i + 10} = DRAUGHTING_PRE_DEFINED_CURVE_FONT('continuous');
#${i + 11} = COLOUR_RGB('',${color.r / 255},${color.g / 255},${color.b / 255});
`;
