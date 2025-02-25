import { Vec2, Vec3 } from "../../abstract-3d.js";

export type MutableStep = { refs: Map<string, number>; step: string };

const mutate = (step: string, m: MutableStep): number => {
  const prevRef = m.refs.get(step);
  if (prevRef !== undefined) {
    return prevRef;
  } else {
    const newRef = m.refs.size + 1;
    m.refs.set(step, newRef);
    m.step += `
#${newRef} = ${step};`;
    return newRef;
  }
};

export const HEADER = (): string =>
  `ISO-10303-21;
HEADER;
FILE_DESCRIPTION(('FreeCAD Model'),'2;1');
FILE_NAME('Open CASCADE Shape Model','2024-09-10T08:42:01',('Author'),(
    ''),'Open CASCADE STEP processor 7.6','FreeCAD','Unknown');
FILE_SCHEMA(('AUTOMOTIVE_DESIGN'));
ENDSEC;
DATA;`;

export const ENDSEC = (): string =>
  `
ENDSEC;
END-ISO-10303-21;`;

export const CARTESIAN_POINT = (p: Vec3 | Vec2, m: MutableStep): number =>
  mutate(
    `CARTESIAN_POINT('', (${p.x.toFixed(1)}, ${p.y.toFixed(1)}${
      (p as Vec3)?.z !== undefined ? `, ${(p as Vec3).z.toFixed(1)}` : ""
    }))`,
    m
  );

export const DIRECTION = (d: Vec3 | Vec2, m: MutableStep): number =>
  mutate(
    `DIRECTION('',(${d.x.toFixed(1)}, ${d.y.toFixed(1)}${
      (d as Vec3)?.z !== undefined ? `, ${(d as Vec3).z.toFixed(1)}` : ""
    }))`,
    m
  );

export const VERTEX_POINT = (CARTESIAN_POINT: number, m: MutableStep): number =>
  mutate(`VERTEX_POINT('',#${CARTESIAN_POINT})`, m);

export const LINE = (CARTESIAN_POINT: number, VECTOR: number, m: MutableStep): number =>
  mutate(`LINE('',#${CARTESIAN_POINT},#${VECTOR})`, m);

export const CIRCLE = (AXIS2_PLACEMENT_3D: number, m: MutableStep): number =>
  mutate(`CIRCLE('',#${AXIS2_PLACEMENT_3D},2.)`, m);

export const VECTOR = (DIRECTION: number, m: MutableStep): number => mutate(`VECTOR('',#${DIRECTION},1.)`, m);

export const EDGE_CURVE = (VERTEX_POINT_FROM: number, VERTEX_POINT_TO: number, LINE: number, m: MutableStep): number =>
  mutate(`EDGE_CURVE('',#${VERTEX_POINT_TO},#${VERTEX_POINT_FROM},#${LINE},.T.)`, m);

export const ORIENTED_EDGE = (EDGE_CURVE: number, m: MutableStep): number =>
  mutate(`ORIENTED_EDGE('',*,*,#${EDGE_CURVE},.F.)`, m);

export const SURFACE_CURVE = (CIRCLE: number, PCURVE1: number, PCURVE2: number, m: MutableStep): number =>
  mutate(`SURFACE_CURVE('',#${CIRCLE},(#${PCURVE1},#${PCURVE2}),.PCURVE_S1.)`, m);

export const SEAM_CURVE = (LINE: number, PCURVE1: number, PCURVE2: number, m: MutableStep): number =>
  mutate(`SEAM_CURVE('',#${LINE},(#${PCURVE1},#${PCURVE2}),.PCURVE_S1.)`, m);

export const ADVANCED_FACE = (
  faceRef: number,
  planeOrPcurveRef: number,
  m: MutableStep,
  type: "T" | "F" = "T"
): number => mutate(`ADVANCED_FACE('',(#${faceRef}),#${planeOrPcurveRef},.${type}.)`, m);

export const OPEN_SHELL = (ADVANCED_FACE: number, m: MutableStep): number =>
  mutate(`OPEN_SHELL('',(#${ADVANCED_FACE}))`, m);

export const FACE_BOUND = (EDGE_CURVE: number, type: "T" | "F", m: MutableStep): number =>
  mutate(`FACE_BOUND('',#${EDGE_CURVE},.${type}.)`, m);

export const EDGE_LOOP = (ORIENTED_EDGE: ReadonlyArray<number>, m: MutableStep): number =>
  mutate(`EDGE_LOOP('',(${ORIENTED_EDGE.map((af) => `#${af}`).join(",")}))`, m);

export const PLANE = (AXIS2_PLACEMENT_3D: number, m: MutableStep): number =>
  mutate(`PLANE('',#${AXIS2_PLACEMENT_3D})`, m);

export const PCURVE = (
  CYLINDRICAL_SURFACE_or_PLANE: number,
  DEFINITIONAL_REPRESENTATION: number,
  m: MutableStep
): number => mutate(`PCURVE('',#${CYLINDRICAL_SURFACE_or_PLANE},#${DEFINITIONAL_REPRESENTATION})`, m);

export const CYLINDRICAL_SURFACE = (AXIS2_PLACEMENT_3D: number, m: MutableStep): number =>
  mutate(`CYLINDRICAL_SURFACE('',#${AXIS2_PLACEMENT_3D},2.)`, m);

export const DEFINITIONAL_REPRESENTATION = (LINEorCircle: number, m: MutableStep): number =>
  mutate(`DEFINITIONAL_REPRESENTATION('',(#${LINEorCircle}),#7)`, m);

export const SHELL_BASED_SURFACE_MODEL = (OPEN_SHELL: number, m: MutableStep): number =>
  mutate(`SHELL_BASED_SURFACE_MODEL('',(#${OPEN_SHELL}))`, m);

export const MANIFOLD_SURFACE_SHAPE_REPRESENTATION = (
  AXIS2_PLACEMENT_3D: number,
  CLOSED_SHELL: number,
  m: MutableStep
): number => mutate(`MANIFOLD_SURFACE_SHAPE_REPRESENTATION('',(#${AXIS2_PLACEMENT_3D},#${CLOSED_SHELL}),#4)`, m);

export const ADVANCED_BREP_SHAPE_REPRESENTATION = (
  AXIS2_PLACEMENT_3D: number,
  MANIFOLD_SOLID_BREP: number,
  m: MutableStep
): number => mutate(`ADVANCED_BREP_SHAPE_REPRESENTATION('',(#${AXIS2_PLACEMENT_3D},#${MANIFOLD_SOLID_BREP}),#4)`, m);

export const CLOSED_SHELL = (ADVANCED_FACE: ReadonlyArray<number>, m: MutableStep): number =>
  mutate(`CLOSED_SHELL('', (${ADVANCED_FACE.map((af) => `#${af}`).join(",")}))`, m);

export const CLOSED_SHELL2 = (ADVANCED_FACE: number, m: MutableStep): number =>
  mutate(`CLOSED_SHELL('', (#${ADVANCED_FACE}))`, m);

export const MANIFOLD_SOLID_BREP = (closedRef: number, m: MutableStep): number =>
  mutate(`MANIFOLD_SOLID_BREP('', #${closedRef})`, m);

export const AXIS2_PLACEMENT_3D = (
  CARTESIAN_POINT: number,
  DIRECTION_NORMAL: number,
  DIRECTION_PLANE_DIRECITON: number,
  m: MutableStep
): number => mutate(`AXIS2_PLACEMENT_3D('',#${CARTESIAN_POINT},#${DIRECTION_NORMAL},#${DIRECTION_PLANE_DIRECITON})`, m);

export const MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION = (STYLED_ITEM: number, m: MutableStep): number =>
  mutate(`MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION('',(#${STYLED_ITEM}),#4)`, m);

export const STYLED_ITEM = (
  PRESENTATION_STYLE_ASSIGNMENT: number,
  MANIFOLD_SOLID_BREP: number,
  m: MutableStep
): number => mutate(`STYLED_ITEM('color',(#${PRESENTATION_STYLE_ASSIGNMENT}),#${MANIFOLD_SOLID_BREP})`, m);

export const PRESENTATION_STYLE_ASSIGNMENT = (
  SURFACE_STYLE_USAGE: number,
  CURVE_STYLE: number,
  m: MutableStep
): number => mutate(`PRESENTATION_STYLE_ASSIGNMENT((#${SURFACE_STYLE_USAGE},#${CURVE_STYLE}))`, m);

export const SURFACE_STYLE_USAGE = (SURFACE_SIDE_STYLE: number, m: MutableStep): number =>
  mutate(`SURFACE_STYLE_USAGE(.BOTH.,#${SURFACE_SIDE_STYLE})`, m);

export const SURFACE_SIDE_STYLE = (SURFACE_STYLE_FILL_AREA: number, m: MutableStep): number =>
  mutate(`SURFACE_SIDE_STYLE('',(#${SURFACE_STYLE_FILL_AREA}))`, m);

export const SURFACE_STYLE_FILL_AREA = (FILL_AREA_STYLE: number, m: MutableStep): number =>
  mutate(`SURFACE_STYLE_FILL_AREA(#${FILL_AREA_STYLE})`, m);

export const FILL_AREA_STYLE = (FILL_AREA_STYLE_COLOUR: number, m: MutableStep): number =>
  mutate(`FILL_AREA_STYLE('',(#${FILL_AREA_STYLE_COLOUR}))`, m);

export const FILL_AREA_STYLE_COLOUR = (COLOUR_RGB: number, m: MutableStep): number =>
  mutate(`FILL_AREA_STYLE_COLOUR('',#${COLOUR_RGB})`, m);

export const CURVE_STYLE = (DRAUGHTING_PRE_DEFINED_CURVE_FONT: number, COLOUR_RGB: number, m: MutableStep): number =>
  mutate(`CURVE_STYLE('',#${DRAUGHTING_PRE_DEFINED_CURVE_FONT},POSITIVE_LENGTH_MEASURE(0.1),#${COLOUR_RGB})`, m);

export const COLOUR_RGB = (color: { r: number; g: number; b: number }, m: MutableStep): number =>
  mutate(`COLOUR_RGB('',${(color.r / 255).toFixed(3)},${(color.g / 255).toFixed(3)},${(color.b / 255).toFixed(3)})`, m);

export const DRAUGHTING_PRE_DEFINED_CURVE_FONT = (curve: "continuous", m: MutableStep): number =>
  mutate(`DRAUGHTING_PRE_DEFINED_CURVE_FONT(${curve})`, m);

export const GEOMETRIC_REPRESENTATION_CONTEXT_3D = (
  LENGTH_UNIT: number,
  NAMED_UNIT_PLANE_ANGLE_UNIT: number,
  NAMED_UNIT_SOLID_ANGLE: number,
  m: MutableStep
): number =>
  mutate(
    `( GEOMETRIC_REPRESENTATION_CONTEXT(3)
GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#6)) GLOBAL_UNIT_ASSIGNED_CONTEXT(
(#${LENGTH_UNIT},#${NAMED_UNIT_PLANE_ANGLE_UNIT},#${NAMED_UNIT_SOLID_ANGLE})) REPRESENTATION_CONTEXT('Context #4',
  '3D Context with UNIT and UNCERTAINTY') )`,
    m
  );

export const GEOMETRIC_REPRESENTATION_CONTEXT_2D = (m: MutableStep): number =>
  mutate(
    `( GEOMETRIC_REPRESENTATION_CONTEXT(2)
PARAMETRIC_REPRESENTATION_CONTEXT() REPRESENTATION_CONTEXT('2D SPACE',''
  ) )`,
    m
  );

export const LENGTH_UNIT = (m: MutableStep): number =>
  mutate(`( LENGTH_UNIT() NAMED_UNIT(*) SI_UNIT(.MILLI.,.METRE.) )`, m);

export const NAMED_UNIT = (
  unit: "PLANE_ANGLE_UNIT() SI_UNIT($,.RADIAN.)" | "SI_UNIT($,.STERADIAN.) SOLID_ANGLE_UNIT()",
  m: MutableStep
): number => mutate(`( NAMED_UNIT(*) ${unit} )`, m);

export const UNCERTAINTY_MEASURE_WITH_UNIT = (LENGTH_UNIT: number, m: MutableStep): number =>
  mutate(
    `UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-07),#${LENGTH_UNIT},
  'distance_accuracy_value','confusion accuracy')`,
    m
  );
