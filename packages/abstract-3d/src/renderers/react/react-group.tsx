import React from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { Group as Group_1 } from "../../abstract-3d.js";
import { MaterialState, ReactMaterial } from "./react-material.js";
import { ReactMesh } from "./react-mesh.js";
import { ImageMaterial } from "./react-image-material.js";

export function ReactGroup({
  g,
  materialStateImages,
  hoveredIdExternal,
  selectedIds,
  hotSpotsActive,
  activeComponents,
  useAlphaTest,
  id,
  rootData,
  hoveredParent,
  onClickGroup,
  onHoverGroup,
  onContextMenuGroup,
  createGroupKey,
}: {
  readonly g: Group_1;
  readonly materialStateImages?: Record<string, string>;
  readonly hoveredIdExternal: string | undefined;
  readonly hoveredParent?: boolean;
  readonly selectedIds: Record<string, boolean> | undefined;
  readonly hotSpotsActive: boolean;
  readonly useAlphaTest?: boolean;
  readonly activeComponents: Record<string, MaterialState> | undefined;
  readonly id: string | undefined;
  readonly rootData: Record<string, string> | undefined;
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
  readonly createGroupKey?: (
    g: Group_1,
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
  const [hovered, setHovered] = React.useState<boolean>(false);
  const hoveredFinal = hovered || hoveredIdExternal === id || !!hoveredParent;
  const selected = selectedIds?.[id ?? ""];

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
              onClickGroup(id, rootData, g.data, e);
            }
          },
          onPointerOver: (e) => {
            e.stopPropagation();
            document.body.style.cursor = "pointer";
            if (onHoverGroup) {
              onHoverGroup(id, rootData, g.data, e);
            }
            setHovered(true);
          },
          onPointerOut: (e) => {
            document.body.style.cursor = "auto";
            setHovered(false);
            if (onHoverGroup) {
              onHoverGroup(undefined, undefined, undefined, e);
            }
          },
          onContextMenu: (e) => {
            if (onContextMenuGroup) {
              e.stopPropagation();
              onContextMenuGroup(id, rootData, g.data, e.nativeEvent.x, e.nativeEvent.y, e);
            }
          },
        })}
    >
      {g.groups?.map((g, i) => (
        <ReactGroup
          key={createGroupKey ? createGroupKey(g, i, rootData, id ?? "") : i}
          g={g}
          selectedIds={selectedIds}
          hotSpotsActive={hotSpotsActive}
          activeComponents={activeComponents}
          materialStateImages={materialStateImages}
          hoveredIdExternal={hoveredIdExternal}
          hoveredParent={hoveredFinal}
          onClickGroup={onClickGroup}
          onHoverGroup={(hId, rData, data, e) => {
            if (hId === id) {
              setHovered(hId !== undefined);
            }
            onHoverGroup?.(hId, rData, data, e);
          }}
          onContextMenuGroup={onContextMenuGroup}
          id={id}
          rootData={rootData}
          createGroupKey={createGroupKey}
          useAlphaTest={useAlphaTest}
        />
      ))}
      {g.meshes?.map((m, i) => (
        <ReactMesh key={`mesh_${i}`} mesh={m}>
          {m.geometry.type === "Image" ? (
            <ImageMaterial
              image={m.geometry.image}
              materialStateImages={materialStateImages}
              material={m.material}
              useAlphaTest={useAlphaTest}
              hovered={hoveredFinal}
              materialState={materialState}
              selected={selected}
            />
          ) : (
            <ReactMaterial
              material={m.material}
              selected={selected}
              isText={m.geometry.type === "Text"}
              hovered={hoveredFinal}
              disabled={disabled}
              materialState={materialState}
            />
          )}
        </ReactMesh>
      ))}
    </group>
  );
}
