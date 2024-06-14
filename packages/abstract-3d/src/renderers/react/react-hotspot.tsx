import React from "react";
// import { Html } from "@react-three/drei/web/Html";
import { Html } from "@react-three/drei";
import * as A3d from "../../abstract-3d";
import { ReactMesh } from "./react-mesh";
import { ReactMaterial } from "./react-material";

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
    readonly hotSpots?: ReadonlyArray<A3d.HotSpot>;
    readonly showHotSpotTexts: boolean;
    readonly hotSpotZAdjPos: number;
    readonly hotSpotTexts?: Record<string, string>;
    readonly activeHotSpots: Record<string, HotSpotInfo> | undefined;
    readonly hoveredId: string | undefined;
    readonly onClickHotSpot?: (hotSpot: HotSpotInfo) => void;
    readonly setHoveredId: (id: string | undefined) => void;
  }): JSX.Element => {
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
  readonly h: A3d.HotSpot;
  readonly hotSpotZAdjPos: number;
  readonly showHotSpotTexts: boolean;
  readonly hotSpotTexts?: Record<string, string>;
  readonly activeHotSpots: Record<string, HotSpotInfo> | undefined;
  readonly hoveredId: string | undefined;
  readonly onClickHotSpot?: (hotSpot: HotSpotInfo) => void;
  readonly setHoveredId: (id: string | undefined) => void;
}): JSX.Element {
  const hotSpot = activeHotSpots ? activeHotSpots[h.id] : undefined;
  const hsPos = h.mesh.geometry.type === "Box" ? h.mesh.geometry.pos : A3d.vec3Zero;
  const text = hotSpotTexts?.[h.id];
  return (
    <>
      <group
        visible={hotSpot !== undefined}
        {...(hotSpot && {
          onClick: (e) => {
            if (onClickHotSpot) {
              e.stopPropagation();
              onClickHotSpot(hotSpot);
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
          <ReactMaterial id={h.id} material={h.mesh.material} hoveredId={hoveredId} />
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
