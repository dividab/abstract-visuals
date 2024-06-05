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
  }: {
    readonly dimensions: A3d.Dimensions | undefined;
    readonly showDimensions: boolean;
  }): JSX.Element => {
    const dimensionMaterial = React.useMemo(
      () => (dimensions?.material ? <ReactMaterial material={dimensions?.material} /> : <></>),
      []
    );
    return (
      <>
        {dimensions?.dimensions.map((dimension, i) => (
          <ReactDimension key={i} d={dimension} visible={showDimensions}>
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
}: {
  readonly d: A3d.Dimension;
  readonly visible: boolean;
  readonly children: JSX.Element;
}): JSX.Element {
  const ref = React.useRef<Group>(undefined!);
  useFrame(({ camera }) => {
    ref.current.visible =
      visible &&
      ((): boolean => {
        const cameraPositions = {
          [camera.position.x >= 0 ? "right" : "left"]: true,
          [camera.position.y >= 0 ? "top" : "bottom"]: true,
          [camera.position.z >= 0 ? "front" : "back"]: true,
        };
        if (d.views.every((cp) => cameraPositions[cp])) {
          ref.current.position.set(d.pos.x, d.pos.y, d.pos.z);
          ref.current.rotation.set(d.rot.x, d.rot.y, d.rot.z);
          return true;
        }
        return false;
      })();
  });
  return (
    <group ref={ref}>
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
