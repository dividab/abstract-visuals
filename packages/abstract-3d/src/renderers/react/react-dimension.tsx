import { useFrame } from "@react-three/fiber";
import React from "react";
import { Group } from "three";
import * as A3d from "../../abstract-3d";
import { ReactMaterial } from "./react-material";
import { ReactMesh } from "./react-mesh";

export const ReactDimensions = React.memo(
  ({
    dimensions,
    showDimensions,
    sceneRotation,
    sceneCenter,
  }: {
    readonly dimensions: A3d.Dimensions | undefined;
    readonly showDimensions: boolean;
    readonly sceneRotation: A3d.Vec3 | undefined;
    readonly sceneCenter: A3d.Vec3 | undefined;
  }): JSX.Element => {
    const dimensionMaterial = React.useMemo(
      () => (dimensions?.material ? <ReactMaterial material={dimensions?.material} /> : <></>),
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
  readonly d: A3d.Dimension;
  readonly visible: boolean;
  readonly children: JSX.Element;
  readonly sceneRotation: A3d.Vec3 | undefined;
  readonly sceneCenter: A3d.Vec3 | undefined;
}): JSX.Element {
  const ref = React.useRef<Group>(undefined!);
  useFrame(({ camera }) => {
    ref.current.visible =
      visible &&
      ((): boolean => {
        const cam = A3d.vec3TransRot(camera.position, A3d.vec3Flip(sceneCenter!), sceneRotation!);
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
  ({ meshes, children }: { readonly meshes: ReadonlyArray<A3d.Mesh>; readonly children: JSX.Element }): JSX.Element => (
    <>
      {meshes.map((m, i) => (
        <ReactMesh key={i} mesh={m}>
          {children}
        </ReactMesh>
      ))}
    </>
  )
);
