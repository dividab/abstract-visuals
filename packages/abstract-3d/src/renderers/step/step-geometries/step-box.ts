import {
  Box,
  Material,
  Vec3,
  vec3Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  vec3PosX,
  vec3PosY,
  vec3PosZ,
  vec3NegX,
  vec3NegY,
  vec3NegZ,
} from "../../../abstract-3d.js";
import { parseRgb } from "../../shared.js";
import {
  ADVANCED_BREP_SHAPE_REPRESENTATION,
  ADVANCED_FACE,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  CLOSED_SHELL,
  COLOUR_RGB,
  CURVE_STYLE,
  DIRECTION,
  DRAUGHTING_PRE_DEFINED_CURVE_FONT,
  EDGE_CURVE,
  EDGE_LOOP,
  FACE_BOUND,
  FILL_AREA_STYLE_COLOUR,
  LINE,
  MANIFOLD_SOLID_BREP,
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION,
  MutableStep,
  ORIENTED_EDGE,
  PLANE,
  PRESENTATION_STYLE_ASSIGNMENT,
  STYLED_ITEM,
  SURFACE_SIDE_STYLE,
  SURFACE_STYLE_FILL_AREA,
  SURFACE_STYLE_USAGE,
  VECTOR,
  VERTEX_POINT,
} from "../step-encoding.js";

export function stepBox(b: Box, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const half = vec3Scale(b.size, 0.5);
  const pos = vec3TransRot(b.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, b.rot ?? vec3Zero);
  const cart3tr = (x: number, y: number, z: number): number =>
    CARTESIAN_POINT(vec3TransRot(vec3(x, y, z), pos, rot), m);
  const v0 = VECTOR(DIRECTION(vec3Zero, m), m);
  const c0 = CARTESIAN_POINT(vec3Zero, m);
  const [c1, c2] = [cart3tr(-half.x, -half.y, -half.z), cart3tr(half.x, -half.y, -half.z)];
  const [c3, c4] = [cart3tr(half.x, half.y, -half.z), cart3tr(-half.x, half.y, -half.z)];
  const [c5, c6] = [cart3tr(-half.x, -half.y, half.z), cart3tr(half.x, -half.y, half.z)];
  const [c7, c8] = [cart3tr(half.x, half.y, half.z), cart3tr(-half.x, half.y, half.z)];
  const [v1, v2, v3, v4] = [VERTEX_POINT(c1, m), VERTEX_POINT(c2, m), VERTEX_POINT(c3, m), VERTEX_POINT(c4, m)];
  const [v5, v6, v7, v8] = [VERTEX_POINT(c5, m), VERTEX_POINT(c6, m), VERTEX_POINT(c7, m), VERTEX_POINT(c8, m)];
  const [l1, l2, l3, l4] = [LINE(c1, v0, m), LINE(c2, v0, m), LINE(c3, v0, m), LINE(c4, v0, m)];
  const [l5, l6, l7, l8] = [LINE(c5, v0, m), LINE(c6, v0, m), LINE(c7, v0, m), LINE(c8, v0, m)];
  const [d1, d2] = [DIRECTION(vec3RotCombine(vec3PosX, rot), m), DIRECTION(vec3RotCombine(vec3PosY, rot), m)];
  const [d3, d4] = [DIRECTION(vec3RotCombine(vec3PosZ, rot), m), DIRECTION(vec3RotCombine(vec3NegX, rot), m)];
  const [d5, d6] = [DIRECTION(vec3RotCombine(vec3NegY, rot), m), DIRECTION(vec3RotCombine(vec3NegZ, rot), m)];
  const color = COLOUR_RGB(parseRgb(mat.normal), m);

  const msb = MANIFOLD_SOLID_BREP(
    CLOSED_SHELL(
      [
        // Front
        ADVANCED_FACE(
          FACE_BOUND(
            EDGE_LOOP(
              [
                ORIENTED_EDGE(EDGE_CURVE(v1, v2, l1, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v2, v3, l2, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v3, v4, l3, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v4, v1, l4, m), m),
              ],
              m
            ),
            "T",
            m
          ),
          PLANE(AXIS2_PLACEMENT_3D(c0, d3, d1, m), m),
          m
        ),
        // Back
        ADVANCED_FACE(
          FACE_BOUND(
            EDGE_LOOP(
              [
                ORIENTED_EDGE(EDGE_CURVE(v8, v7, l8, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v7, v6, l7, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v6, v5, l6, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v5, v8, l5, m), m),
              ],
              m
            ),
            "T",
            m
          ),
          PLANE(AXIS2_PLACEMENT_3D(c0, d6, d4, m), m),
          m
        ),
        // Left
        ADVANCED_FACE(
          FACE_BOUND(
            EDGE_LOOP(
              [
                ORIENTED_EDGE(EDGE_CURVE(v1, v5, l1, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v5, v8, l5, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v8, v4, l8, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v4, v1, l4, m), m),
              ],
              m
            ),
            "T",
            m
          ),
          PLANE(AXIS2_PLACEMENT_3D(c0, d4, d3, m), m),
          m
        ),
        // Right
        ADVANCED_FACE(
          FACE_BOUND(
            EDGE_LOOP(
              [
                ORIENTED_EDGE(EDGE_CURVE(v2, v6, l2, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v6, v7, l6, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v7, v3, l7, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v3, v2, l3, m), m),
              ],
              m
            ),
            "T",
            m
          ),
          PLANE(AXIS2_PLACEMENT_3D(c0, d1, d6, m), m),
          m
        ),
        // Top
        ADVANCED_FACE(
          FACE_BOUND(
            EDGE_LOOP(
              [
                ORIENTED_EDGE(EDGE_CURVE(v4, v8, l4, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v8, v7, l8, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v7, v3, l7, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v3, v4, l3, m), m),
              ],
              m
            ),
            "T",
            m
          ),
          PLANE(AXIS2_PLACEMENT_3D(c0, d2, d1, m), m),
          m
        ),
        // Bottom
        ADVANCED_FACE(
          FACE_BOUND(
            EDGE_LOOP(
              [
                ORIENTED_EDGE(EDGE_CURVE(v1, v2, l1, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v2, v6, l2, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v6, v5, l6, m), m),
                ORIENTED_EDGE(EDGE_CURVE(v5, v1, l5, m), m),
              ],
              m
            ),
            "T",
            m
          ),
          PLANE(AXIS2_PLACEMENT_3D(c0, d5, d4, m), m),
          m
        ),
      ],
      m
    ),
    m
  );
  ADVANCED_BREP_SHAPE_REPRESENTATION(AXIS2_PLACEMENT_3D(c0, DIRECTION(vec3PosZ, m), DIRECTION(vec3PosX, m), m), msb, m);
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
