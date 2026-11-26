import {
  type Box3,
  type Camera,
  CanvasTexture,
  Group,
  MathUtils,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  type Intersection,
  type Object3D,
  Quaternion,
  PlaneGeometry,
  SRGBColorSpace,
  type Raycaster,
  type Texture,
  Vector3,
} from "three";
import { shade } from "../../../utils.js";
import { hotspotColor, HOVERED } from "../appearance/appearance.js";

/** The active relations' insertion symbols: on the edge of each relation's slab facing the camera, sliding onto its face as it turns toward it */

/** A relation's box, its bounds in the axes of `matrix`, and the compiled item it's of */
export type HotspotBox = { readonly target: number; readonly item: number; readonly bounds: Box3; readonly matrix: Matrix4 };

export type Hotspots = {
  readonly object: Group;
  readonly boxes: ReadonlyArray<HotspotBox>;
  /** Mutable, as three's raycaster takes only mutable arrays */
  readonly symbols: Array<Mesh<PlaneGeometry, MeshBasicMaterial>>;
  /** Each box's thinnest axis, across its slab */
  readonly thinAxes: Uint8Array;
  /** Each symbol's side, by `placeHotspots`, -1 before it's placed */
  readonly sides: Int8Array;
  /** A symbol's texture by its color */
  readonly textures: Map<string, Texture>;
  /** A symbol's side, the same on every hotspot */
  readonly symbolSize: number;
};

const hoveredColor = shade(-0.4, hotspotColor) ?? hotspotColor;
const symbolPixels = 256;
/** Breaks ties between sides facing the camera alike, toward the left of the screen */
const leftLean = 0.3;
/** How much a slab faces the camera, from 0 edge on to 1 face on, between which its symbol slides from its edge onto its face */
const edgeOnUntil = 0.5;
const faceOnFrom = 0.85;
/** How much more another side must face the camera to take the symbol, so it doesn't flip near a tie */
const keepMargin = 0.15;
const symbolPlane = new PlaneGeometry();
/** Of its size, how far toward the camera a symbol's depth is, so its own slab doesn't hide it */
const anchorBias = 0.75;

export function createHotspots(boxes: ReadonlyArray<HotspotBox>, symbolSize: number): Hotspots {
  const thinAxes = new Uint8Array(boxes.length);
  const symbols: Array<Mesh<PlaneGeometry, MeshBasicMaterial>> = [];
  const object = new Group();
  for (let b = 0; b < boxes.length; b++) {
    const { bounds, matrix } = boxes[b]!;
    // Thinnest as drawn, scaled by its matrix
    bounds.getSize(size).multiply(scale.setFromMatrixScale(matrix));
    thinAxes[b] = size.x <= size.y && size.x <= size.z ? 0 : size.y <= size.z ? 1 : 2;
    const symbol = new Mesh(symbolPlane, new MeshBasicMaterial({ transparent: true, depthWrite: false }));
    symbol.material.onBeforeCompile = atAnchorDepth;
    Object.assign(symbol, { frustumCulled: false, renderOrder: 4 });
    symbols.push(symbol);
    object.add(symbol);
  }
  object.visible = boxes.length > 0;
  return { object, boxes, symbols, thinAxes, sides: new Int8Array(boxes.length).fill(-1), textures: new Map(), symbolSize };
}

/** Colors each symbol by its relation's highlight, darker while hovered */
export function paintHotspots(hotspots: Hotspots, highlights: Int8Array): void {
  hotspots.boxes.forEach((box, b) => {
    const style = highlights[box.target]! % 2 === HOVERED ? hoveredColor : hotspotColor;
    // Drawn on a canvas, so not in Node, e.g. in tests
    const material = hotspots.symbols[b]!.material;
    const texture = hotspots.textures.get(style) ?? (typeof document === "undefined" ? undefined : createSymbolTexture(style));
    if (texture) {
      hotspots.textures.set(style, texture);
      material.map = texture;
      material.needsUpdate = true;
    }
  });
}

/**
 * Puts each symbol on the middle of its slab's edge that faces the camera most, by the camera's direction so slabs turned alike match, facing the
 * camera; sliding to the middle of the slab's near face, lying flat on it, as the slab turns to face the camera
 */
export function placeHotspots(hotspots: Hotspots, camera: Camera): void {
  camera.getWorldDirection(forward);
  right.setFromMatrixColumn(camera.matrixWorld, 0);
  for (let b = 0; b < hotspots.boxes.length; b++) {
    const { bounds, matrix } = hotspots.boxes[b]!;
    const thin = hotspots.thinAxes[b]!;
    let facing = -Infinity;
    let chosen = 0;
    for (let side = 0; side < 4; side++) {
      axis
        .setFromMatrixColumn(matrix, (thin + 1 + (side % 2)) % 3)
        .normalize()
        .multiplyScalar(side < 2 ? -1 : 1);
      const score = -axis.dot(forward) - leftLean * axis.dot(right) + (side === hotspots.sides[b] ? keepMargin : 0);
      if (score > facing) {
        facing = score;
        chosen = side;
      }
    }
    hotspots.sides[b] = chosen;
    const a = (thin + 1 + (chosen % 2)) % 3;
    normal.setFromMatrixColumn(matrix, thin).normalize();
    const toward = normal.dot(forward) > 0 ? -1 : 1;
    const flat = MathUtils.smoothstep(Math.abs(normal.dot(forward)), edgeOnUntil, faceOnFrom);
    bounds.getCenter(center);
    bounds.getSize(size);
    center.setComponent(a, center.getComponent(a) + (1 - flat) * (chosen < 2 ? -0.5 : 0.5) * size.getComponent(a));
    center.setComponent(thin, center.getComponent(thin) + flat * toward * 0.5 * size.getComponent(thin));
    const symbol = hotspots.symbols[b]!;
    symbol.position.copy(center).applyMatrix4(matrix);
    // Lying flat along whichever of the face's sides is more across the screen, so upright as far as it can be
    const [u, v] = [(thin + 1) % 3, (thin + 2) % 3];
    const across =
      Math.abs(axis.setFromMatrixColumn(matrix, u).normalize().dot(right)) >= Math.abs(along.setFromMatrixColumn(matrix, v).normalize().dot(right));
    const faceSide = across ? axis : along;
    faceSide.multiplyScalar(faceSide.dot(right) < 0 ? -1 : 1);
    normal.multiplyScalar(toward);
    lying.setFromRotationMatrix(basis.makeBasis(faceSide, up.crossVectors(normal, faceSide), normal));
    symbol.quaternion.copy(camera.quaternion).slerp(lying, flat);
    symbol.scale.set(hotspots.symbolSize, hotspots.symbolSize, 1);
  }
}

/** Draws a symbol at the depth of its middle, a little toward the camera, so it's hidden or shown whole, never cut by what passes through it */
function atAnchorDepth(shader: { vertexShader: string; fragmentShader: string }): void {
  shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\nvarying float vAnchorDepth;").replace(
    "#include <project_vertex>",
    `#include <project_vertex>
vec4 anchor = modelViewMatrix * vec4(0.0, 0.0, 0.0, 1.0);
anchor.z += ${anchorBias.toFixed(3)} * length(modelViewMatrix[0].xyz);
vec4 anchorClip = projectionMatrix * anchor;
vAnchorDepth = 0.5 * anchorClip.z / anchorClip.w + 0.5;`
  );
  shader.fragmentShader = shader.fragmentShader
    .replace("#include <common>", "#include <common>\nvarying float vAnchorDepth;")
    .replace("#include <dithering_fragment>", "#include <dithering_fragment>\ngl_FragDepth = vAnchorDepth;");
}

/** The symbol the ray hits first, unless what's drawn in front of its middle hides it, as it's drawn; `hits` are the ray's other hits */
export function getHotspotHit(hotspots: Hotspots, raycaster: Raycaster, hits: ReadonlyArray<Intersection>): Intersection | undefined {
  const [symbol] = hotspots.object.visible ? raycaster.intersectObjects(hotspots.symbols, false) : [];
  const depth = symbol ? raycaster.ray.origin.distanceTo(symbol.object.position) - anchorBias * symbol.object.scale.x : 0;
  const hidden = hits.some(
    ({ object, distance }) =>
      distance < depth && object instanceof Mesh && !Array.isArray(object.material) && object.material.visible && object.material.depthWrite
  );
  return hidden ? undefined : symbol;
}

/** The compiled item, the relation's shape, of the hotspot whose symbol is `object` */
export function getHotspotItem(hotspots: Hotspots, object: Object3D): number | undefined {
  return hotspots.boxes[hotspots.symbols.findIndex((symbol) => symbol === object)]?.item;
}

export function disposeHotspots(hotspots: Hotspots): void {
  hotspots.symbols.forEach((symbol) => symbol.material.dispose());
  hotspots.textures.forEach((texture) => texture.dispose());
}

/** A rounded square in the color, edged in black as its slab, with a white plus */
function createSymbolTexture(style: string): Texture {
  const canvas = document.createElement("canvas");
  Object.assign(canvas, { width: symbolPixels, height: symbolPixels });
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const p = symbolPixels;
    ctx.beginPath();
    ctx.roundRect(0.06 * p, 0.06 * p, 0.88 * p, 0.88 * p, 0.2 * p);
    Object.assign(ctx, { fillStyle: style, strokeStyle: "black", lineWidth: 0.05 * p, lineCap: "round" });
    ctx.fill();
    ctx.stroke();
    Object.assign(ctx, { strokeStyle: "white", lineWidth: 0.085 * p, lineJoin: "round" });
    ctx.beginPath();
    ctx.moveTo(0.5 * p, 0.27 * p);
    ctx.lineTo(0.5 * p, 0.73 * p);
    ctx.moveTo(0.27 * p, 0.5 * p);
    ctx.lineTo(0.73 * p, 0.5 * p);
    ctx.stroke();
  }
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  return texture;
}

const center = new Vector3();
const forward = new Vector3();
const right = new Vector3();
const axis = new Vector3();
const along = new Vector3();
const normal = new Vector3();
const up = new Vector3();
const basis = new Matrix4();
const lying = new Quaternion();
const size = new Vector3();
const scale = new Vector3();
