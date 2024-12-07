import React from "react";
import { Group } from "three";
import { useFrame } from "@react-three/fiber";
import * as A3d from "../../abstract-3d.js";
import { MaterialState, ReactMaterial } from "./react-material.js";
import { ReactMesh } from "./react-mesh.js";

export function ReactGroup({
  g,
  materialStateImages,
  hoveredId,
  hoveredIdExternal,
  selectedId,
  hotSpotsActive,
  activeComponents,
  id,
  rootData,
  onClickGroup,
  onContextMenuGroup,
  setHoveredId,
  createGroupKey,
}: {
  readonly g: A3d.Group;
  readonly materialStateImages?: Record<string, string>;
  readonly hoveredId: string | undefined;
  readonly hoveredIdExternal: string | undefined;
  readonly selectedId: string | undefined;
  readonly hotSpotsActive: boolean;
  readonly activeComponents: Record<string, MaterialState> | undefined;
  readonly id: string | undefined;
  readonly rootData: Record<string, string> | undefined;
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
  readonly setHoveredId: (id: string | undefined) => void;
  readonly createGroupKey?: (
    g: A3d.Group,
    idx: number,
    rootData: Record<string, string> | undefined,
    id: string
  ) => string;
}): React.JSX.Element {
  const ref = React.useRef<Group>(undefined!);
  useFrame(({ invalidate }, delta) => {
    if (g.animation) {
      invalidate();
      ref.current.rotation.x += (g.animation.transform.rot.x / g.animation.duration) * 1000 * delta;
      ref.current.rotation.y += (g.animation.transform.rot.y / g.animation.duration) * 1000 * delta;
      ref.current.rotation.z += (g.animation.transform.rot.z / g.animation.duration) * 1000 * delta;
    } else {
      ref.current.rotation.x = g.rot?.x ?? 0;
      ref.current.rotation.y = g.rot?.y ?? 0;
      ref.current.rotation.z = g.rot?.z ?? 0;
      ref.current.position.x = g.pos.x;
      ref.current.position.y = g.pos.y;
      ref.current.position.z = g.pos.z;
    }
  });
  const materialState = activeComponents?.[id ?? ""];
  const disabled = hotSpotsActive && materialState !== "Accept";
  return (
    <group
      rotation={[g.rot?.x ?? 0, g.rot?.y ?? 0, g.rot?.z ?? 0]}
      position={[g.pos.x, g.pos.y, g.pos.z]}
      ref={ref}
      {...(id &&
        !disabled && {
          onClick: (e) => {
            if (onClickGroup) {
              e.stopPropagation();
              onClickGroup(id, rootData, g.data);
            }
          },
          onPointerOver: (e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            setHoveredId(id);
          },
          onPointerOut: (_e) => {
            document.body.style.cursor = "auto";
            setHoveredId(undefined);
          },
          onContextMenu: (e) => {
            if (onContextMenuGroup) {
              e.stopPropagation();
              onContextMenuGroup(id, rootData, g.data, e.nativeEvent.x, e.nativeEvent.y);
            }
          },
        })}
    >
      {g.groups?.map((g, i) => (
        <ReactGroup
          key={createGroupKey ? createGroupKey(g, i, rootData, id ?? "") : i}
          g={g}
          selectedId={selectedId}
          hotSpotsActive={hotSpotsActive}
          activeComponents={activeComponents}
          materialStateImages={materialStateImages}
          hoveredId={hoveredId}
          hoveredIdExternal={hoveredIdExternal}
          onClickGroup={onClickGroup}
          onContextMenuGroup={onContextMenuGroup}
          setHoveredId={setHoveredId}
          id={id}
          rootData={rootData}
          createGroupKey={createGroupKey}
        />
      ))}
      {g.meshes?.map((m, i) => (
        <ReactMesh key={`mesh_${i}`} mesh={m}>
          <ReactMaterial
            material={m.material}
            id={id}
            selectedId={selectedId}
            isText={m.geometry.type === "Text"}
            hoveredId={hoveredId || hoveredIdExternal}
            materialStateImages={materialStateImages}
            disabled={disabled}
            state={materialState}
          />
        </ReactMesh>
      ))}
    </group>
  );
}
