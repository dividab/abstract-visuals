import React, { useEffect } from "react";
import { suspend } from "suspend-react";
import { Color, DoubleSide, MaterialParameters, SRGBColorSpace, Texture, TextureLoader } from "three";
import { Material } from "../../abstract-3d.js";
import { shade } from "../shared.js";

const decreasedOpacity = 0.2;

export type MaterialState = "Accept" | "Error" | "Warning";
export const ERROR_IMG_KEY = "error";

export function ReactMaterial({
  material,
  id = "",
  selectedId,
  hoveredId,
  disabled,
  materialStateImages,
  state,
  isText,
  isHotSpot,
}: {
  readonly material: Material;
  readonly id?: string;
  readonly hoveredId?: string | undefined;
  readonly selectedId?: string | undefined;
  readonly disabled?: boolean;
  readonly materialStateImages?: Record<string, string>;
  readonly state?: MaterialState | undefined;
  readonly isText: boolean;
  readonly isHotSpot?: boolean;
}): React.JSX.Element {
  const mat =
    !state || material.image?.type === "UrlImage"
      ? material
      : state === "Accept"
      ? acceptMat
      : state === "Error"
      ? errorMar
      : warningMat;
  const color =
    selectedId === id
      ? hoveredId === id
        ? shade(-0.4, selectMat.normal)
        : selectMat.normal
      : hoveredId === id
      ? shade(-0.4, mat.normal)
      : mat.normal;
  const colorText =
    selectedId === id
      ? hoveredId === id
        ? shade(-0.4, textSelectMat.normal)
        : textSelectMat.normal
      : hoveredId === id
      ? shade(-0.4, mat.normal)
      : mat.normal;
  const opacity = material.opacity !== undefined ? material.opacity : materialDefaults.opacity!;
  if (material.image?.type === "UrlImage") {
    return (
      <TextureMaterial
        url={state === "Error" ? materialStateImages?.[ERROR_IMG_KEY] ?? material.image.url : material.image.url}
        color={color}
        material={mat}
      />
    );
  }
  if (isText) {
    return (
      <meshBasicMaterial
        color={colorText}
        side={DoubleSide}
        transparent
        {...(opacity < 1 ? { opacity } : materialDefaults)}
      />
    );
  }
  return (
    <meshStandardMaterial
      color={color}
      roughness={mat.roughness}
      metalness={mat.metalness}
      side={DoubleSide}
      {...((opacity < 1 || disabled) && !isHotSpot
        ? { transparent: true, depthWrite: false, opacity: disabled ? opacity * decreasedOpacity : opacity }
        : materialDefaults)}
    />
  );
}

function TextureMaterial({
  url,
  color,
  material,
}: {
  readonly url: string;
  readonly color: string | Color | undefined;
  readonly material: Material;
}): React.JSX.Element {
  const texture = suspend(
    new Promise((res) =>
      textureLoader.load(
        url,
        (data) => {
          data.colorSpace = SRGBColorSpace;
          res(data);
        },
        undefined,
        () => res(null)
      )
    ),
    [url]
  ) as Texture | null;

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
      alphaTest={0.8}
      map={texture}
      {...(material.opacity !== undefined && material.opacity < 1 ? { opacity: material.opacity } : materialDefaults)}
      transparent
    />
  );
}

const textureLoader = new TextureLoader();

const materialDefaults: MaterialParameters = { transparent: false, opacity: 1.0, depthWrite: true, depthTest: true };

const acceptMat: Material = { normal: "rgb(0,148,91)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const selectMat: Material = { normal: "rgb(14,82,184)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const textSelectMat: Material = { normal: "rgb(0, 26, 65)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const errorMar: Material = { normal: "#b82f3a", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const warningMat: Material = { normal: "rgb(240, 197, 48)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
