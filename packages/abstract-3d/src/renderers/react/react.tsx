import { Html, type OrbitControlsProps } from "@react-three/drei";
import { Canvas, type CanvasProps, type ThreeEvent } from "@react-three/fiber";
import { EffectComposer, N8AO } from "@react-three/postprocessing";
import React, { memo, useMemo } from "react";
import type { Scene, View, Group, Relation } from "../../abstract-3d.js";
import type { ControlsHelper, Camera, BufferZones } from "./react-camera.js";
import { ReactCamera } from "./react-camera.js";
import type { MaterialState } from "./react-material.js";
import { ReactScene } from "./react-scene.js";
import type { ReactPopover } from "./react-types.js";

type ReactProps = {
  readonly scene: Scene | undefined; // undefined to allow for simple early loadign the js when lazy loading the React3Js renderer
  readonly selectedIds: Record<string, boolean> | undefined;
  /**
   * The ids of the relations whose shape is drawn to be clicked, e.g. where a component can be inserted. While defined, even when empty, only the
   * groups whose material state is Accept can be clicked
   */
  readonly activeRelations?: ReadonlyArray<string> | undefined;
  readonly activeComponents?: Record<string, MaterialState> | undefined;
  readonly hoveredIdsExternal?: ReadonlyArray<string> | undefined;
  readonly showDimensions?: boolean;
  readonly popovers?: ReadonlyArray<ReactPopover>;
  readonly useAnimations?: boolean;
  readonly camera?: Camera;
  readonly view?: View;
  readonly useAlphaTest?: boolean;
  readonly controlsHelper?: ControlsHelper;
  readonly canvasProps?: Omit<CanvasProps & React.RefAttributes<HTMLCanvasElement>, "children">;
  readonly orbitContolsProps?: OrbitControlsProps & React.RefAttributes<unknown>;
  readonly materialStateImages?: Record<string, string>;
  readonly sceneFallback?: React.JSX.Element;
  /**
   * The scene's lights, rendered in the canvas instead of the default ambient and directional lights, e.g. an environment map for reflections and a
   * key light. A constant element, as a new one each render re-renders the whole scene
   */
  readonly lights?: React.JSX.Element;
  readonly useOldMode?: boolean;
  readonly bufferZones?: BufferZones;
  readonly fitPadding?: number;
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
  readonly getTooltips?: (id: string) => ReadonlyArray<ReactPopover>;
  readonly onClickRelation?: (relation: Relation, e: ThreeEvent<MouseEvent>) => void;
  readonly createGroupKey?: (g: Group, idx: number, rootData: Record<string, string> | undefined, id: string) => string;
  readonly createGroupId?: (g: Group) => string;
};

export const render = memo(
  ({
    scene,
    selectedIds,
    useOldMode,
    activeRelations,
    activeComponents,
    hoveredIdsExternal,
    popovers: reactPopovers,
    showDimensions = true,
    useAnimations = false,
    camera = { type: "Perspective" },
    view = "front",
    controlsHelper,
    canvasProps,
    orbitContolsProps,
    materialStateImages,
    sceneFallback,
    lights,
    useAlphaTest = true,
    onClickGroup,
    onHoverGroup,
    onContextMenuGroup,
    getTooltips,
    onClickRelation,
    createGroupKey,
    createGroupId,
    bufferZones,
    fitPadding,
  }: ReactProps): React.JSX.Element => {
    const intensity = useOldMode ? 2 : 0.4;
    const suspenseFallback = useMemo(() => <Html center>{sceneFallback ?? <></>}</Html>, [sceneFallback]);
    return scene ? (
      <Canvas dpr={[1, window.devicePixelRatio]} frameloop="demand" {...canvasProps}>
        <React.Suspense fallback={suspenseFallback}>
          <ReactCamera
            bufferZones={bufferZones}
            fitPadding={fitPadding}
            scene={scene}
            useAnimations={useAnimations}
            camera={camera}
            view={view}
            controlsHelper={controlsHelper}
            orbitContolsProps={orbitContolsProps}
          />
          {lights ?? (
            <>
              <ambientLight intensity={3.5} />
              <directionalLight
                position={[
                  -(scene.center_deprecated?.x ?? 0) - 1.5 * scene.size_deprecated.x,
                  -(scene.center_deprecated?.y ?? 0) + 1.5 * scene.size_deprecated.y,
                  -(scene.center_deprecated?.z ?? 0),
                ]}
                intensity={intensity}
              />
              <directionalLight
                position={[
                  -(scene.center_deprecated?.x ?? 0),
                  -(scene.center_deprecated?.y ?? 0) + 1 * scene.size_deprecated.y,
                  -(scene.center_deprecated?.z ?? 0) + 1.5 * scene.size_deprecated.z,
                ]}
                intensity={intensity}
              />
              <directionalLight
                position={[
                  -(scene.center_deprecated?.x ?? 0) + 2 * scene.size_deprecated.x,
                  -(scene.center_deprecated?.y ?? 0),
                  -(scene.center_deprecated?.z ?? 0) + 1.5 * scene.size_deprecated.z,
                ]}
                intensity={intensity}
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
            </>
          )}

          <ReactScene
            scene={scene}
            selectedIds={selectedIds}
            activeRelations={activeRelations}
            activeComponents={activeComponents}
            showDimensions={showDimensions}
            hoveredIdsExternal={hoveredIdsExternal}
            reactPopovers={reactPopovers}
            materialStateImages={materialStateImages}
            onClickGroup={onClickGroup}
            onHoverGroup={onHoverGroup}
            onContextMenuGroup={onContextMenuGroup}
            getTooltips={getTooltips}
            onClickRelation={onClickRelation}
            createGroupKey={createGroupKey}
            createGroupId={createGroupId}
            useAlphaTest={useAlphaTest}
          />
          {!useOldMode && (
            <EffectComposer multisampling={8}>
              <N8AO aoRadius={40} denoiseSamples={4} distanceFalloff={0.2} intensity={2} screenSpaceRadius halfRes />
            </EffectComposer>
          )}
        </React.Suspense>
      </Canvas>
    ) : (
      (sceneFallback ?? <></>)
    );
  }
);
