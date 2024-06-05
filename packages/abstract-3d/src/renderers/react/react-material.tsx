import React from "react";
import { Color, DoubleSide, MaterialParameters, SRGBColorSpace, Texture, TextureLoader } from "three";
import { suspend } from "suspend-react";
import * as A3d from "../../abstract-3d";

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
}: {
  readonly material: A3d.Material;
  readonly id?: string;
  readonly hoveredId?: string | undefined;
  readonly selectedId?: string | undefined;
  readonly disabled?: boolean;
  readonly materialStateImages?: Record<string, string>;
  readonly state?: MaterialState | undefined;
}): JSX.Element {
  const mat =
    !state || material.image.type === "UrlImage"
      ? material
      : state === "Accept"
      ? acceptMaterial
      : state === "Error"
      ? errorMaterial
      : warningMaterial;
  const color = selectedId === id ? mat.selected : hoveredId === id ? mat.hover : mat.normal;

  if (material.image.type === "UrlImage") {
    return (
      <TextureMaterial
        url={state === "Error" ? materialStateImages?.[ERROR_IMG_KEY] ?? material.image.url : material.image.url}
        color={color}
        material={mat}
      />
    );
  }

  switch (mat.type) {
    case "Basic":
      return (
        <meshBasicMaterial
          color={color}
          side={DoubleSide}
          transparent
          {...(mat.opacity < 1 ? { opacity: mat.opacity } : materialDefaults)}
        />
      );
    case "Phong":
      return (
        <meshPhongMaterial
          color={color}
          shininess={mat.shininess * 2}
          side={DoubleSide}
          {...(mat.opacity < 1 || disabled
            ? { transparent: true, opacity: disabled ? mat.opacity * decreasedOpacity : mat.opacity }
            : materialDefaults)}
        />
      );
    // return (
    //   <meshStandardMaterial
    //     color={color}
    //     roughness={0.45}
    //     metalness={0.55}
    //     side={DoubleSide}
    //     {...(mat.opacity < 1 || disabled
    //       ? { transparent: true, opacity: disabled ? mat.opacity * decreasedOpacity : mat.opacity }
    //       : materialDefaults)}
    //   />
    // );
    case "Lambert":
    default:
      return (
        <meshLambertMaterial
          color={color}
          side={DoubleSide}
          {...(mat.opacity < 1 || disabled
            ? { transparent: true, opacity: disabled ? mat.opacity * decreasedOpacity : mat.opacity }
            : materialDefaults)}
        />
      );
  }
}

function TextureMaterial({
  url,
  color,
  material,
}: {
  readonly url: string;
  readonly color: string | Color;
  readonly material: A3d.Material;
}): JSX.Element {
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

  return (
    <meshBasicMaterial
      color={color}
      side={DoubleSide}
      alphaTest={0.8}
      map={texture}
      {...(material.opacity < 1 ? { opacity: material.opacity } : materialDefaults)}
      transparent
    />
  );
}

const textureLoader = new TextureLoader();

const materialDefaults: MaterialParameters = { transparent: false, opacity: 1.0, depthWrite: true, depthTest: true };

const acceptMaterial: A3d.Material = {
  type: "Phong",
  normal: "rgb(0,148,91)",
  hover: "rgb(1,88,55)",
  selected: "rgb(1,88,55)",
  dxf: "0",
  imageType: "",
  image: { type: "NoImage" },
  opacity: 1.0,
  shininess: 50,
};

const errorMaterial: A3d.Material = {
  type: "Phong",
  normal: "#b82f3a",
  hover: "#991c31",
  selected: "#991c31",
  dxf: "0",
  imageType: "",
  image: { type: "NoImage" },
  opacity: 1.0,
  shininess: 50,
};

const warningMaterial: A3d.Material = {
  type: "Phong",
  normal: "rgb(240, 197, 48)",
  hover: "rgb(221, 181, 38)",
  selected: "rgb(182, 147, 20)",
  dxf: "0",
  imageType: "",
  image: { type: "NoImage" },
  opacity: 1.0,
  shininess: 50,
};
