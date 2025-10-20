import { Euler, Matrix4, Vector3 } from "three";
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
  vec3RotNormal,
  vec3Normalize,
  vec3Sub,
  vec3Dot,
  vec3Add,
  vec3Cross,
  vec3Rot,
  vec3Rot2,
} from "../../../abstract-3d.js";
import { parseRgb } from "../../shared.js";
import {
  ADVANCED_BREP_SHAPE_REPRESENTATION,
  ADVANCED_FACE,
  APPLICATION_CONTEXT,
  APPLICATION_PROTOCOL_DEFINITION,
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
  FILL_AREA_STYLE,
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

export function stepBox2(b: Box, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const size = b.size;
  const half = vec3Scale(size, 0.5);
  const pos = vec3TransRot(b.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, b.rot ?? vec3Zero);

  const color = parseRgb(mat.normal);

  // Compute 8 cube corners in world coordinates
  const corners = [
    vec3(0, 0, 0),
    vec3(0, 0, size.z),
    vec3(0, size.y, 0),
    vec3(0, size.y, size.z),
    vec3(size.x, 0, 0),
    vec3(size.x, 0, size.z),
    vec3(size.x, size.y, 0),
    vec3(size.x, size.y, size.z),
  ].map((v) => {
    const localCorner = vec3Sub(v, half);
    const rotatedLocal = vec3Rot(localCorner, vec3Zero, rot);
    const corner = vec3Add(rotatedLocal, pos);
    return corner;
  });

  // Normals of faces in world orientation
  const normFront = vec3RotNormal(vec3(0, 0, 1), rot);
  const normBack = vec3RotNormal(vec3(0, 0, -1), rot);
  const normRight = vec3RotNormal(vec3(1, 0, 0), rot);
  const normLeft = vec3RotNormal(vec3(-1, 0, 0), rot);
  const normUp = vec3RotNormal(vec3(0, 1, 0), rot);
  const normDown = vec3RotNormal(vec3(0, -1, 0), rot);

  const makePlane = (origin: Vec3, norm: Vec3, dir: Vec3): number =>
    PLANE(AXIS2_PLACEMENT_3D(CARTESIAN_POINT(origin, m), DIRECTION(norm, m), DIRECTION(dir, m), m), m);

  const makeEdge = (a: Vec3, b: Vec3): number => {
    const p1 = CARTESIAN_POINT(a, m);
    const p2 = CARTESIAN_POINT(b, m);
    const v1 = VERTEX_POINT(p1, m);
    const v2 = VERTEX_POINT(p2, m);
    const dir = vec3Normalize(vec3Sub(b, a));
    const d = DIRECTION(dir, m);
    const vec = VECTOR(d, m);
    const line = LINE(p1, vec, m);
    const edge = EDGE_CURVE(v1, v2, line, m, "T");
    return edge;
  };

  const makeFace = (
    idxs: [number, number, number, number],
    norm: Vec3,
    planeDir: Vec3,
    flip: boolean
  ): number => {
    const edges = [
      makeEdge(corners[idxs[0]]!, corners[idxs[1]]!),
      makeEdge(corners[idxs[1]]!, corners[idxs[2]]!),
      makeEdge(corners[idxs[2]]!, corners[idxs[3]]!),
      makeEdge(corners[idxs[3]]!, corners[idxs[0]]!),
    ];

    const oriented = [
      ORIENTED_EDGE(edges[0]!, m, "T"),
      ORIENTED_EDGE(edges[1]!, m, "T"),
      ORIENTED_EDGE(edges[2]!, m, "T"),
      ORIENTED_EDGE(edges[3]!, m, "T"),
    ];

    const loop = EDGE_LOOP(oriented, m);
    const faceBound = FACE_BOUND(loop, "F", m);
    const plane = makePlane(corners[idxs[0]]!, norm, planeDir);
    return ADVANCED_FACE(faceBound, plane, m, flip ? "F" : "T");
  };

  // Create 6 faces of the cube
  const faces = [
    makeFace([1, 5, 7, 3], normFront, normUp, false),  // front (+Z)
    makeFace([0, 2, 6, 4], normBack, normUp, true),    // back (-Z)
    makeFace([4, 6, 7, 5], normRight, normUp, false),  // right (+X)
    makeFace([0, 1, 3, 2], normLeft, normUp, true),    // left (-X)
    makeFace([2, 3, 7, 6], normUp, normFront, false),  // top (+Y)
    makeFace([0, 4, 5, 1], normDown, normFront, true), // bottom (-Y)
  ];

  // Combine into closed solid
  const closedShell = CLOSED_SHELL(faces, m);
  const manifoldSolidBrep = MANIFOLD_SOLID_BREP(closedShell, m);

  const axisPlacement = AXIS2_PLACEMENT_3D(
    CARTESIAN_POINT(corners[0]!, m),
    DIRECTION(normFront, m),
    DIRECTION(normRight, m),
    m
  );

  const advBrepShapeRepr = ADVANCED_BREP_SHAPE_REPRESENTATION(axisPlacement, manifoldSolidBrep, m.geoContext3d, m);

  // Product & representation hierarchy
  const applicationContext = APPLICATION_CONTEXT(m);
  const productDefContext = PRODUCT_DEFINITION_CONTEXT(applicationContext, m);
  const productContext = PRODUCT_CONTEXT(applicationContext, m);
  const product = PRODUCT(productContext, "Cube", m);
  const productDefForm = PRODUCT_DEFINITION_FORMATION(product, m);
  const productDefinition = PRODUCT_DEFINITION(productDefForm, productDefContext, m);
  const productDefShape = PRODUCT_DEFINITION_SHAPE(productDefinition, m);
  SHAPE_DEFINITION_REPRESENTATION(productDefShape, advBrepShapeRepr, m);

  // Add color styling
  const colorRgb = COLOUR_RGB(color, m);
  const fillAreaColour = FILL_AREA_STYLE_COLOUR(colorRgb, m);
  const fillAreaStyle = FILL_AREA_STYLE(fillAreaColour, m);
  const surfaceStyleFill = SURFACE_STYLE_FILL_AREA(fillAreaStyle, m);
  const surfaceSideStyle = SURFACE_SIDE_STYLE(surfaceStyleFill, m);
  const surfaceStyleUsage = SURFACE_STYLE_USAGE(surfaceSideStyle, m);
  const draughtFont = DRAUGHTING_PRE_DEFINED_CURVE_FONT("continuous", m);
  const curveStyle = CURVE_STYLE(draughtFont, colorRgb, m);
  const presentationStyle = PRESENTATION_STYLE_ASSIGNMENT(surfaceStyleUsage, curveStyle, m);
  const styledItem = STYLED_ITEM(presentationStyle, manifoldSolidBrep, m);
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION(styledItem, m.geoContext3d, m);
}


export function stepBox(b: Box, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const size = b.size;
  const half = vec3Scale(size, 0.5);
  const pos = vec3TransRot(b.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, b.rot ?? vec3Zero);
  const color = parseRgb(mat.normal);

  const rotationMatrix = new Matrix4();
  const euler = new Euler();
  euler.set(rot.x, rot.y, rot.z);
  rotationMatrix.makeRotationFromEuler(euler);

  const corners = [
    vec3(0, 0, 0),
    vec3(0, 0, size.z),
    vec3(0, size.y, 0),
    vec3(0, size.y, size.z),
    vec3(size.x, 0, 0),
    vec3(size.x, 0, size.z),
    vec3(size.x, size.y, 0),
    vec3(size.x, size.y, size.z),
  ].map((v) => {
    const corner = vec3Sub(v, half);
    const rotated = new Vector3();
    rotated.set(corner.x, corner.y, corner.z);
    rotated.applyMatrix4(rotationMatrix);
    return vec3Add(pos, vec3(rotated.x, rotated.y, rotated.z));
  });

  const makePlane = (origin: number, norm: number, dir: number): number =>
    PLANE(AXIS2_PLACEMENT_3D(origin, norm, dir, m), m);

  const makeEdgeCurve = (v1: number, v2: number, line: number): number =>
    EDGE_CURVE(v1, v2, line, m, "T");

  // Normals of faces in world orientation
  const normFront = makeNormal(vec3(0, 0, 1), rot);
  const normRight = makeNormal(vec3(1, 0, 0), rot);
  const normUp = makeNormal(vec3(0, 1, 0), rot);

  //normal directions
  const dirFront = DIRECTION(normFront, m);
  const dirRight = DIRECTION(normRight, m);
  const dirUp = DIRECTION(normUp, m);

  //cartesian points
  const cart0 = CARTESIAN_POINT(corners[0]!, m);
  const cart1 = CARTESIAN_POINT(corners[1]!, m);
  const cart2 = CARTESIAN_POINT(corners[2]!, m);
  const cart3 = CARTESIAN_POINT(corners[3]!, m);
  const cart4 = CARTESIAN_POINT(corners[4]!, m);
  const cart5 = CARTESIAN_POINT(corners[5]!, m);
  const cart6 = CARTESIAN_POINT(corners[6]!, m);
  const cart7 = CARTESIAN_POINT(corners[7]!, m);

  //vertex points
  const vert0 = VERTEX_POINT(cart0, m);
  const vert1 = VERTEX_POINT(cart1, m);
  const vert2 = VERTEX_POINT(cart2, m);
  const vert3 = VERTEX_POINT(cart3, m);
  const vert4 = VERTEX_POINT(cart4, m);
  const vert5 = VERTEX_POINT(cart5, m);
  const vert6 = VERTEX_POINT(cart6, m);
  const vert7 = VERTEX_POINT(cart7, m);

  const ec21 = makeEdgeCurve(vert0, vert1, LINE(cart0, dirFront, m));
  const ec31 = makeEdgeCurve(vert0, vert2, LINE(cart0, dirUp, m));
  const ec39 = makeEdgeCurve(vert2, vert3, LINE(cart2, dirFront, m));
  const ec47 = makeEdgeCurve(vert1, vert3, LINE(cart1, dirUp, m));
  const ec61 = makeEdgeCurve(vert4, vert5, LINE(cart4, dirFront, m));
  const ec71 = makeEdgeCurve(vert4, vert6, LINE(cart4, dirUp, m));
  const ec79 = makeEdgeCurve(vert6, vert7, LINE(cart6, dirFront, m));
  const ec87 = makeEdgeCurve(vert5, vert7, LINE(cart5, dirUp, m));
  const ec101 = makeEdgeCurve(vert0, vert4, LINE(cart0, dirRight, m));
  const ec108 = makeEdgeCurve(vert1, vert5, LINE(cart1, dirRight, m));
  const ec123 = makeEdgeCurve(vert2, vert6, LINE(cart2, dirRight, m));
  const ec130 = makeEdgeCurve(vert3, vert7, LINE(cart3, dirRight, m));

  const axisPlacement = AXIS2_PLACEMENT_3D(
    cart0,
    dirFront,
    dirRight,
    m
  );

  const faceLeft = ADVANCED_FACE(
    FACE_BOUND(
      EDGE_LOOP(
        [
          ORIENTED_EDGE(ec21, m, "F"),
          ORIENTED_EDGE(ec31, m, "T"),
          ORIENTED_EDGE(ec39, m, "T"),
          ORIENTED_EDGE(ec47, m, "F"),
        ],
        m
      ),
      "F",
      m
    ),
    makePlane(cart0, dirRight, dirFront),
    m,
    "F",
  );

  const faceRight = ADVANCED_FACE(
    FACE_BOUND(
      EDGE_LOOP(
        [
          ORIENTED_EDGE(ec61, m, "F"),
          ORIENTED_EDGE(ec71, m, "T"),
          ORIENTED_EDGE(ec79, m, "T"),
          ORIENTED_EDGE(ec87, m, "F"),
        ],
        m
      ),
      "T",
      m,
    ),
    makePlane(cart4, dirRight, dirFront),
    m,
    "T",
  );

  const faceDown = ADVANCED_FACE(
    FACE_BOUND(
      EDGE_LOOP(
        [
          ORIENTED_EDGE(ec101, m, "F"),
          ORIENTED_EDGE(ec21, m, "T"),
          ORIENTED_EDGE(ec108, m, "T"),
          ORIENTED_EDGE(ec61, m, "F"),
        ],
        m
      ),
      "F",
      m,
    ),
    makePlane(cart0, dirUp, dirFront),
    m,
    "F",
  );

  const faceTop = ADVANCED_FACE(
    FACE_BOUND(
      EDGE_LOOP(
        [
          ORIENTED_EDGE(ec123, m, "F"),
          ORIENTED_EDGE(ec39, m, "T"),
          ORIENTED_EDGE(ec130, m, "T"),
          ORIENTED_EDGE(ec79, m, "F"),
        ],
        m,
      ),
      "T",
      m
    ),
    makePlane(cart2, dirUp, dirFront),
    m,
    "T"
  );

  const faceBack = ADVANCED_FACE(
    FACE_BOUND(
      EDGE_LOOP(
        [
          ORIENTED_EDGE(ec31, m, "F"),
          ORIENTED_EDGE(ec101, m, "T"),
          ORIENTED_EDGE(ec71, m, "T"),
          ORIENTED_EDGE(ec123, m, "F"),
        ],
        m,
      ),
      "F",
      m
    ),
    makePlane(cart0, dirFront, dirRight),
    m,
    "F"
  );

  const faceFront = ADVANCED_FACE(
    FACE_BOUND(
      EDGE_LOOP(
        [
          ORIENTED_EDGE(ec47, m, "F"),
          ORIENTED_EDGE(ec108, m, "T"),
          ORIENTED_EDGE(ec87, m, "T"),
          ORIENTED_EDGE(ec130, m, "F"),
        ],
        m,
      ),
      "T",
      m
    ),
    makePlane(cart1, dirFront, dirRight),
    m,
    "T"
  );

  // Combine into closed solid
  const closedShell = CLOSED_SHELL([faceLeft, faceRight, faceDown, faceTop, faceBack, faceFront], m);
  const manifoldSolidBrep = MANIFOLD_SOLID_BREP(closedShell, m);

  const applicationContext = APPLICATION_CONTEXT(m);
  APPLICATION_PROTOCOL_DEFINITION(applicationContext, m);

  const absp = ADVANCED_BREP_SHAPE_REPRESENTATION(
    axisPlacement,
    manifoldSolidBrep,
    m.geoContext3d,
    m
  );

  const advBrepShapeRepr = ADVANCED_BREP_SHAPE_REPRESENTATION(axisPlacement, manifoldSolidBrep, m.geoContext3d, m);

  // Product & representation hierarchy
  const productDefContext = PRODUCT_DEFINITION_CONTEXT(applicationContext, m);
  const productContext = PRODUCT_CONTEXT(applicationContext, m);
  const product = PRODUCT(productContext, "Cube", m);
  const productDefForm = PRODUCT_DEFINITION_FORMATION(product, m);
  const productDefinition = PRODUCT_DEFINITION(productDefForm, productDefContext, m);
  const productDefShape = PRODUCT_DEFINITION_SHAPE(productDefinition, m);
  SHAPE_DEFINITION_REPRESENTATION(productDefShape, advBrepShapeRepr, m);

  // Add color styling
  const colorRgb = COLOUR_RGB(color, m);
  const fillAreaColour = FILL_AREA_STYLE_COLOUR(colorRgb, m);
  const fillAreaStyle = FILL_AREA_STYLE(fillAreaColour, m);
  const surfaceStyleFill = SURFACE_STYLE_FILL_AREA(fillAreaStyle, m);
  const surfaceSideStyle = SURFACE_SIDE_STYLE(surfaceStyleFill, m);
  const surfaceStyleUsage = SURFACE_STYLE_USAGE(surfaceSideStyle, m);
  const draughtFont = DRAUGHTING_PRE_DEFINED_CURVE_FONT("continuous", m);
  const curveStyle = CURVE_STYLE(draughtFont, colorRgb, m);
  const presentationStyle = PRESENTATION_STYLE_ASSIGNMENT(surfaceStyleUsage, curveStyle, m);
  const styledItem = STYLED_ITEM(presentationStyle, manifoldSolidBrep, m);
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION(styledItem, m.geoContext3d, m);


  /*const draughtingPreDefCurveFont = DRAUGHTING_PRE_DEFINED_CURVE_FONT("continuous", m);
  const curveStyle = CURVE_STYLE(draughtingPreDefCurveFont, colourBlack, m);
  const fillAreaStyleColor = FILL_AREA_STYLE_COLOUR(colour, m);
  const fillAreaStyle = FILL_AREA_STYLE(fillAreaStyleColor, m);
  const surfaceStyleFillArea = SURFACE_STYLE_FILL_AREA(fillAreaStyle, m);
  const surfaceSudeStyle = SURFACE_SIDE_STYLE(surfaceStyleFillArea, m);
  const surfaceStyleUsage = SURFACE_STYLE_USAGE(surfaceSudeStyle, m);
  const presStyleAssign = PRESENTATION_STYLE_ASSIGNMENT(surfaceStyleUsage, curveStyle, m);
  const styledItem = STYLED_ITEM(presStyleAssign, manifoldSolidBrep, m);
  MECHANICAL_DESIGN_GEOMETRIC_PRESENTATION_REPRESENTATION(styledItem, m.geoContext3d, m);

  const productDefContext = PRODUCT_DEFINITION_CONTEXT(applicationContext, m);
  const productContext = PRODUCT_CONTEXT(applicationContext, m);
  const product = PRODUCT(productContext, "Cube", m);
  const productDefForm = PRODUCT_DEFINITION_FORMATION(product, m);
  const productDef = PRODUCT_DEFINITION(productDefForm, productDefContext, m);
  const productDefShape = PRODUCT_DEFINITION_SHAPE(productDef, m);
  SHAPE_DEFINITION_REPRESENTATION(productDefShape, absp, m);*/
}

function makeNormal(norm: Vec3, rot: Vec3): Vec3 {
  const rotationMatrix = new Matrix4();
  const euler = new Euler();
  euler.set(rot.x, rot.y, rot.z);
  rotationMatrix.makeRotationFromEuler(euler);
  const normalized = vec3Normalize(norm);
  const vec = new Vector3();
  vec.set(normalized.x, normalized.y, normalized.z);
  const n = vec.applyMatrix4(rotationMatrix);
  return vec3(n.x, n.y, n.z);
}