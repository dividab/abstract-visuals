import { createSVG } from "abstract-image";
import {
  BackSide,
  CanvasTexture,
  DoubleSide,
  FrontSide,
  LinearFilter,
  LinearMipmapLinearFilter,
  type Material,
  MeshBasicMaterial,
  MeshPhysicalMaterial,
  type MeshPhysicalMaterialParameters,
  MeshStandardMaterial,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from "three";
import type { Image, MaterialType } from "../../../abstract-3d.js";
import type { MaterialClass, MaterialState } from "../appearance/appearance.js";
import { ERROR_IMG_KEY } from "../appearance/appearance.js";

/** White materials, colored per instance, for each material class; images' materials and textures */

export function createClassMaterial(c: MaterialClass): Material {
  const side = c.side === "front" ? FrontSide : c.side === "back" ? BackSide : DoubleSide;
  const common = { side, transparent: c.transparent, depthWrite: !c.transparent };
  if (!c.lit) {
    return new MeshBasicMaterial(common);
  }
  const material = c.type
    ? new MeshPhysicalMaterial({ ...common, ...finishes[c.type] })
    : new MeshStandardMaterial({ ...common, metalness: c.metalness, roughness: c.roughness });
  return Object.assign(material, { onBeforeCompile: roundEdges });
}

/**
 * The physical finish of each type of surface, in the material's color: metals reflect their color, brighter than physical, as product renders light
 * metals, since the studio around them is dark; the others are dielectrics with a white reflection; painted sheet has a light clearcoat, fabric a
 * soft sheen. Glass is a thin, smooth, mostly see-through surface, not refracting, which would render the scene once more each frame
 */
const finishes: Record<MaterialType, MeshPhysicalMaterialParameters> = {
  painted: { metalness: 0, roughness: 0.45, clearcoat: 0.3, clearcoatRoughness: 0.25 },
  galvanized: { metalness: 0.85, roughness: 0.55, envMapIntensity: 1.6 },
  aluminum: { metalness: 0.9, roughness: 0.4, envMapIntensity: 1.6 },
  stainless: { metalness: 1, roughness: 0.25, envMapIntensity: 1.5 },
  copper: { metalness: 1, roughness: 0.3, envMapIntensity: 1.3 },
  plastic: { metalness: 0, roughness: 0.55 },
  rubber: { metalness: 0, roughness: 0.9 },
  fabric: { metalness: 0, roughness: 1, sheen: 1, sheenRoughness: 0.8, sheenColor: 0x888888 },
  glass: { metalness: 0, roughness: 0.05, specularIntensity: 1 },
};

/**
 * Shades the edges of boxes with a radius as rounded by it, so they catch light and reflections: the normal of a rounded box of the same size, from
 * the signed distance function of a rounded box (Inigo Quilez's sdRoundBox), is used at each point of the sharp one. No extra geometry, and the
 * radius stays the same along every edge, as boxes are one unit cube scaled to their size. Only the outline stays sharp
 */
function roundEdges(shader: { vertexShader: string; fragmentShader: string }): void {
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
attribute float bevel;
varying float vBevel;
varying vec3 vBoxPoint;
varying vec3 vBoxHalf;
varying mat3 vBoxRotation;`
    )
    .replace(
      "#include <batching_vertex>",
      `#include <batching_vertex>
#ifdef USE_BATCHING
  vec3 boxSize = vec3( length( batchingMatrix[ 0 ].xyz ), length( batchingMatrix[ 1 ].xyz ), length( batchingMatrix[ 2 ].xyz ) );
  mat3 boxRotation = mat3( batchingMatrix[ 0 ].xyz / boxSize.x, batchingMatrix[ 1 ].xyz / boxSize.y, batchingMatrix[ 2 ].xyz / boxSize.z );
#else
  vec3 boxSize = vec3( 1.0 );
  mat3 boxRotation = mat3( 1.0 );
#endif
  // From the box's own axes to view space, where the fragment shader's normal is
  vBoxRotation = normalMatrix * boxRotation;
  vBevel = bevel;
  vBoxHalf = boxSize * 0.5;
  vBoxPoint = position * boxSize;`
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
varying float vBevel;
varying vec3 vBoxPoint;
varying vec3 vBoxHalf;
varying mat3 vBoxRotation;`
    )
    .replace(
      "#include <normal_fragment_maps>",
      `#include <normal_fragment_maps>
if ( vBevel > 0.0 ) {
  // At least 2 pixels wide, so a rounded edge far away is a soft line instead of a jagged sub-pixel highlight, and at most half the box
  vec3 pixel = fwidth( vBoxPoint );
  float radius = min( max( vBevel, 2.0 * max( pixel.x, max( pixel.y, pixel.z ) ) ), min( vBoxHalf.x, min( vBoxHalf.y, vBoxHalf.z ) ) );
  vec3 rounded = sign( vBoxPoint ) * max( abs( vBoxPoint ) - ( vBoxHalf - radius ), 0.0 );
  if ( dot( rounded, rounded ) > 0.0 ) {
    normal = normalize( vBoxRotation * normalize( rounded ) ) * faceDirection;
  }
}`
    )
    .replace(
      "#include <clearcoat_normal_fragment_maps>",
      `#include <clearcoat_normal_fragment_maps>
#ifdef USE_CLEARCOAT
  // A painted finish's clearcoat follows the rounded edge too
  if ( vBevel > 0.0 ) {
    clearcoatNormal = normal;
  }
#endif`
    );
}

export function createImageMaterial(backfaceCulling: boolean | undefined, useAlphaTest: boolean): MeshBasicMaterial {
  return new MeshBasicMaterial({ side: backfaceCulling ? FrontSide : DoubleSide, alphaTest: useAlphaTest ? 0.8 : 0, transparent: true });
}

export function getImageUrl(image: Image, materialState: MaterialState | undefined, materialStateImages: Record<string, string> | undefined): string {
  const errorUrl = materialState === "Error" ? materialStateImages?.[ERROR_IMG_KEY] : undefined;
  return errorUrl ?? (image.type === "AbstractImage" ? `data:image/svg+xml,${createSVG(image.image)}` : image.url);
}

/** A url's texture, loaded once; `texture` is set once it's loaded, so a rebuild shows it right away instead of a frame later */
export type TextureEntry = { loading: Promise<Texture | undefined>; texture?: Texture };
export type TextureCache = Map<string, TextureEntry>;

export function loadTexture(cache: TextureCache, url: string): TextureEntry {
  const cached = cache.get(url);
  if (cached) {
    return cached;
  }
  const svg = url.startsWith("data:image/svg+xml") || url.endsWith(".svg") || url.includes(".svg?");
  const entry: TextureEntry = { loading: svg ? loadSvg(url) : loader.loadAsync(url).catch(() => undefined) };
  entry.loading = entry.loading.then((t) => (entry.texture = t && applyFilters(t)));
  cache.set(url, entry);
  return entry;
}

export function disposeTextures(cache: TextureCache): void {
  cache.forEach((entry) => {
    entry.loading.then((texture) => texture?.dispose()).catch(() => undefined);
  });
  cache.clear();
}

const loader = new TextureLoader();
const svgSize = 512;

/** SVGs are rasterized at up to 512 px, as their own size is often small; from the r3f renderer's react-image-material.tsx */
function loadSvg(url: string): Promise<Texture | undefined> {
  const image = new Image();
  image.src = url;
  return image.decode().then(
    () => rasterize(image),
    () => undefined
  );
}

function rasterize(image: HTMLImageElement): Texture | undefined {
  const scale = svgSize / Math.max(image.naturalWidth, image.naturalHeight);
  const canvas = document.createElement("canvas");
  Object.assign(canvas, { width: image.naturalWidth * scale, height: image.naturalHeight * scale });
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return new CanvasTexture(canvas);
}

function applyFilters(texture: Texture): Texture {
  Object.assign(texture, {
    colorSpace: SRGBColorSpace,
    minFilter: LinearMipmapLinearFilter,
    magFilter: LinearFilter,
    generateMipmaps: true,
    anisotropy: 4,
  });
  texture.needsUpdate = true;
  return texture;
}
