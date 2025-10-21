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
  vec3Normalize,
  vec3Sub,
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

export function stepBox(b: Box, mat: Material, parentPos: Vec3, parentRot: Vec3, m: MutableStep): void {
  const size = b.size;
  const half = vec3Scale(size, 0.5);
  const pos = vec3TransRot(b.pos, parentPos, parentRot);
  const rotation = vec3RotCombine(parentRot, b.rot ?? vec3Zero);
  const color = parseRgb(mat.normal);
  const rotationMatrix = new Matrix4();
  const euler = new Euler();
  euler.set(rotation.x, rotation.y, rotation.z);
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
    const localCorner = vec3Sub(v, half);
    const vec = new Vector3();
    vec.set(localCorner.x, localCorner.y, localCorner.z);
    vec.applyMatrix4(rotationMatrix);
    const corner = vec3Add(vec3(vec.x, vec.y, vec.z), pos);
    return corner;
  });

  const rotate = (original: Vec3): Vec3 => {
    const vec = new Vector3();
    vec.set(original.x, original.y, original.z);
    vec.applyMatrix4(rotationMatrix);
    return vec3(vec.x, vec.y, vec.z);
  };

  const normFrontGlobal = vec3(0, 0, 1);
  const normRightGlobal = vec3(1, 0, 0);

  const normFront = rotate(normFrontGlobal);
  const normBack = rotate(vec3(0, 0, -1));
  const normRight = rotate(normRightGlobal);
  const normLeft = rotate(vec3(-1, 0, 0));
  const normUp = rotate(vec3(0, 1, 0));
  const normDown = rotate(vec3(0, -1, 0));

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

  const faces = [
    makeFace([1, 5, 7, 3], normFront, normUp, false),  // front (+Z)
    makeFace([0, 2, 6, 4], normBack, normUp, true),    // back (-Z)
    makeFace([4, 6, 7, 5], normRight, normUp, false),  // right (+X)
    makeFace([0, 1, 3, 2], normLeft, normUp, true),    // left (-X)
    makeFace([2, 3, 7, 6], normUp, normFront, false),  // top (+Y)
    makeFace([0, 4, 5, 1], normDown, normFront, true), // bottom (-Y)
  ];

  const closedShell = CLOSED_SHELL(faces, m);
  const manifoldSolidBrep = MANIFOLD_SOLID_BREP(closedShell, m);

  const axisPlacement = AXIS2_PLACEMENT_3D(
    CARTESIAN_POINT(vec3Zero, m),
    DIRECTION(normFrontGlobal, m),
    DIRECTION(normRightGlobal, m),
    m
  );

  const advBrepShapeRepr = ADVANCED_BREP_SHAPE_REPRESENTATION(axisPlacement, manifoldSolidBrep, m.geoContext3d, m);

  const applicationContext = APPLICATION_CONTEXT(m);
  const productDefContext = PRODUCT_DEFINITION_CONTEXT(applicationContext, m);
  const productContext = PRODUCT_CONTEXT(applicationContext, m);
  const product = PRODUCT(productContext, "Cube", m);
  const productDefForm = PRODUCT_DEFINITION_FORMATION(product, m);
  const productDefinition = PRODUCT_DEFINITION(productDefForm, productDefContext, m);
  const productDefShape = PRODUCT_DEFINITION_SHAPE(productDefinition, m);
  SHAPE_DEFINITION_REPRESENTATION(productDefShape, advBrepShapeRepr, m);

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
