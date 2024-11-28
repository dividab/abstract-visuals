import {
  Plane,
  Material,
  Vec3,
  vec2Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  vec3PosX,
  vec3PosZ,
} from "../../../abstract-3d.js";
import { parseRgb } from "../../shared.js";
import {
  ADVANCED_FACE,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  COLOUR_RGB,
  CURVE_STYLE,
  DIRECTION,
  DRAUGHTING_PRE_DEFINED_CURVE_FONT,
  EDGE_CURVE,
  EDGE_LOOP,
  FACE_BOUND,
  FILL_AREA_STYLE_COLOUR,
  LINE,
  MANIFOLD_SURFACE_SHAPE_REPRESENTATION,
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION,
  MutableStep,
  OPEN_SHELL,
  ORIENTED_EDGE,
  PLANE,
  PRESENTATION_STYLE_ASSIGNMENT,
  SHELL_BASED_SURFACE_MODEL,
  STYLED_ITEM,
  SURFACE_SIDE_STYLE,
  SURFACE_STYLE_FILL_AREA,
  SURFACE_STYLE_USAGE,
  VECTOR,
  VERTEX_POINT,
} from "../step-encoding.js";

export function stepPlane(p: Plane, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const half = vec2Scale(p.size, 0.5);
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const cart3tr = (x: number, y: number): number => CARTESIAN_POINT(vec3TransRot(vec3(x, y, 0), pos, rot), m);
  const v0 = VECTOR(DIRECTION(vec3Zero, m), m);
  const c0 = CARTESIAN_POINT(vec3Zero, m);
  const [c1, c2] = [cart3tr(-half.x, -half.y), cart3tr(half.x, -half.y)];
  const [c3, c4] = [cart3tr(half.x, half.y), cart3tr(-half.x, half.y)];
  const [v1, v2, v3, v4] = [VERTEX_POINT(c1, m), VERTEX_POINT(c2, m), VERTEX_POINT(c3, m), VERTEX_POINT(c4, m)];
  const [l1, l2, l3, l4] = [LINE(c1, v0, m), LINE(c2, v0, m), LINE(c3, v0, m), LINE(c4, v0, m)];
  const [oe1, oe2, oe3, oe4] = [
    ORIENTED_EDGE(EDGE_CURVE(v1, v2, l1, m), m),
    ORIENTED_EDGE(EDGE_CURVE(v2, v3, l2, m), m),
    ORIENTED_EDGE(EDGE_CURVE(v3, v4, l3, m), m),
    ORIENTED_EDGE(EDGE_CURVE(v4, v1, l4, m), m),
  ];

  const [d1, d2] = [DIRECTION(vec3RotCombine(vec3PosX, rot), m), DIRECTION(vec3RotCombine(vec3PosZ, rot), m)];

  const color = COLOUR_RGB(parseRgb(mat.normal), m);
  const sbsm = SHELL_BASED_SURFACE_MODEL(
    OPEN_SHELL(
      ADVANCED_FACE(
        FACE_BOUND(EDGE_LOOP([oe1, oe2, oe3, oe4], m), "T", m),
        PLANE(AXIS2_PLACEMENT_3D(c0, d2, d1, m), m),
        m
      ),
      m
    ),
    m
  );

  MANIFOLD_SURFACE_SHAPE_REPRESENTATION(
    AXIS2_PLACEMENT_3D(c0, DIRECTION(vec3PosZ, m), DIRECTION(vec3PosX, m), m),
    sbsm,
    m
  );

  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION(
    STYLED_ITEM(
      PRESENTATION_STYLE_ASSIGNMENT(
        SURFACE_STYLE_USAGE(SURFACE_SIDE_STYLE(SURFACE_STYLE_FILL_AREA(FILL_AREA_STYLE_COLOUR(color, m), m), m), m),
        CURVE_STYLE(DRAUGHTING_PRE_DEFINED_CURVE_FONT("continuous", m), color, m),
        m
      ),
      sbsm,
      m
    ),
    m
  );
}
