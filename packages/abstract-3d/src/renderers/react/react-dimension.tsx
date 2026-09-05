import React from "react";
import type { Dimensions, Vec3, Dimension, Mesh, Material } from "../../abstract-3d.js";
import { dimensionConvertToTypeMesh, vec3Zero } from "../../abstract-3d.js";
import { ReactMaterial } from "./react-material.js";
import { ReactMesh } from "./react-mesh.js";

export const ReactDimensions = React.memo(
  ({
    dimensions,
    showDimensions,
    sceneRotation,
    sceneCenter,
  }: {
    readonly dimensions: Dimensions | undefined;
    readonly showDimensions: boolean;
    readonly sceneRotation: Vec3 | undefined;
    readonly sceneCenter: Vec3 | undefined;
  }): React.JSX.Element => {
    const dimensionMaterial = React.useMemo(
      () => (dimensions?.material ? <ReactMaterial isText={true} material={dimensions?.material} /> : <></>),
      []
    );
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
          >
            {dimensionMaterial}
          </ReactDimension>
        ))}
      </>
    );
  }
);

export function ReactDimension({
  dimension,
  material,
  visible,
  children,
  sceneRotation,
}: {
  readonly dimension: Dimension;
  readonly material: Material;
  readonly visible: boolean;
  readonly children: React.JSX.Element;
  readonly sceneRotation: Vec3 | undefined;
  readonly _sceneCenter: Vec3 | undefined;
}): React.JSX.Element {
  const dim = dimensionConvertToTypeMesh(dimension, sceneRotation ?? vec3Zero, material);
  return visible ? (
    <group position={[dim.pos.x, dim.pos.y, dim.pos.z]} rotation={[dim.rot.x, dim.rot.y, dim.rot.z]}>
      <DimensionMeshes meshes={dim.meshes}>{children}</DimensionMeshes>
    </group>
  ) : (
    <></>
  );
}

const DimensionMeshes = React.memo(
  ({
    meshes,
    children,
  }: {
    readonly meshes: ReadonlyArray<Mesh>;
    readonly children: React.JSX.Element;
  }): React.JSX.Element => (
    <>
      {meshes.map((m, i) => (
        <ReactMesh key={i} mesh={m}>
          {children}
        </ReactMesh>
      ))}
    </>
  )
);
