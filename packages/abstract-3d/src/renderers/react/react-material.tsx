import React, { useEffect } from "react";
import { suspend } from "suspend-react";
import {
  BackSide,
  CanvasTexture,
  type Color,
  DoubleSide,
  FrontSide,
  type MaterialParameters,
  SRGBColorSpace,
  type Texture,
  TextureLoader,
} from "three";
import { Material } from "../../abstract-3d.js";
import { shade } from "../../utils.js";
import { mx_gradient_float } from "three/src/nodes/materialx/lib/mx_noise.js";

const decreasedOpacity = 0.125;

export enum MinificationFilter {
  Nearest = 1003,
  Linear = 1006,
  LinearMipmap = 1008,
};

export enum MagnificationFilter {
  Nearest = 1003,
  Linear = 1006,
}

export type TextureFilter = {
  readonly min: MinificationFilter;
  readonly mag: MagnificationFilter;
}

export type MaterialState = "Accept" | "Error" | "Warning";
export const ERROR_IMG_KEY = "error";

export function ReactMaterial({
  material,
  id = "",
  selectedIds,
  hoveredId,
  disabled,
  materialStateImages,
  state,
  isText,
  isHotSpot,
  drawBackOnly,
  useAlphaTest,
}: {
  readonly material: Material;
  readonly id?: string;
  readonly hoveredId?: string | undefined;
  readonly selectedIds?: Record<string, boolean> | undefined;
  readonly disabled?: boolean;
  readonly materialStateImages?: Record<string, string>;
  readonly state?: MaterialState | undefined;
  readonly isText: boolean;
  readonly isHotSpot?: boolean;
  readonly drawBackOnly?: boolean;
  readonly useAlphaTest?: boolean;
}): React.JSX.Element {
  const mat =
    !state || material.imageUrl === "UrlImage"
      ? material
      : state === "Accept"
      ? acceptMat
      : state === "Error"
      ? errorMar
      : warningMat;
  const color = selectedIds?.[id]
    ? hoveredId === id
      ? shade(-0.4, selectMat.normal)
      : selectMat.normal
    : hoveredId === id
    ? shade(-0.4, mat.normal)
    : mat.normal;
  const colorText = selectedIds?.[id]
    ? hoveredId === id
      ? shade(-0.4, textSelectMat.normal)
      : textSelectMat.normal
    : hoveredId === id
    ? shade(-0.4, mat.normal)
    : mat.normal;
  const opacity = material.opacity !== undefined ? material.opacity : materialDefaults.opacity!;
  if (material.imageUrl) {
    return (
      <TextureMaterial
        url={state === "Error" ? materialStateImages?.[ERROR_IMG_KEY] ?? material.imageUrl : material.imageUrl}
        color={color}
        material={mat}
        useAlphaTest={useAlphaTest}
        filter={{ mag: MagnificationFilter.Linear, min: MinificationFilter.LinearMipmap }}
      />
    );
  }
  if (isText) {
    return (
      <meshBasicMaterial
        key={`mesh_material_text}`}
        color={colorText}
        side={FrontSide}
        transparent
        {...(opacity < 1 ? { opacity } : materialDefaults)}
      />
    );
  }
  if (isHotSpot) {
    return (
      <meshBasicMaterial
        key="mesh_material_hotspot"
        color={color}
        side={drawBackOnly === true ? BackSide : DoubleSide}
        depthTest={true}
        depthWrite={true}
        transparent={false}
        opacity={1.0}
      />
    );
  }
  return (
    <meshStandardMaterial
      key={`mesh_material_standard_${mat.normal}_${mat.metalness}_${mat.opacity}_${mat.roughness}`}
      color={color}
      roughness={mat.roughness}
      metalness={mat.metalness}
      side={DoubleSide}
      {...(opacity < 1 || disabled
        ? {
            transparent: true,
            depthWrite: false,
            opacity: disabled ? opacity * decreasedOpacity : opacity,
            depthTest: true,
          }
        : materialDefaults)}
    />
  );
}
const materialDefaults: MaterialParameters = { transparent: false, depthWrite: true, depthTest: true, opacity: 1.0 };

function TextureMaterial({
  url,
  color,
  material,
  useAlphaTest = true,
  filter = {
    min: MinificationFilter.LinearMipmap,
    mag: MagnificationFilter.Linear
  },
}: {
  readonly url: string;
  readonly color: string | Color | undefined;
  readonly material: Material;
  readonly useAlphaTest?: boolean;
  readonly filter?: TextureFilter;
}): React.JSX.Element {
  const texture = suspend(urlIsSvg(url) ? loadSvg(url, filter) : loadNormal(url, filter), [url]) as Texture | null;
  useEffect(() => {
    return () => {
      if (texture) {
        texture.dispose();
      }
    };
  }, [texture]);

  return (
    <meshBasicMaterial
      color={color}
      side={DoubleSide}
      alphaTest={useAlphaTest ? 0.8 : undefined}
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
  const maxSize = 4096;
  
  return new Promise((res) => {
    const img = new Image();

    // eslint-disable-next-line consistent-return
    img.onload = ((): void => {
      const canvas = document.createElement("canvas");
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;
      const width = imgW >= imgH ? maxSize : (maxSize * (imgW / imgH));
      const height = imgH >= imgW ? maxSize : (maxSize * (imgH / imgW));

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
    });

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

const acceptMat: Material = { normal: "rgb(0,148,91)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const selectMat: Material = { normal: "rgb(14,82,184)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const textSelectMat: Material = { normal: "rgb(0, 26, 65)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const errorMar: Material = { normal: "#b82f3a", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const warningMat: Material = { normal: "rgb(240, 197, 48)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
