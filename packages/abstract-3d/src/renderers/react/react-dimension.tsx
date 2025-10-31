import { useFrame } from "@react-three/fiber";
import React from "react";
import type { Group } from "three";
import { Dimensions, Vec3, Dimension, vec3TransRot, vec3Flip, Mesh } from "../../abstract-3d.js";
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
            d={dimension}
            visible={showDimensions}
            sceneRotation={sceneRotation}
            sceneCenter={sceneCenter}
          >
            {dimensionMaterial}
          </ReactDimension>
        ))}
      </>
    );
  }
);

export function ReactDimension({
  d,
  visible,
  children,
  sceneRotation,
  sceneCenter,
}: {
  readonly d: Dimension;
  readonly visible: boolean;
  readonly children: React.JSX.Element;
  readonly sceneRotation: Vec3 | undefined;
  readonly sceneCenter: Vec3 | undefined;
}): React.JSX.Element {
  const ref = React.useRef<Group>(undefined!);
  useFrame(({ camera }) => {
    ref.current.visible =
      visible &&
      ((): boolean => {
        const cam = vec3TransRot(camera.position, vec3Flip(sceneCenter!), sceneRotation!);
        const cameraPositions = {
          [cam.x >= 0 ? "right" : "left"]: true,
          [cam.y >= 0 ? "top" : "bottom"]: true,
          [cam.z >= 0 ? "front" : "back"]: true,
        };
        return d.views.every((cp) => cameraPositions[cp]);
      })();
  });
  return (
    <group ref={ref} position={[d.pos.x, d.pos.y, d.pos.z]} rotation={[d.rot.x, d.rot.y, d.rot.z]}>
      <DimensionMeshes meshes={d.meshes}>{children}</DimensionMeshes>
    </group>
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
