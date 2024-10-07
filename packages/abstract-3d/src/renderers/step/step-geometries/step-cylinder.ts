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
  Cylinder,
  vec2Zero,
  vec2,
  vec3NegX,
  vec3NegY,
  vec3NegZ,
  vec3PosY,
} from "../../../abstract-3d";
import { parseRgb } from "../../shared";
import {
  ADVANCED_BREP_SHAPE_REPRESENTATION,
  ADVANCED_FACE,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  CIRCLE,
  CLOSED_SHELL,
  COLOUR_RGB,
  CURVE_STYLE,
  CYLINDRICAL_SURFACE,
  DEFINITIONAL_REPRESENTATION,
  DIRECTION,
  DRAUGHTING_PRE_DEFINED_CURVE_FONT,
  EDGE_CURVE,
  EDGE_LOOP,
  FACE_BOUND,
  FILL_AREA_STYLE_COLOUR,
  LINE,
  MANIFOLD_SOLID_BREP,
  MANIFOLD_SURFACE_SHAPE_REPRESENTATION,
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION,
  MutableStep,
  OPEN_SHELL,
  ORIENTED_EDGE,
  PCURVE,
  PLANE,
  PRESENTATION_STYLE_ASSIGNMENT,
  SEAM_CURVE,
  SHELL_BASED_SURFACE_MODEL,
  STYLED_ITEM,
  SURFACE_CURVE,
  SURFACE_SIDE_STYLE,
  SURFACE_STYLE_FILL_AREA,
  SURFACE_STYLE_USAGE,
  VECTOR,
  VERTEX_POINT,
} from "../step-encoding";

export function stepCylinder(c: Cylinder, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, c.rot ?? vec3Zero);
  const cart3tr = (x: number, y: number): number => CARTESIAN_POINT(vec3TransRot(vec3(x, y, 0), pos, rot), m);
  const v0 = VECTOR(DIRECTION(vec3Zero, m), m);
  const c03 = CARTESIAN_POINT(vec3Zero, m);
  const c02 = CARTESIAN_POINT(vec2Zero, m);
  const [d1, d2] = [DIRECTION(vec3RotCombine(vec3PosX, rot), m), DIRECTION(vec3RotCombine(vec3PosY, rot), m)];
  const [d3, d4] = [DIRECTION(vec3RotCombine(vec3PosZ, rot), m), DIRECTION(vec3RotCombine(vec3NegX, rot), m)];
  const [d5, d6] = [DIRECTION(vec3RotCombine(vec3NegY, rot), m), DIRECTION(vec3RotCombine(vec3NegZ, rot), m)];
  const [down, up] = [AXIS2_PLACEMENT_3D(c03, d5, d4, m), AXIS2_PLACEMENT_3D(c03, d2, d1, m)];
  const [c1, c2] = [cart3tr(-c.radius, -c.length / 2), cart3tr(c.radius, -c.length / 2)];
  const [c3, c4] = [cart3tr(c.radius, c.length / 2), cart3tr(-c.radius, c.length / 2)];
  const [v1, v2, v3, v4] = [VERTEX_POINT(c1, m), VERTEX_POINT(c2, m), VERTEX_POINT(c3, m), VERTEX_POINT(c4, m)];
  const [l1, l2, l3, l4] = [LINE(c1, v0, m), LINE(c2, v0, m), LINE(c3, v0, m), LINE(c4, v0, m)];

  const [oe1, oe2, oe3, oe4] = [
    ORIENTED_EDGE(
      EDGE_CURVE(
        v1,
        v2,
        SEAM_CURVE(
          LINE(c2, v0, m),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          m
        ),
        m
      ),
      m
    ),
    ORIENTED_EDGE(
      EDGE_CURVE(
        v1,
        v2,
        SEAM_CURVE(
          LINE(c2, v0, m),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          m
        ),
        m
      ),
      m
    ),
    ORIENTED_EDGE(
      EDGE_CURVE(
        v2,
        v2,
        SURFACE_CURVE(
          CIRCLE(down, m),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          PCURVE(down, DEFINITIONAL_REPRESENTATION(CIRCLE(up, m), m), m),
          m
        ),
        m
      ),
      m
    ), // Bottom  circle edge curve
    ORIENTED_EDGE(
      EDGE_CURVE(
        v3,
        v3,
        SURFACE_CURVE(
          CIRCLE(down, m),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          PCURVE(down, DEFINITIONAL_REPRESENTATION(CIRCLE(up, m), m), m),
          m
        ),
        m
      ),
      m
    ), // Top circle edge curve
  ];

  const color = COLOUR_RGB(parseRgb(mat.normal), m);
  const msb = MANIFOLD_SOLID_BREP(
    CLOSED_SHELL(
      [
        ADVANCED_FACE(
          FACE_BOUND(EDGE_LOOP([oe1, oe2, oe3, oe4], m), "F", m),
          PCURVE(
            CYLINDRICAL_SURFACE(down, m),
            DEFINITIONAL_REPRESENTATION(LINE(c02, VECTOR(DIRECTION(vec2(-1, 0), m), m), m), m),
            m
          ),
          m
        ),
        ADVANCED_FACE(FACE_BOUND(EDGE_LOOP([oe3], m), "T", m), PLANE(down, m), m), // Circle down
        ADVANCED_FACE(FACE_BOUND(EDGE_LOOP([oe4], m), "F", m), PLANE(up, m), m), // Circle up
      ],
      m
    ),
    m
  );
  ADVANCED_BREP_SHAPE_REPRESENTATION(
    AXIS2_PLACEMENT_3D(c03, DIRECTION(vec3PosZ, m), DIRECTION(vec3PosX, m), m),
    msb,
    m
  );
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION(
    STYLED_ITEM(
      PRESENTATION_STYLE_ASSIGNMENT(
        SURFACE_STYLE_USAGE(SURFACE_SIDE_STYLE(SURFACE_STYLE_FILL_AREA(FILL_AREA_STYLE_COLOUR(color, m), m), m), m),
        CURVE_STYLE(DRAUGHTING_PRE_DEFINED_CURVE_FONT("continuous", m), color, m),
        m
      ),
      msb,
      m
    ),
    m
  );
}
