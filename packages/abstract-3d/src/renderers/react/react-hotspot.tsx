import React from "react";
import { Html } from "@react-three/drei";
import { HotSpot, vec3Zero } from "../../abstract-3d.js";
import { ReactMesh } from "./react-mesh.js";
import { ReactMaterial } from "./react-material.js";
import { ThreeEvent } from "@react-three/fiber";

export interface HotSpotInfo {
  readonly replaceId: string;
  readonly replaceFromId: string;
  readonly replaceOutlet: string;
  readonly replaceToId: string;
  readonly replaceInlet: string;
}

export const ReactHotSpots = React.memo(
  ({
    hotSpots,
    showHotSpotTexts,
    hotSpotTexts,
    hotSpotZAdjPos,
    activeHotSpots,
    hoveredId,
    onClickHotSpot,
    setHoveredId,
  }: {
    readonly hotSpots?: ReadonlyArray<HotSpot>;
    readonly showHotSpotTexts: boolean;
    readonly hotSpotZAdjPos: number;
    readonly hotSpotTexts?: Record<string, string>;
    readonly activeHotSpots: Record<string, HotSpotInfo> | undefined;
    readonly hoveredId: string | undefined;
    readonly onClickHotSpot?: (hotSpot: HotSpotInfo, e: ThreeEvent<MouseEvent>) => void;
    readonly setHoveredId: (id: string | undefined) => void;
  }): React.JSX.Element => {
    return (
      <>
        {hotSpots?.map((h) => (
          <ReactHotSpot
            key={h.id}
            h={h}
            hotSpotZAdjPos={hotSpotZAdjPos}
            activeHotSpots={activeHotSpots}
            hotSpotTexts={hotSpotTexts}
            hoveredId={hoveredId}
            onClickHotSpot={onClickHotSpot}
            setHoveredId={setHoveredId}
            showHotSpotTexts={showHotSpotTexts}
          />
        ))}
      </>
    );
  }
);

export function ReactHotSpot({
  h,
  hotSpotZAdjPos,
  showHotSpotTexts,
  hotSpotTexts,
  activeHotSpots,
  hoveredId,
  onClickHotSpot,
  setHoveredId,
}: {
  readonly h: HotSpot;
  readonly hotSpotZAdjPos: number;
  readonly showHotSpotTexts: boolean;
  readonly hotSpotTexts?: Record<string, string>;
  readonly activeHotSpots: Record<string, HotSpotInfo> | undefined;
  readonly hoveredId: string | undefined;
  readonly onClickHotSpot?: (hotSpot: HotSpotInfo, e: ThreeEvent<MouseEvent>) => void;
  readonly setHoveredId: (id: string | undefined) => void;
}): React.JSX.Element {
  const hotSpot = activeHotSpots ? activeHotSpots[h.id] : undefined;
  const hsPos = h.mesh.geometry.type === "Box" ? h.mesh.geometry.pos : vec3Zero;
  const text = hotSpotTexts?.[h.id];
  return (
    <>
      <group
        visible={hotSpot !== undefined}
        {...(hotSpot && {
          onClick: (e) => {
            if (onClickHotSpot) {
              e.stopPropagation();
              onClickHotSpot(hotSpot, e);
            }
          },
          onPointerOver: (e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            setHoveredId(h.id);
          },
          onPointerOut: (_e) => {
            document.body.style.cursor = "auto";
            setHoveredId(undefined);
          },
          onContextMenu: (e) => {
            e.stopPropagation();
          },
        })}
      >
        <ReactMesh mesh={h.mesh}>
          <ReactMaterial id={h.id} isText={false} isHotSpot={true} material={h.mesh.material} hoveredId={hoveredId} />
        </ReactMesh>
      </group>
      {hotSpotTexts && text && (
        <Html position={[hsPos.x, hsPos.y, hotSpotZAdjPos]} center>
          <div className={`air-states-container ${showHotSpotTexts ? "" : "air-states-container-hidden"}`}>
            <span className="air-states-text">{text}</span>
          </div>
        </Html>
      )}
    </>
  );
}
