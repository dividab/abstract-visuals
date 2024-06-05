import React, { memo } from "react";
import { Canvas, Props } from "@react-three/fiber";
import { OrbitControlsProps } from "@react-three/drei";
import { ReactScene } from "./react-scene";
import * as A3d from "../../abstract-3d";
import { ReactCamera, ControlsHelper, Camera } from "./react-camera";
import { HotSpotInfo } from "./react-hotspot";
import { MaterialState } from "./react-material";

export const toReact = memo(
  ({
    scene,
    selectedId,
    activeHotSpots,
    activeComponents,
    hoveredIdExternal,
    hotSpotTexts,
    showHotSpotTexts = false,
    showDimensions = true,
    useAnimations = false,
    camera = { type: "Perspective" },
    view = "front",
    controlsHelper,
    canvasProps,
    orbitContolsProps,
    materialStateImages,
    onClickGroup,
    onContextMenuGroup,
    onClickHotSpot,
    createGroupKey,
    createGroupId,
  }: {
    readonly scene: A3d.Scene;
    readonly selectedId?: string | undefined;
    readonly activeHotSpots?: Record<string, HotSpotInfo> | undefined;
    readonly activeComponents?: Record<string, MaterialState> | undefined;
    readonly hoveredIdExternal?: string | undefined;
    readonly showHotSpotTexts?: boolean;
    readonly showDimensions?: boolean;
    readonly hotSpotTexts?: Record<string, string>;
    readonly useAnimations?: boolean;
    readonly camera?: Camera;
    readonly view?: A3d.View;
    readonly controlsHelper?: ControlsHelper;
    readonly canvasProps?: Omit<Props & React.RefAttributes<HTMLCanvasElement>, "children">;
    readonly orbitContolsProps?: OrbitControlsProps & React.RefAttributes<unknown>;
    readonly materialStateImages?: Record<string, string>;
    readonly onClickGroup?: (
      id: string | undefined,
      rootData: Record<string, string> | undefined,
      data: Record<string, string> | undefined
    ) => void;
    readonly onContextMenuGroup?: (
      id: string,
      rootData: Record<string, string> | undefined,
      data: Record<string, string> | undefined,
      left: number,
      top: number
    ) => void;
    readonly onClickHotSpot?: (hotSpot: HotSpotInfo) => void;
    readonly createGroupKey?: (
      g: A3d.Group,
      idx: number,
      rootData: Record<string, string> | undefined,
      id: string
    ) => string;
    readonly createGroupId?: (g: A3d.Group) => string;
  }): JSX.Element => {
    return (
      <Canvas dpr={[1, window.devicePixelRatio]} frameloop="demand" {...canvasProps}>
        {/* <Stats showPanel={0} className="stats" /> */}
        <ReactCamera
          scene={scene}
          useAnimations={useAnimations}
          camera={camera}
          view={view}
          controlsHelper={controlsHelper}
          orbitContolsProps={orbitContolsProps}
        />
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[
            -scene.center.x + 0.7 * scene.size.x,
            -scene.center.y + 1.4 * scene.size.y,
            -scene.center.z + 3 * scene.size.z,
          ]}
          intensity={3.3}
        />
        <directionalLight
          position={[
            -scene.center.x - 0.7 * scene.size.x,
            -scene.center.y - 1.1 * scene.size.y,
            -scene.center.z - 3 * scene.size.z,
          ]}
          intensity={3.3}
        />
        <React.Suspense fallback={<></>}>
          <ReactScene
            scene={scene}
            selectedId={selectedId}
            activeHotSpots={activeHotSpots}
            activeComponents={activeComponents}
            showDimensions={showDimensions}
            showHotSpotTexts={showHotSpotTexts}
            hoveredIdExternal={hoveredIdExternal}
            hotSpotTexts={hotSpotTexts}
            materialStateImages={materialStateImages}
            onClickGroup={onClickGroup}
            onContextMenuGroup={onContextMenuGroup}
            onClickHotSpot={onClickHotSpot}
            createGroupKey={createGroupKey}
            createGroupId={createGroupId}
          />
        </React.Suspense>
      </Canvas>
    );
  }
);
