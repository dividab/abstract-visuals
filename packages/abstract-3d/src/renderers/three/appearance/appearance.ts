import { Color, type Vector4 } from "three";
import type { Material } from "../../../abstract-3d.js";
import { shade } from "../../../utils.js";
import type { Item, Target } from "../compile/compile.js";

/** Material classes and per-instance colors of items, by the viewer's state, as the r3f renderer's materials */

export type MaterialState = "Accept" | "Error" | "Warning";
export const ERROR_IMG_KEY = "error";

/** The state that decides material classes, so changing it rebuilds the scene */
export type StructureState = {
  readonly activeComponents?: Record<string, MaterialState>;
  /** Relations are active, e.g. to pick one to insert a component on, so only the groups whose material state is Accept can be clicked */
  readonly relationsActive: boolean;
};

/** A target's material state, and whether it's disabled: faded and not clickable while relations are active */
export type TargetState = { readonly materialState?: MaterialState; readonly disabled: boolean };

/** The state that only changes colors */
export type PaintState = StructureState & {
  readonly selectedIds?: Record<string, boolean>;
  readonly hoveredIds?: ReadonlySet<string>;
  /** The target under the pointer */
  readonly hoveredTarget?: number;
  readonly dimensionsClickable: boolean;
};

/** Items of one material class share a material, and are drawn in one batch */
export type MaterialClass = {
  readonly lit: boolean;
  readonly metalness: number;
  readonly roughness: number;
  readonly side: "front" | "back" | "double";
  readonly transparent: boolean;
};

/** Bit flags of how a target is highlighted, so only targets whose highlight changed need a repaint */
export const HOVERED = 1;
export const SELECTED = 2;

const disabledOpacity = 0.125;
const selectColor = "rgb(14,82,184)";
const textSelectColor = "rgb(0, 26, 65)";
const stateMaterials: Record<MaterialState, Material> = {
  Accept: { normal: "rgb(0,148,91)", metalness: 0.5, roughness: 0.5 },
  Error: { normal: "#b82f3a", metalness: 0.5, roughness: 0.5 },
  Warning: { normal: "rgb(240, 197, 48)", metalness: 0.5, roughness: 0.5 },
};
const unlit = { lit: false, metalness: 0, roughness: 1, transparent: false } as const;

export function getTargetStates(targets: ReadonlyArray<Target>, structure: StructureState): ReadonlyArray<TargetState> {
  return targets.map((target) => {
    const materialState = target.kind === "group" ? structure.activeComponents?.[target.id] : undefined;
    return { materialState, disabled: target.kind === "group" && structure.relationsActive && materialState !== "Accept" };
  });
}

export function getMaterialClass(item: Item, { materialState, disabled }: TargetState): MaterialClass {
  const { material } = item.mesh;
  switch (item.style) {
    case "relation":
      return { ...unlit, side: "double" };
    case "outline":
      return { ...unlit, side: "back" };
    case "dimension":
      return { ...unlit, side: "front", transparent: (material.opacity ?? 1) < 1 };
    default: {
      const mat = materialState ? stateMaterials[materialState] : material;
      return {
        lit: item.role === "solid",
        metalness: mat.metalness ?? 0,
        roughness: mat.roughness ?? 1,
        side: item.role === "text" || material.backfaceCulling ? "front" : "double",
        transparent: (material.opacity ?? 1) < 1 || disabled,
      };
    }
  }
}

export function getHighlight(target: Target, targetIndex: number, state: PaintState): number {
  const hoveredByPointer = state.hoveredTarget === targetIndex;
  switch (target.kind) {
    case "relation":
      return hoveredByPointer ? HOVERED : 0;
    case "dimension":
      return state.dimensionsClickable && !state.relationsActive && target.id !== undefined && (hoveredByPointer || !!state.selectedIds?.[target.id])
        ? SELECTED
        : 0;
    default:
      return (
        (hoveredByPointer || (target.id !== "" && !!state.hoveredIds?.has(target.id)) ? HOVERED : 0) + (state.selectedIds?.[target.id] ? SELECTED : 0)
      );
  }
}

/** The item's linear color and opacity by its target's highlight, written to `out`; hovered colors are darkened */
export function getItemColor(item: Item, { materialState, disabled }: TargetState, highlight: number, out: Vector4): Vector4 {
  const { material } = item.mesh;
  const hovered = highlight % SELECTED === HOVERED;
  const selected = highlight >= SELECTED;
  const opacity = material.opacity ?? 1;
  switch (item.style) {
    case "relation":
    case "outline":
      return setColor(out, material.normal, hovered, 1);
    case "dimension":
      return setColor(out, selected ? selectColor : material.normal, false, opacity);
    default: {
      const style = selected
        ? item.role === "text"
          ? textSelectColor
          : selectColor
        : materialState && item.role !== "image"
          ? stateMaterials[materialState].normal
          : material.normal;
      return item.role === "line"
        ? setColor(out, material.normal, false, 1)
        : setColor(out, style, hovered, item.role === "solid" && disabled ? opacity * disabledOpacity : opacity);
    }
  }
}

const colors = new Map<string, Color>();

function setColor(out: Vector4, style: string, hovered: boolean, opacity: number): Vector4 {
  const key = hovered ? `hovered ${style}` : style;
  const color = colors.get(key) ?? new Color(hovered ? (shade(-0.4, style) ?? style) : style);
  colors.set(key, color);
  return out.set(color.r, color.g, color.b, opacity);
}
