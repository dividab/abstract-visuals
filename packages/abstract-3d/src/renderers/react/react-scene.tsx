import React from "react";
import { extend } from "@react-three/fiber";
import {
  Mesh,
  Group,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshBasicMaterial,
  BoxGeometry,
  PlaneGeometry,
  CylinderGeometry,
  ConeGeometry,
  Texture,
  DoubleSide,
  BufferAttribute,
  Shape,
  Path,
  ExtrudeGeometry,
} from "three";
import * as A3d from "../../abstract-3d.js";
import { HotSpotInfo, ReactHotSpots } from "./react-hotspot.js";
import { ReactDimensions } from "./react-dimension.js";
import { ReactGroup } from "./react-group.js";
import { MaterialState } from "./react-material.js";

extend({
  Mesh,
  Group,
  MeshLambertMaterial,
  MeshPhongMaterial,
  MeshBasicMaterial,
  BufferAttribute,
  Shape,
  ExtrudeGeometry,
  Path,
  Texture,
  CylinderGeometry,
  BoxGeometry,
  PlaneGeometry,
  ConeGeometry,
  DoubleSide,
});

export function ReactScene({
  scene,
  selectedId,
  hoveredIdExternal,
  activeHotSpots,
  activeComponents,
  hotSpotTexts,
  showHotSpotTexts,
  showDimensions,
  materialStateImages,
  onClickGroup,
  onContextMenuGroup,
  onClickHotSpot,
  createGroupKey,
  createGroupId,
}: {
  readonly scene: A3d.Scene;
  readonly selectedId: string | undefined;
  readonly hoveredIdExternal: string | undefined;
  readonly activeHotSpots: Record<string, HotSpotInfo> | undefined;
  readonly activeComponents: Record<string, MaterialState> | undefined;
  readonly showHotSpotTexts: boolean;
  readonly showDimensions: boolean;
  readonly hotSpotTexts?: Record<string, string>;
  readonly materialStateImages?: Record<string, string>;
  readonly onClickGroup?: (
    id: string | undefined,
    rootData: Record<string, string>,
    data: Record<string, string>
  ) => void;
  readonly onContextMenuGroup?: (
    id: string,
    rootData: Record<string, string>,
    data: Record<string, string>,
    left: number,
    top: number
  ) => void;
  readonly onClickHotSpot?: (hotSpot: HotSpotInfo) => void;
  readonly createGroupKey?: (g: A3d.Group, idx: number, rootData: Record<string, string>, id: string) => string;
  readonly createGroupId?: (g: A3d.Group) => string;
}): JSX.Element {
  const [hoveredId, setHoveredId] = React.useState<string | undefined>(undefined);
  return (
    <group
      rotation={[scene.rotation.x, scene.rotation.y, scene.rotation.z]}
      position={[-scene.center.x, -scene.center.y, -scene.center.z]}
    >
      {scene.groups.map((g, i) => {
        const id = createGroupId ? createGroupId(g) : "";
        return (
          <ReactGroup
            key={createGroupKey ? createGroupKey(g, 0, g.data, id) : i}
            g={g}
            selectedId={selectedId}
            hotSpotsActive={activeHotSpots !== undefined}
            activeComponents={activeComponents}
            materialStateImages={materialStateImages}
            hoveredId={hoveredId}
            hoveredIdExternal={hoveredIdExternal}
            onClickGroup={onClickGroup}
            onContextMenuGroup={onContextMenuGroup}
            setHoveredId={setHoveredId}
            createGroupKey={createGroupKey}
            id={id}
            rootData={g.data}
          />
        );
      })}
      <group
        rotation={[-scene.rotation.x, -scene.rotation.y, -scene.rotation.z]}
        position={[-scene.center.x, -scene.center.y, -scene.center.z]}
      >
        <group position={[scene.center.x, scene.center.y, scene.center.z]}>
          <ReactDimensions dimensions={scene.dimensions} showDimensions={showDimensions} />
        </group>
      </group>
      <ReactHotSpots
        hotSpots={scene.hotSpots}
        hotSpotZAdjPos={scene.size.z / 2}
        activeHotSpots={activeHotSpots}
        hotSpotTexts={hotSpotTexts}
        hoveredId={hoveredId}
        onClickHotSpot={onClickHotSpot}
        setHoveredId={setHoveredId}
        showHotSpotTexts={showHotSpotTexts}
      />
    </group>
  );
}
