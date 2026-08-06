import {
  Material,
  Vec3,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  Cylinder,
  vec3Add,
  vec3Rot,
} from "../../../abstract-3d.js";
import { parseRgb } from "../../../utils.js";
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
  CONICAL_SURFACE,
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

const SMALLEST_RADIUS = 1e-4;
const GEOMETRY_EPSILON = 1e-12;

export function stepCylinder(
  c: Cylinder,
  mat: Material,
  parentPos: Vec3,
  parentRot: Vec3,
  m: MutableStep,
  rSmall?: number
): void {
  const h = c.length;

  if (h <= GEOMETRY_EPSILON) {
    return;
  }

  const bottomRadius = Math.max(c.radius, SMALLEST_RADIUS);
  const requestedTopRadius = Math.max(
    rSmall ?? c.radius,
    SMALLEST_RADIUS
  );

  const radiusTolerance =
    GEOMETRY_EPSILON *
    Math.max(1, bottomRadius, requestedTopRadius);

  const isCylinder =
    Math.abs(requestedTopRadius - bottomRadius) <= radiusTolerance;

  const topRadius = isCylinder
    ? bottomRadius
    : requestedTopRadius;

  const pos = vec3TransRot(c.pos, parentPos, parentRot);
  const rotation = vec3RotCombine(
    parentRot,
    c.rot ?? vec3Zero
  );

  const rot = (v: Vec3): Vec3 =>
    vec3Rot(v, vec3Zero, rotation);

  const axis = rot(vec3(0, 1, 0));
  const radial = rot(vec3(1, 0, 0));

  const bottomCenter = vec3Add(
    pos,
    rot(vec3(0, -h / 2, 0))
  );

  const topCenter = vec3Add(
    pos,
    rot(vec3(0, h / 2, 0))
  );

  const bottomSeamPoint = vec3Add(
    pos,
    rot(vec3(bottomRadius, -h / 2, 0))
  );

  const topSeamPoint = vec3Add(
    pos,
    rot(vec3(topRadius, h / 2, 0))
  );

  const seamDelta = vec3(
    topSeamPoint.x - bottomSeamPoint.x,
    topSeamPoint.y - bottomSeamPoint.y,
    topSeamPoint.z - bottomSeamPoint.z
  );

  const seamLength = Math.hypot(
    seamDelta.x,
    seamDelta.y,
    seamDelta.z
  );

  if (seamLength <= GEOMETRY_EPSILON) {
    return;
  }

  const seamDirection = vec3(
    seamDelta.x / seamLength,
    seamDelta.y / seamLength,
    seamDelta.z / seamLength
  );

  const applicationContext = APPLICATION_CONTEXT(m);
  APPLICATION_PROTOCOL_DEFINITION(
    applicationContext,
    m
  );

  const axisDirection = DIRECTION(axis, m);
  const radialDirection = DIRECTION(radial, m);

  const bottomCenterPoint = CARTESIAN_POINT(
    bottomCenter,
    m
  );

  const topCenterPoint = CARTESIAN_POINT(
    topCenter,
    m
  );

  const bottomSeamCartesianPoint = CARTESIAN_POINT(
    bottomSeamPoint,
    m
  );

  const topSeamCartesianPoint = CARTESIAN_POINT(
    topSeamPoint,
    m
  );

  const bottomVertex = VERTEX_POINT(
    bottomSeamCartesianPoint,
    m
  );

  const topVertex = VERTEX_POINT(
    topSeamCartesianPoint,
    m
  );

  const bottomPlacement = AXIS2_PLACEMENT_3D(
    bottomCenterPoint,
    axisDirection,
    radialDirection,
    m
  );

  const topPlacement = AXIS2_PLACEMENT_3D(
    topCenterPoint,
    axisDirection,
    radialDirection,
    m
  );

  const seamEdge = EDGE_CURVE(
    bottomVertex,
    topVertex,
    LINE(
      bottomSeamCartesianPoint,
      VECTOR(
        DIRECTION(seamDirection, m),
        m
      ),
      m
    ),
    m,
    "T"
  );

  const bottomCircleEdge = EDGE_CURVE(
    bottomVertex,
    bottomVertex,
    CIRCLE(
      bottomPlacement,
      bottomRadius,
      m
    ),
    m,
    "T"
  );

  const topCircleEdge = EDGE_CURVE(
    topVertex,
    topVertex,
    CIRCLE(
      topPlacement,
      topRadius,
      m
    ),
    m,
    "T"
  );

  const growsTowardTop =
    topRadius >= bottomRadius;

  const coneAxis = growsTowardTop
    ? axis
    : vec3(-axis.x, -axis.y, -axis.z);

  const coneLocation = growsTowardTop
    ? bottomCenterPoint
    : topCenterPoint;

  const coneStartRadius = Math.min(
    bottomRadius,
    topRadius
  );

  const semiAngle = Math.atan2(
    Math.abs(topRadius - bottomRadius),
    h
  );

  const conePlacement = AXIS2_PLACEMENT_3D(
    coneLocation,
    DIRECTION(coneAxis, m),
    radialDirection,
    m
  );

  const sideSurface = isCylinder
    ? CYLINDRICAL_SURFACE(
      bottomPlacement,
      bottomRadius,
      m
    )
    : CONICAL_SURFACE(
      conePlacement,
      coneStartRadius,
      semiAngle,
      m
    );

  const sideFace = ADVANCED_FACE(
    FACE_BOUND(
      EDGE_LOOP(
        [
          ORIENTED_EDGE(seamEdge, m, "T"),
          ORIENTED_EDGE(topCircleEdge, m, "T"),
          ORIENTED_EDGE(seamEdge, m, "F"),
          ORIENTED_EDGE(bottomCircleEdge, m, "F"),
        ],
        m
      ),
      "F",
      m
    ),
    sideSurface,
    m,
    "T"
  );

  const bottomFace = ADVANCED_FACE(
    FACE_BOUND(
      EDGE_LOOP(
        [
          ORIENTED_EDGE(
            bottomCircleEdge,
            m,
            "F"
          ),
        ],
        m
      ),
      "T",
      m
    ),
    PLANE(bottomPlacement, m),
    m,
    "F"
  );

  const topFace = ADVANCED_FACE(
    FACE_BOUND(
      EDGE_LOOP(
        [
          ORIENTED_EDGE(
            topCircleEdge,
            m,
            "F"
          ),
        ],
        m
      ),
      "F",
      m
    ),
    PLANE(topPlacement, m),
    m,
    "T"
  );

  const msb = MANIFOLD_SOLID_BREP(
    CLOSED_SHELL(
      [
        sideFace,
        bottomFace,
        topFace,
      ],
      m
    ),
    m
  );

  const absp =
    ADVANCED_BREP_SHAPE_REPRESENTATION(
      AXIS2_PLACEMENT_3D(
        CARTESIAN_POINT(vec3Zero, m),
        DIRECTION(vec3(0, 0, 1), m),
        DIRECTION(vec3(1, 0, 0), m),
        m
      ),
      msb,
      m.geoContext3d,
      m
    );

  const prod = PRODUCT(
    PRODUCT_CONTEXT(applicationContext, m),
    isCylinder ? "Cylinder" : "Cone",
    m
  );

  SHAPE_DEFINITION_REPRESENTATION(
    PRODUCT_DEFINITION_SHAPE(
      PRODUCT_DEFINITION(
        PRODUCT_DEFINITION_FORMATION(
          prod,
          m
        ),
        PRODUCT_DEFINITION_CONTEXT(
          applicationContext,
          m
        ),
        m
      ),
      m
    ),
    absp,
    m
  );

  const color = COLOUR_RGB(
    parseRgb(mat.normal),
    m
  );

  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION(
    STYLED_ITEM(
      PRESENTATION_STYLE_ASSIGNMENT(
        SURFACE_STYLE_USAGE(
          SURFACE_SIDE_STYLE(
            SURFACE_STYLE_FILL_AREA(
              FILL_AREA_STYLE_COLOUR(
                color,
                m
              ),
              m
            ),
            m
          ),
          m
        ),
        CURVE_STYLE(
          DRAUGHTING_PRE_DEFINED_CURVE_FONT(
            "continuous",
            m
          ),
          color,
          m
        ),
        m
      ),
      msb,
      m
    ),
    m.geoContext3d,
    m
  );
}