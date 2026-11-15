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

/**
 * Without reflections, i.e. without the studio, metals keep at most a little metalness, satin from the lights' highlights, as they'd be black, having
 * almost no diffuse light
 */
export function createClassMaterial(c: MaterialClass, reflections: boolean): Material {
  const side = c.side === "front" ? FrontSide : c.side === "back" ? BackSide : DoubleSide;
  const common = { side, transparent: c.transparent, depthWrite: !c.transparent };
  if (!c.lit) {
    return new MeshBasicMaterial(common);
  }
  const finish = c.type ? finishes[c.type] : {};
  const metalness = c.metalness ?? finish.metalness ?? 0;
  const roughness = c.roughness ?? finish.roughness ?? 1;
  const material = c.type
    ? new MeshPhysicalMaterial({ ...common, ...finish, metalness: reflections ? metalness : Math.min(metalness, plainMetalness), roughness })
    : new MeshStandardMaterial({ ...common, metalness: reflections ? metalness : Math.min(metalness, plainMetalness), roughness });
  return Object.assign(material, { onBeforeCompile: c.type === "galvanized" ? galvanize : roundEdges });
}

/** The most metalness without reflections */
const plainMetalness = 0.25;

/**
 * The physical finish of each type of surface, in the material's color, its metalness and roughness unless the material has its own: metals reflect
 * their color; the others are dielectrics with a white reflection; painted sheet has a full, soft clearcoat, fabric a soft sheen. Glass is a thin,
 * smooth, mostly see-through surface, not refracting, which would render the scene once more each frame
 */
const finishes: Record<MaterialType, MeshPhysicalMaterialParameters> = {
  painted: { metalness: 0, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.5 },
  galvanized: { metalness: 1, roughness: 0.5 },
  aluminum: { metalness: 1, roughness: 0.4 },
  stainless: { metalness: 1, roughness: 0.2 },
  copper: { metalness: 1, roughness: 0.25 },
  plastic: { metalness: 0, roughness: 0.4 },
  rubber: { metalness: 0, roughness: 0.9 },
  fabric: { metalness: 0, roughness: 1, sheen: 1, sheenRoughness: 0.8, sheenColor: 0x888888 },
  glass: { metalness: 0, roughness: 0.05, specularIntensity: 1 },
};

/**
 * Shades the edges of boxes with a radius as rounded by it, so they catch light and reflections: the normal of a rounded box of the same size, from
 * the signed distance function of a rounded box (Inigo Quilez's sdRoundBox), is used at each point of the sharp one. No extra geometry, and the
 * radius stays the same along every edge, as boxes are one unit cube scaled to their size. Only the box's rounded edges bend; the outline stays
 * sharp
 */
function roundEdges(shader: { vertexShader: string; fragmentShader: string }): void {
  shader.vertexShader = shader.vertexShader
    .replace(
      "#include <common>",
      `#include <common>
attribute vec2 bevel;
varying float vBevel;
flat varying int vEdges;
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
  vBevel = bevel.x;
  vEdges = int( bevel.y );
  vBoxHalf = boxSize * 0.5;
  vBoxPoint = position * boxSize;`
    );
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
varying float vBevel;
flat varying int vEdges;
varying vec3 vBoxPoint;
varying vec3 vBoxHalf;
varying mat3 vBoxRotation;`
    )
    .replace(
      "#include <normal_fragment_maps>",
      `#include <normal_fragment_maps>
float edgeShade = 1.0;
if ( vBevel > 0.0 ) {
  // At least 2 pixels wide, so a rounded edge far away is a soft line instead of a jagged sub-pixel highlight, and at most half the box; a radius
  // smaller than that bends the normal only partly, so far edges don't catch more light than their size
  vec3 pixel = fwidth( vBoxPoint );
  float minRadius = 2.0 * max( pixel.x, max( pixel.y, pixel.z ) );
  float radius = min( max( vBevel, minRadius ), min( vBoxHalf.x, min( vBoxHalf.y, vBoxHalf.z ) ) );
  float bend = min( vBevel / minRadius, 1.0 );
  vec3 near = max( abs( vBoxPoint ) - ( vBoxHalf - radius ), 0.0 );
  // Whether the edge along x, y and z here is rounded, its bit by which sides it's between, as boxEdges orders them
  ivec3 high = ivec3( greaterThan( vBoxPoint, vec3( 0.0 ) ) );
  bvec3 edge = notEqual( ( ivec3( vEdges ) >> ( ivec3( 0, 4, 8 ) + high.yxx + 2 * high.zzy ) ) & 1, ivec3( 0 ) );
  // An axis bends where the edge between its side and another side near the point is rounded
  vec3 bends = vec3(
    ( edge.z && near.y > 0.0 ) || ( edge.y && near.z > 0.0 ),
    ( edge.z && near.x > 0.0 ) || ( edge.x && near.z > 0.0 ),
    ( edge.y && near.x > 0.0 ) || ( edge.x && near.y > 0.0 )
  );
  vec3 rounded = sign( vBoxPoint ) * near * bends;
  if ( dot( rounded, rounded ) > 0.0 ) {
    normal = normalize( mix( normal, normalize( vBoxRotation * normalize( rounded ) ) * faceDirection, bend ) );
  }
  // Light doesn't reach into the groove where rounded edges meet, so parts show where they start and end, also far away: how far into the edge
  // a point is, from the face to its outermost line, is the bend of the axes other than the face's, which is bent by the whole radius
  vec3 bent = abs( rounded );
  float depth = min( ( bent.x + bent.y + bent.z - max( bent.x, max( bent.y, bent.z ) ) ) / radius, 1.0 );
  edgeShade = 1.0 - 0.4 * depth * depth;
}`
    )
    .replace(
      "#include <aomap_fragment>",
      `#include <aomap_fragment>
reflectedLight.directDiffuse *= edgeShade;
reflectedLight.directSpecular *= edgeShade;
reflectedLight.indirectDiffuse *= edgeShade;
reflectedLight.indirectSpecular *= edgeShade;`
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

/** Rounded edges and galvanized spangle: ragged, grainy 10 mm zinc crystals, each shaded and tilted of its own, faded out below 3 pixels wide */
function galvanize(shader: { vertexShader: string; fragmentShader: string }): void {
  roundEdges(shader);
  shader.fragmentShader = shader.fragmentShader
    .replace(
      "#include <common>",
      `#include <common>
vec2 spangleHash( vec2 p ) {
  vec3 q = fract( p.xyx * vec3( 0.1031, 0.1030, 0.0973 ) );
  q += dot( q, q.yzx + 33.33 );
  return fract( ( q.xx + q.yz ) * q.zy );
}
float spangleNoise( vec2 p ) {
  vec2 i = floor( p );
  vec2 f = smoothstep( 0.0, 1.0, fract( p ) );
  return mix( mix( spangleHash( i ).x, spangleHash( i + vec2( 1.0, 0.0 ) ).x, f.x ), mix( spangleHash( i + vec2( 0.0, 1.0 ) ).x, spangleHash( i + 1.0 ).x, f.x ), f.y );
}`
    )
    .replace(
      "#include <normal_fragment_maps>",
      `#include <normal_fragment_maps>
vec3 facePoint = vBoxPoint / 10.0;
// The interpolated normal in the part's own space, so curved parts switch plane cleanly instead of per pixel
vec3 faceNormal = abs( transpose( vBoxRotation ) * normal );
bool faceX = faceNormal.x > max( faceNormal.y, faceNormal.z );
bool faceY = !faceX && faceNormal.y > faceNormal.z;
vec2 spanglePoint = faceX ? facePoint.yz : faceY ? facePoint.xz : facePoint.xy;
vec3 spangleU = faceX ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
vec3 spangleV = faceX || faceY ? vec3( 0.0, 0.0, 1.0 ) : vec3( 0.0, 1.0, 0.0 );
// Warped, so the crystals' edges are ragged instead of straight
vec2 warpedPoint = spanglePoint + 0.4 * vec2( spangleNoise( spanglePoint * 2.5 ), spangleNoise( spanglePoint * 2.5 + 7.3 ) ) +
  0.15 * vec2( spangleNoise( spanglePoint * 7.0 + 3.1 ), spangleNoise( spanglePoint * 7.0 + 11.7 ) );
vec2 spangleCell = floor( warpedPoint );
vec2 nearestCell = spangleCell;
vec2 nearestOffset = vec2( 0.0 );
float nearest = 8.0;
for ( int y = -1; y <= 1; y++ ) {
  for ( int x = -1; x <= 1; x++ ) {
    vec2 cell = spangleCell + vec2( x, y );
    vec2 offset = cell + spangleHash( cell ) - warpedPoint;
    float cellDistance = dot( offset, offset );
    if ( cellDistance < nearest ) {
      nearest = cellDistance;
      nearestCell = cell;
      nearestOffset = offset;
    }
  }
}
// Fades from 8 pixels a crystal to 3, and the grain within it, 12 to a crystal, likewise
vec2 spanglePixel = fwidth( spanglePoint );
float spanglePixels = max( spanglePixel.x, spanglePixel.y );
float spangleFade = 1.0 - smoothstep( 0.125, 0.33, spanglePixels );
float grainFade = 1.0 - smoothstep( 0.125, 0.33, 12.0 * spanglePixels );
vec3 spangleRandom = vec3( spangleHash( nearestCell + 17.0 ), spangleHash( nearestCell + 31.0 ).x ) - 0.5;
// Partly shared by neighbouring crystals, so they cluster into lighter and darker patches, and shading across each crystal, as its facets catch
// the light
float spangle = ( 0.5 * spangleRandom.z + 0.7 * ( spangleNoise( nearestCell * 0.3 ) - 0.5 ) + 0.5 * dot( nearestOffset, spangleRandom.xy ) ) * spangleFade;
float grain = ( spangleNoise( spanglePoint * 12.0 ) - 0.5 ) * grainFade;
// Zinc reflects more than the matte gray galvanized is usually given in
diffuseColor.rgb *= 1.25 * ( 1.0 + 0.16 * spangle + 0.08 * grain );
roughnessFactor = clamp( roughnessFactor + 0.1 * spangle + 0.1 * grain, 0.05, 1.0 );
// Each crystal tilted a few degrees, so it catches reflections of its own
normal = normalize( normal + 0.05 * spangleFade * vBoxRotation * ( spangleRandom.x * spangleU + spangleRandom.y * spangleV ) );`
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
