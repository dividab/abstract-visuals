import React from "react";
import { Scene, Group } from "../../abstract-3d.js";
import { HotSpotInfo, ReactHotSpots } from "./react-hotspot.js";
import { ReactDimensions } from "./react-dimension.js";
import { ReactGroup } from "./react-group.js";
import { MaterialState } from "./react-material.js";
import { Html } from "@react-three/drei";
import { ThreeEvent } from "@react-three/fiber";
import { ReactPopover } from "./react-types.js";

export type SceneMouseEvent = ThreeEvent<MouseEvent>;

export function ReactScene({
  scene,
  selectedIds,
  hoveredIdExternal,
  activeHotSpots,
  activeComponents,
  hotSpotTexts,
  showHotSpotTexts,
  showDimensions,
  useAlphaTest,
  materialStateImages,
  reactPopovers,
  onClickGroup,
  onHoverGroup,
  onContextMenuGroup,
  getTooltips,
  onClickHotSpot,
  createGroupKey,
  createGroupId,
}: {
  readonly scene: Scene;
  readonly selectedIds: Record<string, boolean> | undefined;
  readonly hoveredIdExternal: string | undefined;
  readonly activeHotSpots: Record<string, HotSpotInfo> | undefined;
  readonly activeComponents: Record<string, MaterialState> | undefined;
  readonly showHotSpotTexts: boolean;
  readonly showDimensions: boolean;
  readonly useAlphaTest?: boolean;
  readonly hotSpotTexts?: Record<string, string>;
  readonly materialStateImages?: Record<string, string>;
  readonly reactPopovers?: ReadonlyArray<ReactPopover>;
  readonly onClickGroup?: (
    id: string | undefined,
    rootData: Record<string, string> | undefined,
    data: Record<string, string> | undefined,
    e: SceneMouseEvent
  ) => void;
  readonly onHoverGroup?: (
    id: string | undefined,
    rootData: Record<string, string> | undefined,
    data: Record<string, string> | undefined,
    e: SceneMouseEvent
  ) => void;
  readonly onContextMenuGroup?: (
    id: string,
    rootData: Record<string, string> | undefined,
    data: Record<string, string> | undefined,
    left: number,
    top: number,
    e: SceneMouseEvent
  ) => void;
  readonly getTooltips?: (id: string) => ReadonlyArray<ReactPopover>;
  readonly onClickHotSpot?: (hotSpot: HotSpotInfo, e: SceneMouseEvent) => void;
  readonly createGroupKey?: (g: Group, idx: number, rootData: Record<string, string> | undefined, id: string) => string;
  readonly createGroupId?: (g: Group) => string;
}): React.JSX.Element {
  return (
    <group
      rotation={[
        scene.rotation_deprecated?.x ?? 0,
        scene.rotation_deprecated?.y ?? 0,
        scene.rotation_deprecated?.z ?? 0,
      ]}
      position={[
        -(scene.center_deprecated?.x ?? 0),
        -(scene.center_deprecated?.y ?? 0),
        -(scene.center_deprecated?.z ?? 0),
      ]}
    >
      {scene.groups.map((g, i) => {
        const id = createGroupId ? createGroupId(g) : "";
        return (
          <ReactGroup
            key={createGroupKey ? createGroupKey(g, 0, g.data, id) : i}
            g={g}
            selectedIds={selectedIds}
            hotSpotsActive={activeHotSpots !== undefined}
            activeComponents={activeComponents}
            materialStateImages={materialStateImages}
            hoveredIdExternal={hoveredIdExternal}
            onClickGroup={onClickGroup}
            onHoverGroup={onHoverGroup}
            onContextMenuGroup={onContextMenuGroup}
            getTooltips={getTooltips}
            createGroupKey={createGroupKey}
            id={id}
            useAlphaTest={useAlphaTest}
            rootData={g.data}
          />
        );
      })}
      <ReactDimensions
        dimensions={scene.dimensions_deprecated}
        showDimensions={showDimensions}
        sceneRotation={scene.rotation_deprecated}
        sceneCenter={scene.center_deprecated}
      />
      <ReactHotSpots
        hotSpots={scene.hotSpots_deprecated}
        hotSpotZAdjPos={scene.size_deprecated.z / 2}
        activeHotSpots={activeHotSpots}
        hotSpotTexts={hotSpotTexts}
        onClickHotSpot={onClickHotSpot}
        showHotSpotTexts={showHotSpotTexts}
      />
      {reactPopovers?.map((p) => (
        <Html key={p.id} position={[p.pos.x, p.pos.y, p.pos.z]} center pointerEvents="none">
          {p.content}
        </Html>
      ))}
    </group>
  );
}
