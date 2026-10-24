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
  MeshStandardMaterial,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from "three";
import type { Image } from "../../../abstract-3d.js";
import type { MaterialClass, MaterialState } from "../appearance/appearance.js";
import { ERROR_IMG_KEY } from "../appearance/appearance.js";

/** White materials, colored per instance, for each material class; images' materials and textures */

export function createClassMaterial(c: MaterialClass): Material {
  const side = c.side === "front" ? FrontSide : c.side === "back" ? BackSide : DoubleSide;
  const common = { side, transparent: c.transparent, depthWrite: !c.transparent };
  return c.lit ? new MeshStandardMaterial({ ...common, metalness: c.metalness, roughness: c.roughness }) : new MeshBasicMaterial(common);
}

export function createImageMaterial(backfaceCulling: boolean | undefined, useAlphaTest: boolean): MeshBasicMaterial {
  return new MeshBasicMaterial({ side: backfaceCulling ? FrontSide : DoubleSide, alphaTest: useAlphaTest ? 0.8 : 0, transparent: true });
}

export function getImageUrl(image: Image, materialState: MaterialState | undefined, materialStateImages: Record<string, string> | undefined): string {
  const errorUrl = materialState === "Error" ? materialStateImages?.[ERROR_IMG_KEY] : undefined;
  return errorUrl ?? (image.type === "AbstractImage" ? `data:image/svg+xml,${createSVG(image.image)}` : image.url);
}

/** Each url's texture, loaded once */
export type TextureCache = Map<string, Promise<Texture | undefined>>;

export function loadTexture(cache: TextureCache, url: string): Promise<Texture | undefined> {
  const svg = url.startsWith("data:image/svg+xml") || url.endsWith(".svg") || url.includes(".svg?");
  const loading = cache.get(url) ?? (svg ? loadSvg(url) : loader.loadAsync(url).catch(() => undefined)).then((t) => t && applyFilters(t));
  cache.set(url, loading);
  return loading;
}

export function disposeTextures(cache: TextureCache): void {
  cache.forEach((loading) => {
    loading.then((texture) => texture?.dispose()).catch(() => undefined);
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
