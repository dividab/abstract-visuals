import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Group, Scene } from "../../abstract-3d.js";
import type { ControlsHelper, MountedOverlay, Popover, Viewer as ThreeViewer, ViewerOptions } from "../three/index.js";
import { createViewer, disposeViewer, updateViewer } from "../three/index.js";

/**
 * The three.js viewer as a React component: it creates and disposes the viewer, passes each group of props when they change, and portals popovers,
 * tooltips and the fallback. The viewer's overlays carry ids, and their content is looked up in this render's props, so new content doesn't loop back
 * through the viewer
 */

export type ReactPopover = Popover<React.ReactNode>;

export type ViewerProps = Omit<ViewerOptions<React.ReactNode>, "hoveredIds" | "onOverlays" | "onLoad" | "gizmo"> & {
  readonly scene: Scene | undefined;
  readonly hoveredIdsExternal?: ReadonlyArray<string>;
  /** A viewcube or axes gizmo */
  readonly controlsHelper?: ControlsHelper;
  /** Shown while loading, and while there's no scene */
  readonly sceneFallback?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
};

export function Viewer(props: ViewerProps): React.JSX.Element {
  const { scene, createGroupId, useAlphaTest, selectedIds, hoveredIdsExternal, onClickGroup, view, bufferZones, fitPadding, controls } = props;
  const { lights, environmentIntensity, groundShadow, shadows, quality, showDimensions, popovers, getTooltips } = props;
  const { onHoverGroup, onContextMenuGroup, onClickRelation, onPointerMissed, sceneFallback, className, style } = props;
  // Equal by value, so inline objects don't refit the camera, recreate the gizmo or rebuild the scene
  const camera = useStableValue(props.camera);
  const gizmo = useStableValue(props.controlsHelper);
  const activeComponents = useStableValue(props.activeComponents);
  const activeRelations = useStableValue(props.activeRelations);
  const materialStateImages = useStableValue(props.materialStateImages);
  const container = useRef<HTMLDivElement>(null);
  const viewer = useRef<ThreeViewer<string> | undefined>(undefined);
  const [overlays, setOverlays] = useState<ReadonlyArray<MountedOverlay<string>>>([]);
  const [loaded, setLoaded] = useState(false);

  useLayoutEffect(() => {
    viewer.current = createViewer(container.current!, { onOverlays: setOverlays, onLoad: () => setLoaded(true) });
    return () => disposeViewer(viewer.current!);
  }, []);

  // The latest createGroupId through a stable function, so an inline one doesn't rebuild the scene each render, as 3.x didn't; a new scene does
  const latestGroupId = useRef(createGroupId);
  useLayoutEffect(() => {
    latestGroupId.current = createGroupId;
  });
  const [stableGroupId] = useState(
    () =>
      (g: Group): string =>
        latestGroupId.current?.(g) ?? ""
  );
  useEffect(() => updateViewer(viewer.current!, { scene, createGroupId: stableGroupId }), [scene, stableGroupId]);
  useEffect(
    () => updateViewer(viewer.current!, { activeComponents, activeRelations, useAlphaTest, materialStateImages }),
    [activeComponents, activeRelations, useAlphaTest, materialStateImages]
  );
  useEffect(
    () => updateViewer(viewer.current!, { selectedIds, hoveredIds: hoveredIdsExternal, onClickGroup }),
    [selectedIds, hoveredIdsExternal, onClickGroup]
  );
  useEffect(() => updateViewer(viewer.current!, { view, bufferZones, fitPadding, camera }), [view, bufferZones, fitPadding, camera]);
  useEffect(() => updateViewer(viewer.current!, { controls }), [controls]);
  useEffect(() => updateViewer(viewer.current!, { gizmo }), [gizmo]);
  useEffect(() => updateViewer(viewer.current!, { lights, environmentIntensity }), [lights, environmentIntensity]);
  useEffect(() => updateViewer(viewer.current!, { quality }), [quality]);
  useEffect(() => updateViewer(viewer.current!, { showDimensions }), [showDimensions]);
  useEffect(() => updateViewer(viewer.current!, { groundShadow, shadows }), [groundShadow, shadows]);
  useEffect(
    () =>
      updateViewer(viewer.current!, {
        popovers: popovers?.map((p) => ({ ...p, content: p.id })),
        getTooltips: getTooltips && ((id) => getTooltips(id).map((t) => ({ ...t, content: id }))),
      }),
    [popovers, getTooltips]
  );
  useEffect(
    () => updateViewer(viewer.current!, { onHoverGroup, onContextMenuGroup, onClickRelation, onPointerMissed }),
    [onHoverGroup, onContextMenuGroup, onClickRelation, onPointerMissed]
  );

  return (
    <div ref={container} className={className} style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...style }}>
      {overlays.map((o) =>
        createPortal(
          o.key.startsWith("popover:")
            ? popovers?.find((p) => p.id === o.content)?.content
            : getTooltips?.(o.content).find((t) => `tooltip:${t.id}` === o.key)?.content,
          o.element,
          o.key
        )
      )}
      {(!scene || !loaded) && sceneFallback !== undefined && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          {sceneFallback}
        </div>
      )}
    </div>
  );
}

/** The previous value while the new one is equal by value */
function useStableValue<T>(value: T): T {
  const [stable, setStable] = useState(value);
  const changed = JSON.stringify(value) !== JSON.stringify(stable);
  if (changed) {
    setStable(value);
  }
  return changed ? value : stable;
}
