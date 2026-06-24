import React from "react";
import { BackSide, DoubleSide, FrontSide, type MaterialParameters } from "three";
import { Material } from "../../abstract-3d.js";
import { shade } from "../../utils.js";

const decreasedOpacity = 0.125;

export type MaterialState = "Accept" | "Error" | "Warning";
export const ERROR_IMG_KEY = "error";

export function ReactMaterial({
  material,
  id = "",
  selectedIds,
  hoveredId,
  disabled,
  materialState,
  isText,
  isHotSpot,
  drawBackOnly,
}: {
  readonly material: Material;
  readonly id?: string;
  readonly hoveredId?: string | undefined;
  readonly selectedIds?: Record<string, boolean> | undefined;
  readonly disabled?: boolean;
  readonly materialState?: MaterialState | undefined;
  readonly isText: boolean;
  readonly isHotSpot?: boolean;
  readonly drawBackOnly?: boolean;
}): React.JSX.Element {
  const mat = !materialState
    ? material
    : materialState === "Accept"
    ? acceptMat
    : materialState === "Error"
    ? errorMar
    : warningMat;
  const color = getColor(selectedIds, id, hoveredId, mat);
  const colorText = selectedIds?.[id]
    ? hoveredId === id
      ? shade(-0.4, textSelectMat.normal)
      : textSelectMat.normal
    : hoveredId === id
    ? shade(-0.4, mat.normal)
    : mat.normal;
  const opacity = material.opacity !== undefined ? material.opacity : materialDefaults.opacity!;
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

export const materialDefaults: MaterialParameters = {
  transparent: false,
  depthWrite: true,
  depthTest: true,
  opacity: 1.0,
};

const acceptMat: Material = { normal: "rgb(0,148,91)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const selectMat: Material = { normal: "rgb(14,82,184)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const textSelectMat: Material = { normal: "rgb(0, 26, 65)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const errorMar: Material = { normal: "#b82f3a", opacity: 1.0, metalness: 0.5, roughness: 0.5 };
const warningMat: Material = { normal: "rgb(240, 197, 48)", opacity: 1.0, metalness: 0.5, roughness: 0.5 };

export function getColor(
  selectedIds: Record<string, boolean> | undefined,
  id: string | undefined,
  hoveredId: string | undefined,
  mat: Material
): string | undefined {
  return selectedIds?.[id ?? ""]
    ? hoveredId === id
      ? shade(-0.4, selectMat.normal)
      : selectMat.normal
    : hoveredId === id
    ? shade(-0.4, mat.normal)
    : mat.normal;
}
