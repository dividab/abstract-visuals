import React from "react";
import { Html } from "@react-three/drei";
import { Box, HotSpot, vec3Scale, vec3Zero } from "../../abstract-3d.js";
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
    onClickHotSpot,
  }: {
    readonly hotSpots?: ReadonlyArray<HotSpot>;
    readonly showHotSpotTexts: boolean;
    readonly hotSpotZAdjPos: number;
    readonly hotSpotTexts?: Record<string, string>;
    readonly activeHotSpots: Record<string, HotSpotInfo> | undefined;
    readonly onClickHotSpot?: (hotSpot: HotSpotInfo, e: ThreeEvent<MouseEvent>) => void;
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
            onClickHotSpot={onClickHotSpot}
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
  onClickHotSpot,
}: {
  readonly h: HotSpot;
  readonly hotSpotZAdjPos: number;
  readonly showHotSpotTexts: boolean;
  readonly hotSpotTexts?: Record<string, string>;
  readonly activeHotSpots: Record<string, HotSpotInfo> | undefined;
  readonly onClickHotSpot?: (hotSpot: HotSpotInfo, e: ThreeEvent<MouseEvent>) => void;
}): React.JSX.Element {
  const [hovered, setHovered] = React.useState<boolean>(false);
  const hotSpot = activeHotSpots ? activeHotSpots[h.id] : undefined;
  const hsPos = h.mesh.geometry.type === "Box" ? h.mesh.geometry.pos : vec3Zero;
  const text = hotSpotTexts?.[h.id];
  const geo = h.mesh.geometry as Box;
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
            setHovered(true);
          },
          onPointerOut: (_e) => {
            document.body.style.cursor = "auto";
            setHovered(false);
          },
          onContextMenu: (e) => {
            e.stopPropagation();
          },
        })}
      >
        <ReactMesh mesh={h.mesh}>
          <ReactMaterial isText={false} isHotSpot={true} material={h.mesh.material} hovered={hovered} />
        </ReactMesh>
        <ReactMesh mesh={{ ...h.mesh, geometry: { ...geo, size: vec3Scale(geo.size, 1.0125) } }}>
          <ReactMaterial
            isText={false}
            isHotSpot={true}
            drawBackOnly={true}
            material={{ normal: "rgb(0, 0, 0)", opacity: 1.0 }}
            hovered={hovered}
          />
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
