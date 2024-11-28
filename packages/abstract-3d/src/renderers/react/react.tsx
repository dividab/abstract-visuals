import React, { memo } from "react";
import { Canvas, Props } from "@react-three/fiber";
import { OrbitControlsProps } from "@react-three/drei";
import { ReactScene } from "./react-scene.js";
import * as A3d from "../../abstract-3d.js";
import { ReactCamera, ControlsHelper, Camera } from "./react-camera.js";
import { HotSpotInfo } from "./react-hotspot.js";
import { MaterialState } from "./react-material.js";

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
        <ambientLight intensity={3.5} />
        <directionalLight
          position={[
            -(scene.center_deprecated?.x ?? 0),
            -(scene.center_deprecated?.y ?? 0) + 1.5 * scene.size_deprecated.y,
            -(scene.center_deprecated?.z ?? 0),
          ]}
          intensity={0.4}
        />
        <directionalLight
          position={[
            -(scene.center_deprecated?.x ?? 0),
            -(scene.center_deprecated?.y ?? 0),
            -(scene.center_deprecated?.z ?? 0) + 1.5 * scene.size_deprecated.z,
          ]}
          intensity={0.4}
        />
        <directionalLight
          position={[
            -(scene.center_deprecated?.x ?? 0),
            -(scene.center_deprecated?.y ?? 0),
            -(scene.center_deprecated?.z ?? 0) - 1.5 * scene.size_deprecated.z,
          ]}
          intensity={0.4}
        />
        <directionalLight
          position={[
            -(scene.center_deprecated?.x ?? 0) - 1.5 * scene.size_deprecated.x,
            -(scene.center_deprecated?.y ?? 0),
            -(scene.center_deprecated?.z ?? 0),
          ]}
          intensity={0.4}
        />
        <directionalLight
          position={[
            -(scene.center_deprecated?.x ?? 0) + 1.5 * scene.size_deprecated.x,
            -(scene.center_deprecated?.y ?? 0),
            -(scene.center_deprecated?.z ?? 0),
          ]}
          intensity={0.4}
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
