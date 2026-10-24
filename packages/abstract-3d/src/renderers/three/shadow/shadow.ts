import {
  Box3,
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

export type GroundShadow = { readonly mesh: Mesh<PlaneGeometry, MeshBasicMaterial>; readonly target: WebGLRenderTarget };

/** The layer the solids are drawn on for the shadow, so text, lines, images and dimensions don't cast one */
const shadowLayer = 1;
/** Of the texture's longer side */
const resolution = 512;
/** The blur's reach, of the solids' height */
const softness = 0.15;
const opacity = 0.8;

/** Undefined for a scene without solids; renders with `renderer`, and leaves its render target as it was */
export function createGroundShadow(renderer: WebGLRenderer, scene: Scene, built: BuiltScene): GroundShadow | undefined {
  const bounds = new Box3();
  built.parts.forEach((part) => {
    if (part.kind === "solid" && part.object.parent !== built.dimensions && part.object.boundingBox) {
      part.object.layers.enable(shadowLayer);
      bounds.union(part.object.boundingBox);
    }
  });
  if (bounds.isEmpty()) {
    return undefined;
  }
  const size = bounds.getSize(new Vector3());
  // The plane reaches past the solids by twice the blur's reach on every side
  const reach = softness * size.y;
  const [width, depth] = [size.x + reach * 4, size.z + reach * 4];
  const center = new Vector3((bounds.min.x + bounds.max.x) / 2, bounds.min.y, (bounds.min.z + bounds.max.z) / 2);
  const [texelsX, texelsZ] =
    width > depth ? [resolution, Math.ceil((resolution * depth) / width)] : [Math.ceil((resolution * width) / depth), resolution];
  const [target, blurred] = [new WebGLRenderTarget(texelsX, texelsZ), new WebGLRenderTarget(texelsX, texelsZ)];

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
      "gl_FragColor = vec4( vec3( 0.0 ), 1.0 - fragCoordZ );"
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
    new MeshBasicMaterial({ map: target.texture, transparent: true, depthWrite: false, opacity })
  );
  mesh.position.copy(center);
  mesh.scale.y = -1;
  scene.add(mesh);
  return { mesh, target };
}

export function disposeGroundShadow(shadow: GroundShadow): void {
  shadow.mesh.removeFromParent();
  shadow.mesh.geometry.dispose();
  shadow.mesh.material.dispose();
  shadow.target.dispose();
}
