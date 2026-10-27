import {
  BatchedMesh,
  type BufferGeometry,
  FrontSide,
  InstancedBufferAttribute,
  InstancedMesh,
  type InterleavedBuffer,
  type InterleavedBufferAttribute,
  type Intersection,
  type Material,
  Matrix4,
  Mesh,
  type MeshBasicMaterial,
  PlaneGeometry,
  ShaderMaterial,
  Vector3,
  type Vector4,
} from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import type { Vec3 } from "../../../abstract-3d.js";
import type { GlyphAtlas } from "../text/text.js";
import { layoutText, SDF_EDGE, SDF_RADIUS } from "../text/text.js";

/** The drawn objects: solids of a material class in one batch, all text in one instanced mesh, lines per thickness, images as meshes; each item a slot */

export type Segment = {
  readonly start: Vec3;
  readonly end: Vec3;
  /** The front facing direction of a culled line, hidden while it faces away from the camera */
  readonly normal?: Vec3;
};

export type TextEntry = { readonly text: string; readonly fontSize: number; readonly local: Matrix4 };

export type Part =
  | { readonly kind: "solid"; readonly object: BatchedMesh; readonly locals: ReadonlyArray<Matrix4> }
  | {
      readonly kind: "text";
      readonly object: InstancedMesh;
      readonly locals: ReadonlyArray<Matrix4>;
      readonly glyphs: ReadonlyArray<Matrix4>;
      /** The first glyph of each slot, and one past the last */
      readonly firsts: ReadonlyArray<number>;
      readonly slotOfGlyph: Int32Array;
      readonly colors: InstancedBufferAttribute;
    }
  | {
      readonly kind: "line";
      readonly object: LineSegments2;
      readonly segments: ReadonlyArray<Segment>;
      /** World start, end and normal of each segment, while the drawn positions collapse hidden ones */
      readonly world: Float32Array;
      readonly visible: Uint8Array;
      readonly positions: InterleavedBuffer;
      readonly colors: InterleavedBuffer;
    }
  | { readonly kind: "image"; readonly object: Mesh<BufferGeometry, MeshBasicMaterial>; readonly local: Matrix4 };

/** Per-instance color for hover and selection, as three.js's BatchedMesh examples color instances */
export function createSolidPart(entries: ReadonlyArray<{ readonly geometry: BufferGeometry; readonly local: Matrix4 }>, material: Material): Part {
  const geometries = [...new Set(entries.map((e) => e.geometry))];
  const vertexCount = geometries.reduce((sum, g) => sum + g.getAttribute("position").count, 0);
  const batch = new BatchedMesh(
    entries.length,
    vertexCount,
    geometries.reduce((sum, g) => sum + g.index!.count, 0),
    material
  );
  const ids = new Map(geometries.map((g) => [g, batch.addGeometry(g)]));
  entries.forEach((e) => batch.addInstance(ids.get(e.geometry)!));
  return { kind: "solid", object: batch, locals: entries.map((e) => e.local) };
}

export function createTextPart(entries: ReadonlyArray<TextEntry>, atlas: GlyphAtlas): Part {
  const layouts = entries.map((e) => layoutText(atlas, e.text, e.fontSize));
  const quads = layouts.flat();
  const geometry = new PlaneGeometry();
  geometry.setAttribute("glyphRect", new InstancedBufferAttribute(Float32Array.from(quads.flatMap((q) => q.glyph.rect)), 4));
  const colors = new InstancedBufferAttribute(new Float32Array(quads.length * 4), 4);
  geometry.setAttribute("glyphColor", colors);
  // Glyphs colored per instance, one draw call as troika's BatchedText; edges antialiased over one screen pixel, by the atlas texels per pixel
  const material = new ShaderMaterial({
    side: FrontSide,
    transparent: true,
    depthWrite: false,
    uniforms: { atlas: { value: atlas.texture } },
    defines: { SDF_EDGE, SDF_RADIUS: SDF_RADIUS.toFixed(1), ATLAS_SIZE: atlas.size.toFixed(1) },
    vertexShader: textVertexShader,
    fragmentShader: textFragmentShader,
  });
  const mesh = new InstancedMesh(geometry, material, quads.length);
  // Drawn after the opaque batches, and never culled as a whole, as its glyphs move with their items
  Object.assign(mesh, { renderOrder: 1, frustumCulled: false });
  return {
    kind: "text",
    object: mesh,
    locals: entries.map((e) => e.local),
    glyphs: quads.map((q) => new Matrix4().makeTranslation(q.x, q.y, 0).scale(new Vector3(q.width, q.height, 1))),
    firsts: layouts.reduce<ReadonlyArray<number>>((acc, l, i) => [...acc, acc[i]! + l.length], [0]),
    slotOfGlyph: Int32Array.from(layouts.flatMap((l, slot) => l.map(() => slot))),
    colors,
  };
}

export function createLinePart(segments: ReadonlyArray<Segment>, thickness: number): Part {
  const geometry = new LineSegmentsGeometry().setPositions(new Float32Array(segments.length * 6)).setColors(new Float32Array(segments.length * 6));
  const line = new LineSegments2(geometry, new LineMaterial({ linewidth: thickness, vertexColors: true }));
  // Positions change after the geometry's bounds were computed
  line.frustumCulled = false;
  return {
    kind: "line",
    object: line,
    segments,
    world: new Float32Array(segments.length * 9),
    visible: new Uint8Array(segments.length).fill(1),
    positions: (geometry.getAttribute("instanceStart") as InterleavedBufferAttribute).data,
    colors: (geometry.getAttribute("instanceColorStart") as InterleavedBufferAttribute).data,
  };
}

/** Hidden until its texture is set */
export function createImagePart(geometry: BufferGeometry, local: Matrix4, material: MeshBasicMaterial): Extract<Part, { readonly kind: "image" }> {
  const mesh = new Mesh(geometry, material);
  Object.assign(mesh, { matrixAutoUpdate: false, visible: false });
  return { kind: "image", object: mesh, local };
}

/** Places the slot's item by its world matrix */
export function placeSlot(part: Part, slot: number, matrix: Matrix4): void {
  switch (part.kind) {
    case "solid":
      part.object.setMatrixAt(slot, scratch.multiplyMatrices(matrix, part.locals[slot]!));
      break;
    case "text": {
      const text = scratch.multiplyMatrices(matrix, part.locals[slot]!);
      for (let i = part.firsts[slot]!; i < part.firsts[slot + 1]!; i++) {
        part.object.setMatrixAt(i, glyph.multiplyMatrices(text, part.glyphs[i]!));
      }
      break;
    }
    case "line": {
      const { start, end, normal } = part.segments[slot]!;
      part.world.set(vector.set(start.x, start.y, start.z).applyMatrix4(matrix).toArray(), slot * 9);
      part.world.set(vector.set(end.x, end.y, end.z).applyMatrix4(matrix).toArray(), slot * 9 + 3);
      part.world.set(normal ? vector.set(normal.x, normal.y, normal.z).transformDirection(matrix).toArray() : [0, 0, 0], slot * 9 + 6);
      writeSegment(part, slot);
      break;
    }
    default:
      part.object.matrix.multiplyMatrices(matrix, part.local);
      part.object.matrixWorldNeedsUpdate = true;
  }
}

export function paintSlot(part: Part, slot: number, rgba: Vector4): void {
  switch (part.kind) {
    case "solid":
      part.object.setColorAt(slot, rgba);
      break;
    case "text":
      for (let i = part.firsts[slot]!; i < part.firsts[slot + 1]!; i++) {
        part.colors.setXYZW(i, rgba.x, rgba.y, rgba.z, rgba.w);
      }
      break;
    case "line":
      part.colors.array.set([rgba.x, rgba.y, rgba.z, rgba.x, rgba.y, rgba.z], slot * 6);
      break;
    default:
      part.object.material.color.setRGB(rgba.x, rgba.y, rgba.z);
      part.object.material.opacity = rgba.w;
  }
}

/** Uploads what placing and painting changed, and the bounds for culling and picking when slots moved */
export function flushPart(part: Part, moved: boolean): void {
  switch (part.kind) {
    case "solid":
      if (moved) {
        part.object.computeBoundingBox();
        part.object.computeBoundingSphere();
      }
      break;
    case "text":
      part.object.instanceMatrix.needsUpdate = true;
      part.colors.needsUpdate = true;
      part.object.boundingSphere = null;
      break;
    case "line":
      part.positions.needsUpdate = true;
      part.colors.needsUpdate = true;
      break;
    default:
  }
}

/** The slot of a hit on the part's object; lines aren't picked */
export function getHitSlot(part: Part, hit: Intersection): number | undefined {
  switch (part.kind) {
    case "solid":
      return hit.batchId;
    case "text":
      return hit.instanceId === undefined ? undefined : part.slotOfGlyph[hit.instanceId];
    case "line":
      return undefined;
    default:
      return 0;
  }
}

/** Hides the culled lines facing away from a camera at `cameraPosition`; the r3f renderer's culled line shader's test, on the CPU per camera move */
export function cullLines(part: Part, cameraPosition: Vector3): void {
  if (part.kind !== "line") {
    return;
  }
  part.segments.forEach((segment, slot) => {
    const w = slot * 9;
    const mid = vector
      .fromArray(part.world, w)
      .add(normal.fromArray(part.world, w + 3))
      .multiplyScalar(0.5);
    const facing = !segment.normal || normal.fromArray(part.world, w + 6).dot(mid.subVectors(cameraPosition, mid)) > 0 ? 1 : 0;
    if (facing !== part.visible[slot]) {
      part.visible[slot] = facing;
      writeSegment(part, slot);
      part.positions.needsUpdate = true;
    }
  });
}

export function disposePart(part: Part): void {
  if (part.kind === "solid") {
    part.object.dispose();
  } else if (part.kind !== "image") {
    part.object.geometry.dispose();
  }
  const materials = part.object.material;
  (Array.isArray(materials) ? materials : [materials]).forEach((m: Material) => m.dispose());
}

/** A hidden segment collapses to its start */
function writeSegment(part: Extract<Part, { readonly kind: "line" }>, slot: number): void {
  const w = slot * 9;
  part.positions.array.set(
    part.visible[slot] ? part.world.subarray(w, w + 6) : [...part.world.subarray(w, w + 3), ...part.world.subarray(w, w + 3)],
    slot * 6
  );
}

const textVertexShader = /* glsl */ `
attribute vec4 glyphRect;
attribute vec4 glyphColor;
varying vec2 vUv;
varying vec4 vColor;
void main() {
  vUv = glyphRect.xy + uv * glyphRect.zw;
  vColor = glyphColor;
  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
}`;

const textFragmentShader = /* glsl */ `
uniform sampler2D atlas;
varying vec2 vUv;
varying vec4 vColor;
void main() {
  vec2 texel = vUv * ATLAS_SIZE;
  float texelsPerPixel = 0.5 * (length(dFdx(texel)) + length(dFdy(texel)));
  float pixels = (texture2D(atlas, vUv).r - SDF_EDGE) * SDF_RADIUS / texelsPerPixel;
  gl_FragColor = vec4(vColor.rgb, vColor.a * clamp(pixels + 0.5, 0.0, 1.0));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

const scratch = new Matrix4();
const glyph = new Matrix4();
const vector = new Vector3();
const normal = new Vector3();
