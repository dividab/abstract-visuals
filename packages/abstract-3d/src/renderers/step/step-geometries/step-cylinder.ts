import { Euler, Matrix4, Vector3 } from "three";
import {
  Material,
  Vec3,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  Cylinder,
  vec3Add,
} from "../../../abstract-3d.js";
import { parseRgb } from "../../shared.js";
import {
  ADVANCED_BREP_SHAPE_REPRESENTATION,
  ADVANCED_FACE,
  APPLICATION_CONTEXT,
  APPLICATION_PROTOCOL_DEFINITION,
  AXIS2_PLACEMENT_3D,
  CARTESIAN_POINT,
  CIRCLE,
  CLOSED_SHELL,
  COLOUR_RGB,
  CURVE_STYLE,
  CYLINDRICAL_SURFACE,
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
  PRODUCT,
  PRODUCT_CONTEXT,
  PRODUCT_DEFINITION,
  PRODUCT_DEFINITION_CONTEXT,
  PRODUCT_DEFINITION_FORMATION,
  PRODUCT_DEFINITION_SHAPE,
  SHAPE_DEFINITION_REPRESENTATION,
  STYLED_ITEM,
  SURFACE_SIDE_STYLE,
  SURFACE_STYLE_FILL_AREA,
  SURFACE_STYLE_USAGE,
  VECTOR,
  VERTEX_POINT,
} from "../step-encoding.js";

export function stepCylinder(c: Cylinder, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const r = c.radius;
  const h = c.length;
  const rgb = parseRgb(mat.normal);
  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rotation = vec3RotCombine(parentRot, c.rot ?? vec3Zero);

  const rotationMatrix = new Matrix4();
  const euler = new Euler();
  euler.set(rotation.x, rotation.y, rotation.z);
  rotationMatrix.makeRotationFromEuler(euler);

  const upNormal = new Vector3();
  const downNormal = new Vector3();
  upNormal.set(0, 1, 0);
  downNormal.set(0, -1, 0);

  upNormal.applyMatrix4(rotationMatrix);
  downNormal.applyMatrix4(rotationMatrix);

  const circleTop = new Vector3();
  circleTop.set(0, h / 2, 0);
  circleTop.applyMatrix4(rotationMatrix);

  const circleBot = new Vector3();
  circleBot.set(0, -h / 2, 0);
  circleBot.applyMatrix4(rotationMatrix);

  const v1 = new Vector3();
  const v2 = new Vector3();
  v1.set(r, h / 2, 0);
  v2.set(r, -h / 2, 0);
  v1.applyMatrix4(rotationMatrix);
  v2.applyMatrix4(rotationMatrix);

  APPLICATION_PROTOCOL_DEFINITION(m);
  const applicationContext = APPLICATION_CONTEXT(m);

  const ecurve0 = EDGE_CURVE(
    VERTEX_POINT(CARTESIAN_POINT(vec3Add(pos, v2), m), m),
    VERTEX_POINT(CARTESIAN_POINT(vec3Add(pos, v1), m), m),
    LINE(CARTESIAN_POINT(vec3Add(pos, v2), m), VECTOR(DIRECTION(upNormal, m), m), m),
    m,
    "T"
  );

  const ecurve1 = EDGE_CURVE(
    VERTEX_POINT(CARTESIAN_POINT(vec3Add(pos, v2), m), m),
    VERTEX_POINT(CARTESIAN_POINT(vec3Add(pos, v2), m), m),
    CIRCLE(
      AXIS2_PLACEMENT_3D(
        CARTESIAN_POINT(vec3Add(pos, circleBot), m),
        DIRECTION(upNormal, m),
        DIRECTION(vec3(0, 1, 0), m),
        m
      ),
      r,
      m
    ),
    m,
    "T"
  );

  const ecurve2 = EDGE_CURVE(
    VERTEX_POINT(CARTESIAN_POINT(vec3Add(pos, v1), m), m),
    VERTEX_POINT(CARTESIAN_POINT(vec3Add(pos, v1), m), m),
    CIRCLE(
      AXIS2_PLACEMENT_3D(
        CARTESIAN_POINT(vec3Add(pos, circleTop), m),
        DIRECTION(upNormal, m),
        DIRECTION(vec3(0, 1, 0), m),
        m
      ),
      r,
      m
    ),
    m
  );

  const msb = MANIFOLD_SOLID_BREP(
    CLOSED_SHELL(
      [
        ADVANCED_FACE(
          FACE_BOUND(
            EDGE_LOOP(
              [
                ORIENTED_EDGE(ecurve0, m, "T"),
                ORIENTED_EDGE(ecurve2, m),
                ORIENTED_EDGE(ecurve0, m, "F"),
                ORIENTED_EDGE(ecurve1, m, "F"),
              ],
              m
            ),
            "F",
            m
          ),
          CYLINDRICAL_SURFACE(
            AXIS2_PLACEMENT_3D(
              CARTESIAN_POINT(vec3(pos.x + circleTop.x, pos.y + circleTop.y, pos.z + circleTop.z), m),
              DIRECTION(downNormal, m),
              DIRECTION(vec3(0, -1, 0), m),
              m
            ),
            r,
            m
          ),
          m
        ),

        ADVANCED_FACE(
          FACE_BOUND(EDGE_LOOP([ORIENTED_EDGE(ecurve1, m, "F")], m), "T", m),
          PLANE(
            AXIS2_PLACEMENT_3D(
              CARTESIAN_POINT(vec3Add(pos, circleBot), m),
              DIRECTION(upNormal, m),
              DIRECTION(vec3(0, 1, 0), m),
              m
            ),
            m
          ),
          m,
          "F"
        ),

        ADVANCED_FACE(
          FACE_BOUND(EDGE_LOOP([ORIENTED_EDGE(ecurve2, m, "F")], m), "F", m),
          PLANE(
            AXIS2_PLACEMENT_3D(
              CARTESIAN_POINT(vec3Add(pos, circleTop), m),
              DIRECTION(upNormal, m),
              DIRECTION(vec3(0, 1, 0), m),
              m
            ),
            m
          ),
          m
        ),
      ],
      m
    ),
    m
  );

  const absp = ADVANCED_BREP_SHAPE_REPRESENTATION(
    AXIS2_PLACEMENT_3D(CARTESIAN_POINT(vec3Zero, m), DIRECTION(vec3(0, 0, 1), m), DIRECTION(vec3(1, 0, 0), m), m),
    msb,
    m
  );

  const prod = PRODUCT(PRODUCT_CONTEXT(applicationContext, m), "Cylinder", m);

  SHAPE_DEFINITION_REPRESENTATION(
    PRODUCT_DEFINITION_SHAPE(
      PRODUCT_DEFINITION(PRODUCT_DEFINITION_FORMATION(prod, m), PRODUCT_DEFINITION_CONTEXT(applicationContext, m), m),
      m
    ),
    absp,
    m
  );

  const color = COLOUR_RGB(parseRgb(mat.normal), m);
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
