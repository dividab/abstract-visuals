import {
  type BatchedMesh,
  Box3,
  CanvasTexture,
  HalfFloatType,
  type Scene,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  OrthographicCamera,
  PlaneGeometry,
  ShaderMaterial,
  UniformsUtils,
  Vector3,
  type WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { HorizontalBlurShader } from "three/addons/shaders/HorizontalBlurShader.js";
import { VerticalBlurShader } from "three/addons/shaders/VerticalBlurShader.js";
import type { BuiltScene } from "../build/build.js";

/**
 * A soft shadow on the ground the scene stands on, rendered once per build: the solids seen from below by their depth, darker the closer to the
 * ground, blurred into a texture on a plane, so a frame costs one textured quad. three.js's webgl_shadow_contact example, rendered once as drei's
 * ContactShadows with `frames={1}`
 */

export type GroundShadow = {
  readonly mesh: Mesh<PlaneGeometry, MeshBasicMaterial>;
  readonly floor: Mesh<PlaneGeometry, MeshBasicMaterial>;
  readonly target: WebGLRenderTarget;
};

/** The layer the solids are drawn on for the shadow, so text, lines, images and dimensions don't cast one */
const shadowLayer = 1;
/** Of the texture's longer side */
const resolution = 512;
/** The blur's reach, of the solids' height */
const softness = 0.22;
const opacity = 1;
/** A pool of light on the floor the shadow lies in, so it shows on a dark background, which a shadow alone can't darken; on white it's invisible */
const floorLight = 0.06;
/** The pool's reach beyond the solids, of their height */
const floorReach = 1;

/** The batches of solids that cast shadows, with their bounds: opaque ones whose material doesn't turn it off, not text, lines, images or dimensions */
export function getShadowCasters(built: BuiltScene): { readonly casters: ReadonlyArray<BatchedMesh>; readonly bounds: Box3 } {
  const casters: Array<BatchedMesh> = [];
  const bounds = new Box3();
  built.parts.forEach((part) => {
    if (part.kind === "solid" && part.object.castShadow && part.object.parent !== built.dimensions && part.object.boundingBox) {
      casters.push(part.object);
      bounds.union(part.object.boundingBox);
    }
  });
  return { casters, bounds };
}

/** Undefined for a scene without solids; renders with `renderer`, and leaves its render target as it was */
export function createGroundShadow(renderer: WebGLRenderer, scene: Scene, built: BuiltScene): GroundShadow | undefined {
  const { casters, bounds } = getShadowCasters(built);
  if (bounds.isEmpty()) {
    return undefined;
  }
  casters.forEach((caster) => caster.layers.enable(shadowLayer));
  const size = bounds.getSize(new Vector3());
  // The plane reaches past the solids by twice the blur's reach on every side
  const reach = softness * size.y;
  const [width, depth] = [size.x + reach * 4, size.z + reach * 4];
  const center = new Vector3((bounds.min.x + bounds.max.x) / 2, bounds.min.y, (bounds.min.z + bounds.max.z) / 2);
  const [texelsX, texelsZ] =
    width > depth ? [resolution, Math.ceil((resolution * depth) / width)] : [Math.ceil((resolution * width) / depth), resolution];
  // Half float, so the blur's soft falloff isn't rounded into steps
  const halfFloat = { type: HalfFloatType };
  const [target, blurred] = [new WebGLRenderTarget(texelsX, texelsZ, halfFloat), new WebGLRenderTarget(texelsX, texelsZ, halfFloat)];

  // Looks up from the ground, seeing as far as the solids are high
  const camera = new OrthographicCamera(-width / 2, width / 2, depth / 2, -depth / 2, 0, size.y);
  camera.position.copy(center);
  camera.rotation.x = Math.PI / 2;
  camera.layers.set(shadowLayer);
  camera.updateMatrixWorld();
  // Depth tested, so at each point the surface closest to the ground darkens it, not the last one drawn
  const darkness = new MeshDepthMaterial();
  darkness.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );",
      "gl_FragColor = vec4( vec3( 0.0 ), sqrt( 1.0 - fragCoordZ ) );"
    );
  };
  const previous = renderer.getRenderTarget();
  Object.assign(scene, { overrideMaterial: darkness });
  renderer.setRenderTarget(target);
  renderer.render(scene, camera);
  Object.assign(scene, { overrideMaterial: null });

  const horizontal = new ShaderMaterial({ ...HorizontalBlurShader, uniforms: UniformsUtils.clone(HorizontalBlurShader.uniforms) });
  const vertical = new ShaderMaterial({ ...VerticalBlurShader, uniforms: UniformsUtils.clone(VerticalBlurShader.uniforms) });
  const quad = new FullScreenQuad(horizontal);
  // The blur shaders reach 4 steps; three passes of shrinking steps blend into one smooth falloff
  const step = (reach * texelsX) / width / 4;
  [step, step / 2, step / 4].forEach((amount) => {
    Object.assign(horizontal.uniforms, { tDiffuse: { value: target.texture }, h: { value: amount / texelsX } });
    quad.material = horizontal;
    renderer.setRenderTarget(blurred);
    quad.render(renderer);
    Object.assign(vertical.uniforms, { tDiffuse: { value: blurred.texture }, v: { value: amount / texelsZ } });
    quad.material = vertical;
    renderer.setRenderTarget(target);
    quad.render(renderer);
  });
  renderer.setRenderTarget(previous);
  [blurred, darkness, horizontal, vertical, quad].forEach((d) => d.dispose());

  // The plane faces down as the camera looked up, so its texture lines up, and is mirrored to face up
  const mesh = new Mesh(
    new PlaneGeometry(width, depth).rotateX(Math.PI / 2),
    ditherAlpha(new MeshBasicMaterial({ map: target.texture, transparent: true, depthWrite: false, opacity }), 2)
  );
  mesh.position.copy(center);
  mesh.scale.y = -1;
  // The floor's pool of light first, then the shadow in it, both before other transparent objects
  const floor = new Mesh(
    new PlaneGeometry(size.x + size.y * floorReach * 2, size.z + size.y * floorReach * 2).rotateX(-Math.PI / 2),
    ditherAlpha(new MeshBasicMaterial({ alphaMap: createPool(), transparent: true, depthWrite: false, opacity: floorLight }), 1)
  );
  floor.position.copy(center);
  Object.assign(floor, { renderOrder: -2 });
  Object.assign(mesh, { renderOrder: -1 });
  scene.add(floor, mesh);
  return { mesh, floor, target };
}

/** A radial falloff from the center to the edges, as a spotlight's pool on the floor */
function createPool(): CanvasTexture {
  const canvas = Object.assign(document.createElement("canvas"), { width: 128, height: 128 });
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, "#fff");
  gradient.addColorStop(0.3, "#999");
  gradient.addColorStop(0.7, "#222");
  gradient.addColorStop(1, "#000");
  Object.assign(ctx, { fillStyle: gradient }).fillRect(0, 0, 128, 128);
  return new CanvasTexture(canvas);
}

export function disposeGroundShadow(shadow: GroundShadow): void {
  [shadow.mesh, shadow.floor].forEach((mesh) => {
    mesh.removeFromParent();
    mesh.geometry.dispose();
    mesh.material.alphaMap?.dispose();
    mesh.material.dispose();
  });
  shadow.target.dispose();
}

/**
 * Jitters the alpha by about `levels` of the screen's 256 per pixel, so a faint gradient blended over the background doesn't show the 8-bit steps of
 * the blend; three's `dithering` jitters the color, which these blends' steps don't come from
 */
function ditherAlpha(material: MeshBasicMaterial, levels: number): MeshBasicMaterial {
  material.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      "#include <dithering_fragment>",
      `gl_FragColor.a = clamp( gl_FragColor.a + ( rand( gl_FragCoord.xy ) - 0.5 ) * ${(levels / 255).toFixed(5)}, 0.0, 1.0 );`
    );
  };
  return material;
}
