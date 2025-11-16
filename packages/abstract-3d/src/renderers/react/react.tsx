import React, { memo } from "react";
import { Canvas, type CanvasProps, type ThreeEvent } from "@react-three/fiber";
import { type OrbitControlsProps } from "@react-three/drei";
import { ReactPopover, ReactScene } from "./react-scene.js";
import { Scene, View, Group } from "../../abstract-3d.js";
import { ReactCamera, ControlsHelper, Camera } from "./react-camera.js";
import { HotSpotInfo } from "./react-hotspot.js";
import { MaterialState } from "./react-material.js";

type ReactProps = {
  readonly scene: Scene | undefined; // undefined to allow for simple early loadign the js when lazy loading the React3Js renderer
  readonly selectedIds: Record<string, boolean> | undefined;
  readonly activeHotSpots?: Record<string, HotSpotInfo> | undefined;
  readonly activeComponents?: Record<string, MaterialState> | undefined;
  readonly hoveredIdExternal?: string | undefined;
  readonly showHotSpotTexts?: boolean;
  readonly showDimensions?: boolean;
  readonly hotSpotTexts?: Record<string, string>;
  readonly popovers?: ReadonlyArray<ReactPopover>;
  readonly useAnimations?: boolean;
  readonly camera?: Camera;
  readonly view?: View;
  readonly controlsHelper?: ControlsHelper;
  readonly canvasProps?: Omit<CanvasProps & React.RefAttributes<HTMLCanvasElement>, "children">;
  readonly orbitContolsProps?: OrbitControlsProps & React.RefAttributes<unknown>;
  readonly materialStateImages?: Record<string, string>;
  readonly sceneFallback: React.JSX.Element;
  readonly onClickGroup?: (
    id: string | undefined,
    rootData: Record<string, string> | undefined,
    data: Record<string, string> | undefined,
    e: ThreeEvent<MouseEvent>
  ) => void;
  readonly onHoverGroup?: (
    id: string | undefined,
    rootData: Record<string, string> | undefined,
    data: Record<string, string> | undefined,
    e: ThreeEvent<MouseEvent>
  ) => void;
  readonly onContextMenuGroup?: (
    id: string,
    rootData: Record<string, string> | undefined,
    data: Record<string, string> | undefined,
    left: number,
    top: number,
    e: ThreeEvent<MouseEvent>
  ) => void;
  readonly onClickHotSpot?: (hotSpot: HotSpotInfo, e: ThreeEvent<MouseEvent>) => void;
  readonly createGroupKey?: (g: Group, idx: number, rootData: Record<string, string> | undefined, id: string) => string;
  readonly createGroupId?: (g: Group) => string;
};

export const render = memo(
  ({
    scene,
    selectedIds,
    activeHotSpots,
    activeComponents,
    hoveredIdExternal,
    hotSpotTexts,
    popovers: reactPopovers,
    showHotSpotTexts = false,
    showDimensions = true,
    useAnimations = false,
    camera = { type: "Perspective" },
    view = "front",
    controlsHelper,
    canvasProps,
    orbitContolsProps,
    materialStateImages,
    sceneFallback,
    onClickGroup,
    onHoverGroup,
    onContextMenuGroup,
    onClickHotSpot,
    createGroupKey,
    createGroupId,
  }: ReactProps): React.JSX.Element => {
    return scene ? (
      <Canvas dpr={[1, window.devicePixelRatio]} frameloop="demand" {...canvasProps}>
        {
          <>
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
              {
                <ReactScene
                  scene={scene}
                  selectedIds={selectedIds}
                  activeHotSpots={activeHotSpots}
                  activeComponents={activeComponents}
                  showDimensions={showDimensions}
                  showHotSpotTexts={showHotSpotTexts}
                  hoveredIdExternal={hoveredIdExternal}
                  hotSpotTexts={hotSpotTexts}
                  reactPopovers={reactPopovers}
                  materialStateImages={materialStateImages}
                  onClickGroup={onClickGroup}
                  onHoverGroup={onHoverGroup}
                  onContextMenuGroup={onContextMenuGroup}
                  onClickHotSpot={onClickHotSpot}
                  createGroupKey={createGroupKey}
                  createGroupId={createGroupId}
                />
              }
            </React.Suspense>
          </>
        }
      </Canvas>
    ) : (
      sceneFallback ?? <></>
    );
  }
);
