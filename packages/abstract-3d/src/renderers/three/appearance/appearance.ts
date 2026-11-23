import { Color, type Vector4 } from "three";
import type { Material, MaterialType } from "../../../abstract-3d.js";
import { materialTypes } from "../../../abstract-3d.js";
import { shade } from "../../../utils.js";
import type { Item, Target } from "../compile/compile.js";

/** Material classes and per-instance colors of items, by the viewer's state, as the r3f renderer's materials */

export type MaterialState = "Accept" | "Error" | "Warning";

/** The state that decides material classes, so changing it rebuilds the scene */
export type StructureState = {
  readonly activeComponents?: Record<string, MaterialState>;
  /** Relations are active, e.g. to pick one to insert a component on, so only the groups whose material state is Accept can be clicked */
  readonly relationsActive: boolean;
  /** The target of the top-level group dragged, drawn as it is while relations are active, rather than disabled */
  readonly draggedTarget?: number;
};

/**
 * A target's material state, filling its solids, or for an error or warning on a group with symbol images, shown on those instead, framed and badged;
 * and whether it's disabled: faded and not clickable while relations are active
 */
export type TargetState = { readonly materialState?: MaterialState; readonly symbolState?: SymbolState; readonly disabled: boolean };

export type SymbolState = Exclude<MaterialState, "Accept">;

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
  /** A physical finish of its own, its metalness and roughness unless the material has its own */
  readonly type?: MaterialType;
  /** Set without a type; with one, only the material's own */
  readonly metalness?: number;
  /** Set without a type; with one, only the material's own */
  readonly roughness?: number;
  readonly side: "front" | "back" | "double";
  readonly transparent: boolean;
  /** Opaque solids whose material doesn't turn it off cast shadows */
  readonly castShadow: boolean;
  /** Written to depth though transparent, e.g. a relation's slab, so its outline shows only around it */
  readonly depthWrite?: boolean;
  /**
   * See-through but only its nearest surface drawn, by its depth drawn first, so it doesn't show its own insides; not disabled groups, which show the
   * relations in them
   */
  readonly nearestOnly?: boolean;
  /** Drawn after the other transparent classes, e.g. a relation's outline after its slab */
  readonly last?: boolean;
};

/** Bit flags of how a target is highlighted, so only targets whose highlight changed need a repaint */
export const HOVERED = 1;
export const SELECTED = 2;

const disabledOpacity = 0.125;
/** Of an active relation's slab and insertion symbol, the products theme's primary green */
export const hotspotColor = "#188a72";
/** Of the inverted hull around a relation's slab */
const outlineColor = "rgb(0, 0, 0)";
/** Of an active relation's slab, solid while hovered */
const relationOpacity = 0.7;
export const selectColor = "rgb(14,82,184)";
/** How far a selected or accepting group's symbols are tinted toward `selectColor` or the Accept color */
const symbolTint = 0.8;
export const stateMaterials: Record<MaterialState, Material> = {
  Accept: { normal: hotspotColor, metalness: 0.5, roughness: 0.5 },
  Error: { normal: "#ab0e0e", metalness: 0.5, roughness: 0.5 },
  Warning: { normal: "rgb(247, 215, 101)", metalness: 0.5, roughness: 0.5 },
};
const unlit = { lit: false, metalness: 0, roughness: 1, transparent: false, castShadow: false } as const;
/** Of glass without an opacity of its own */
const glassOpacity = 0.25;

export function getTargetStates(targets: ReadonlyArray<Target>, items: ReadonlyArray<Item>, structure: StructureState): ReadonlyArray<TargetState> {
  const hasSymbol = new Uint8Array(targets.length);
  for (const item of items) {
    if (item.role === "image" && item.style === "group") {
      hasSymbol[item.target] = 1;
    }
  }
  return targets.map((target, t) => {
    const state = target.kind === "group" ? structure.activeComponents?.[target.id] : undefined;
    const disabled = target.kind === "group" && structure.relationsActive && state !== "Accept" && t !== structure.draggedTarget;
    return state !== undefined && state !== "Accept" && hasSymbol[t] ? { symbolState: state, disabled } : { materialState: state, disabled };
  });
}

export function getMaterialClass(item: Item, { materialState, disabled }: TargetState): MaterialClass {
  const { material } = item.mesh;
  switch (item.style) {
    case "relation":
      return { ...unlit, side: "double", transparent: true, depthWrite: true };
    case "outline":
      return { ...unlit, side: "back", transparent: true, last: true };
    case "dimension":
      return { ...unlit, side: "front", transparent: (material.opacity ?? 1) < 1 };
    default: {
      // Faded so far that lighting barely shows, so unlit, to need no lit shader compiled when relations turn active
      if (disabled) {
        return { ...unlit, side: item.role === "text" || material.backfaceCulling ? "front" : "double", transparent: true };
      }
      // A material state's color and finish replace the material's
      const mat = materialState ? stateMaterials[materialState] : material;
      // Only a known type, as data may have a type of its own, e.g. a number
      const type = item.role === "solid" && materialTypes.includes(mat.type as MaterialType) ? mat.type : undefined;
      const opacity = getOpacity(material);
      return {
        lit: item.role === "solid" && material.lit !== false,
        ...(type ? { type, metalness: mat.metalness, roughness: mat.roughness } : { metalness: mat.metalness ?? 0, roughness: mat.roughness ?? 1 }),
        side: item.role === "text" || material.backfaceCulling ? "front" : "double",
        transparent: opacity < 1,
        ...(opacity < 1 ? { nearestOnly: true } : {}),
        castShadow: item.role === "solid" && opacity === 1 && material.castShadow !== false,
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

/** The item's linear color and opacity by its target's highlight, written to `out`; hovered colors are darkened, selected groups are boxed instead */
export function getItemColor(item: Item, { materialState, disabled }: TargetState, highlight: number, out: Vector4): Vector4 {
  const { material } = item.mesh;
  const hovered = highlight % SELECTED === HOVERED;
  const selected = highlight >= SELECTED;
  const opacity = getOpacity(material);
  switch (item.style) {
    case "relation":
      return setColor(out, hotspotColor, hovered, hovered ? 1 : relationOpacity);
    case "outline":
      return setColor(out, outlineColor, false, 1);
    case "dimension":
      return setColor(out, selected ? selectColor : material.normal, false, opacity);
    default: {
      // An accepting group's symbols tinted toward the hotspots' green, also while selected, else a selected group's toward its box's blue
      const tint = materialState === "Accept" ? stateMaterials.Accept.normal : selected ? selectColor : undefined;
      if (item.role === "image" && tint) {
        const key = `${tint} ${material.normal}`;
        const tinted = tints.get(key) ?? new Color(material.normal).lerp(new Color(tint), symbolTint).getStyle();
        tints.set(key, tinted);
        return setColor(out, tinted, hovered, opacity);
      }
      const style = materialState && item.role !== "image" ? stateMaterials[materialState].normal : material.normal;
      return item.role === "line"
        ? setColor(out, material.normal, false, 1)
        : setColor(out, style, hovered, item.role === "solid" && disabled ? opacity * disabledOpacity : opacity);
    }
  }
}

/** Glass is mostly see-through unless its material says otherwise */
function getOpacity(material: Material): number {
  return material.opacity ?? (material.type === "glass" ? glassOpacity : 1);
}

const colors = new Map<string, Color>();
/** Symbols' colors tinted toward a highlight's, by the tint and their own color */
const tints = new Map<string, string>();

function setColor(out: Vector4, style: string, hovered: boolean, opacity: number): Vector4 {
  const key = hovered ? `hovered ${style}` : style;
  const color = colors.get(key) ?? new Color(hovered ? (shade(-0.4, style) ?? style) : style);
  colors.set(key, color);
  return out.set(color.r, color.g, color.b, opacity);
}
