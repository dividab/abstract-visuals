import type { ThreeEvent } from "@react-three/fiber";
import React from "react";
import type { Dimensions, Vec3, Dimension, Mesh, Material } from "../../abstract-3d.js";
import { dimensionConvertToTypeMesh, vec3Zero } from "../../abstract-3d.js";
import { ReactMaterial, selectMat } from "./react-material.js";
import { ReactMesh } from "./react-mesh.js";

type DimensionCallbacks = {
  readonly selectedIds?: Record<string, boolean> | undefined;
  readonly hotSpotsActive?: boolean;
  readonly onClickGroup?: (id: string | undefined, rootData: undefined, data: undefined, e: ThreeEvent<MouseEvent>) => void;
  readonly onHoverGroup?: (id: string | undefined, rootData: undefined, data: undefined, e: ThreeEvent<MouseEvent>) => void;
  readonly onContextMenuGroup?: (id: string, rootData: undefined, data: undefined, left: number, top: number, e: ThreeEvent<MouseEvent>) => void;
};

export const ReactDimensions = React.memo(
  ({
    dimensions,
    showDimensions,
    sceneRotation,
    sceneCenter,
    ...callbacks
  }: {
    readonly dimensions: Dimensions | undefined;
    readonly showDimensions: boolean;
    readonly sceneRotation: Vec3 | undefined;
    readonly sceneCenter: Vec3 | undefined;
  } & DimensionCallbacks): React.JSX.Element => {
    const material = dimensions?.material;
    const dimensionMaterial = React.useMemo(() => (material ? <ReactMaterial isText={true} material={material} /> : <></>), [material]);
    return (
      <>
        {dimensions?.dimensions.map((dimension, i) => (
          <ReactDimension
            key={i}
            dimension={dimension}
            material={dimensions.material}
            visible={showDimensions}
            sceneRotation={sceneRotation}
            _sceneCenter={sceneCenter}
            {...callbacks}
          >
            {dimensionMaterial}
          </ReactDimension>
        ))}
      </>
    );
  }
);

/** A dimension with an id is clickable like a group when there is an onClickGroup, and drawn in the select color when selected or hovered. */
export function ReactDimension({
  dimension,
  material,
  visible,
  children,
  sceneRotation,
  selectedIds,
  hotSpotsActive,
  onClickGroup,
  onHoverGroup,
  onContextMenuGroup,
}: {
  readonly dimension: Dimension;
  readonly material: Material;
  readonly visible: boolean;
  readonly children: React.JSX.Element;
  readonly sceneRotation: Vec3 | undefined;
  readonly _sceneCenter: Vec3 | undefined;
} & DimensionCallbacks): React.JSX.Element {
  const [hovered, setHovered] = React.useState<boolean>(false);
  const id = hotSpotsActive || !onClickGroup ? undefined : dimension.id;
  const highlighted = !!id && (hovered || !!selectedIds?.[id]);
  const dim = dimensionConvertToTypeMesh(highlighted ? { ...dimension, material: selectMat } : dimension, sceneRotation ?? vec3Zero, material);
  return visible ? (
    <group
      position={[dim.pos.x, dim.pos.y, dim.pos.z]}
      rotation={[dim.rot.x, dim.rot.y, dim.rot.z]}
      {...(id && {
        onClick: (e) => {
          if (onClickGroup) {
            e.stopPropagation();
            onClickGroup(id, undefined, undefined, e);
          }
        },
        onPointerOver: (e) => {
          e.stopPropagation();
          document.body.style.cursor = "pointer";
          onHoverGroup?.(id, undefined, undefined, e);
          setHovered(true);
        },
        onPointerOut: (e) => {
          document.body.style.cursor = "auto";
          setHovered(false);
          onHoverGroup?.(undefined, undefined, undefined, e);
        },
        onContextMenu: (e) => {
          if (onContextMenuGroup) {
            e.stopPropagation();
            onContextMenuGroup(id, undefined, undefined, e.nativeEvent.x, e.nativeEvent.y, e);
          }
        },
      })}
    >
      <DimensionMeshes meshes={dim.meshes}>{highlighted ? <ReactMaterial isText={true} material={selectMat} /> : children}</DimensionMeshes>
    </group>
  ) : (
    <></>
  );
}

const DimensionMeshes = React.memo(
  ({ meshes, children }: { readonly meshes: ReadonlyArray<Mesh>; readonly children: React.JSX.Element }): React.JSX.Element => (
    <>
      {meshes.map((m, i) => (
        <ReactMesh key={i} mesh={m}>
          {children}
        </ReactMesh>
      ))}
    </>
  )
);
