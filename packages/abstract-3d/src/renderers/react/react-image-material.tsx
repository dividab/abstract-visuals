import React from "react";
import { suspend } from "suspend-react";
import { createSVG } from "abstract-image";
import { CanvasTexture, DoubleSide, PlaneGeometry, SRGBColorSpace, type Texture, TextureLoader } from "three";
import { Material, Image as A3dImage } from "../../abstract-3d.js";
import { ERROR_IMG_KEY, getColor, materialDefaults, MaterialState, selectMat } from "./react-material.js";

export const planeGeometry = new PlaneGeometry();

export enum MinificationFilter {
  Nearest = 1003,
  Linear = 1006,
  LinearMipmap = 1008,
}

export enum MagnificationFilter {
  Nearest = 1003,
  Linear = 1006,
}

export type TextureFilter = {
  readonly min: MinificationFilter;
  readonly mag: MagnificationFilter;
};

const filter: TextureFilter = { min: MinificationFilter.LinearMipmap, mag: MagnificationFilter.Linear };
const textureCache: Map<string, Texture | null> = new Map();

export function ImageMaterial({
  image,
  materialStateImages,
  material,
  useAlphaTest,
  hovered,
  selected,
  materialState,
}: {
  readonly image: A3dImage;
  readonly material: Material;
  readonly materialStateImages: Record<string, string> | undefined;
  readonly hovered: boolean;
  readonly selected: boolean | undefined;
  readonly useAlphaTest: boolean | undefined;
  readonly materialState: MaterialState | undefined;
}): React.JSX.Element {
  const url =
    materialState === "Error" && materialStateImages?.[ERROR_IMG_KEY]
      ? materialStateImages[ERROR_IMG_KEY]
      : image.type === "AbstractImage"
      ? `data:image/svg+xml,${createSVG(image.image)}`
      : image.url;
  const texture = suspend(urlIsSvg(url) ? loadSvg(url, filter) : loadNormal(url, filter), [url]) as Texture | null;

  return (
    <meshBasicMaterial
      color={getColor(selected, hovered, material, selectMat)}
      side={DoubleSide}
      alphaTest={useAlphaTest ?? true ? 0.8 : undefined}
      map={texture}
      {...(material.opacity !== undefined && material.opacity < 1 ? { opacity: material.opacity } : materialDefaults)}
      transparent
    />
  );
}

function urlIsSvg(url: string): boolean {
  return url.startsWith("data:image/svg+xml") || url.endsWith(".svg") || url.includes(".svg?");
}

function loadSvg(url: string, filter: TextureFilter): Promise<Texture | null> {
  if (textureCache.has(url)) {
    return Promise.resolve(textureCache.get(url) ?? null);
  }

  return new Promise((res) => {
    const maxSize = 512;
    const img = new Image();

    // eslint-disable-next-line consistent-return
    img.onload = (): void => {
      const canvas = document.createElement("canvas");
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const width = imgW >= imgH ? maxSize : maxSize * (imgW / imgH);
      const height = imgH >= imgW ? maxSize : maxSize * (imgH / imgW);

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        return res(null);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const texture = new CanvasTexture(canvas);
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = filter.min;
      texture.magFilter = filter.mag;
      texture.generateMipmaps = filter.min === MinificationFilter.LinearMipmap;
      texture.anisotropy = 4;
      texture.needsUpdate = true;

      res(texture);
      textureCache.set(url, texture);
    };

    img.onerror = () => res(null);
    img.src = url;
  });
}

function loadNormal(url: string, filter: TextureFilter): Promise<Texture | null> {
  return new Promise((res) =>
    textureLoader.load(
      url,
      (data) => {
        data.colorSpace = SRGBColorSpace;
        data.minFilter = filter.min;
        data.magFilter = filter.mag;
        data.generateMipmaps = filter.min === MinificationFilter.LinearMipmap;
        data.anisotropy = 4;
        res(data);
      },
      undefined,
      () => res(null)
    )
  );
}

const textureLoader = new TextureLoader();
