/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
// import { OrbitControls, OrbitControlsProps } from "@react-three/drei/core/OrbitControls";
// import { GizmoHelper, GizmoHelperProps } from "@react-three/drei/core/GizmoHelper";
// import { GizmoViewcube } from "@react-three/drei/core/GizmoViewcube";
// import { OrthographicCamera } from "@react-three/drei/core/OrthographicCamera";
// import { PerspectiveCamera } from "@react-three/drei/core/PerspectiveCamera";
// import { GizmoViewport } from "@react-three/drei/core/GizmoViewport";
import {
  GizmoHelperProps,
  PerspectiveCamera,
  OrthographicCamera,
  OrbitControlsProps,
  OrbitControls,
  GizmoHelper,
  GizmoViewcube,
  GizmoViewport,
} from "@react-three/drei";
import { Vector3 } from "three";
import { ThreeEvent, useFrame, useThree } from "@react-three/fiber";
import { exhaustiveCheck } from "ts-exhaustive-check";
import { View, Scene, Vec3, vec3 } from "../../abstract-3d.js";

export type Camera = A3dPerspectiveCamera | A3dOrthographicCamera;
export type CameraType = Camera["type"];

export type A3dPerspectiveCamera = {
  readonly type: "Perspective";
  readonly near?: number;
  readonly far?: number;
  readonly fov?: number;
};
export type A3dOrthographicCamera = { readonly type: "Orthographic"; readonly near?: number; readonly far?: number };

export type ControlsHelper = (Viewcube | Viewport) & { readonly props: Pick<GizmoHelperProps, "alignment" | "margin"> };
type Viewcube = { readonly type: "Viewcube"; readonly viewcubeProps: GenericProps };
type Viewport = { readonly type: "Viewport"; readonly viewportProps: GizmoViewportProps };

const ControlsWrapper = (
  props: OrbitControlsProps & { readonly setControls: (r: React.MutableRefObject<any>) => void }
): JSX.Element => {
  const ref = useRef<any>();

  useEffect(() => {
    if (!ref.current) {
      return;
    }
    props.setControls(ref.current);
  }, [ref.current]);
  return <OrbitControls {...props} makeDefault ref={ref} />;
};

export function ReactCamera({
  useAnimations,
  camera,
  view,
  scene,
  controlsHelper,
  orbitContolsProps,
}: {
  readonly useAnimations: boolean;
  readonly camera: Camera;
  readonly view: View;
  readonly scene: Scene;
  readonly controlsHelper?: ControlsHelper;
  readonly orbitContolsProps?: OrbitControlsProps;
}): JSX.Element {
  const [controls, setControls] = useState<any | null>(null);
  const perspectiveRef = useRef<any | undefined>(undefined);
  const orthographicRef = useRef<any | undefined>(undefined);
  const viewPortAspect = useThree(({ viewport: { aspect } }) => aspect);

  useEffect(() => {
    const [posX, posY, posZ, size, sceneAspect] = (() => {
      switch (view) {
        case "front":
          return [0, 0, 1, scene.size_deprecated, scene.size_deprecated.x / scene.size_deprecated.y];
        case "back":
          return [0, 0, -1, scene.size_deprecated, scene.size_deprecated.x / scene.size_deprecated.y];
        case "top":
          return [
            0,
            1,
            0,
            vec3(scene.size_deprecated.x, scene.size_deprecated.z, scene.size_deprecated.y),
            scene.size_deprecated.x / scene.size_deprecated.z,
          ];
        case "bottom":
          return [
            0,
            -1,
            0,
            vec3(scene.size_deprecated.x, scene.size_deprecated.z, scene.size_deprecated.y),
            scene.size_deprecated.x / scene.size_deprecated.z,
          ];
        case "right":
          return [
            1,
            0,
            0,
            vec3(scene.size_deprecated.z, scene.size_deprecated.y, scene.size_deprecated.x),
            scene.size_deprecated.z / scene.size_deprecated.y,
          ];
        case "left":
          return [
            -1,
            0,
            0,
            vec3(scene.size_deprecated.z, scene.size_deprecated.y, scene.size_deprecated.x),
            scene.size_deprecated.z / scene.size_deprecated.y,
          ];
        default:
          return exhaustiveCheck(view);
      }
    })();

    const dist = cameraDist(size, camera.type === "Perspective" ? camera.fov ?? 45 : 45);

    if (camera.type === "Orthographic" && orthographicRef.current) {
      const [left, right, top, bottom] =
        sceneAspect > viewPortAspect
          ? [-size.x / 2, size.x / 2, size.x / 2 / viewPortAspect, -size.x / 2 / viewPortAspect]
          : [(-viewPortAspect * size.y) / 2, (viewPortAspect * size.y) / 2, size.y / 2, -size.y / 2];
      orthographicRef.current.position.setX(posX * dist);
      orthographicRef.current.position.setY(posY * dist);
      orthographicRef.current.position.setZ(posZ * dist);
      orthographicRef.current.left = left;
      orthographicRef.current.right = right;
      orthographicRef.current.bottom = bottom;
      orthographicRef.current.top = top;
      orthographicRef.current.updateProjectionMatrix();
    } else if (camera.type === "Perspective" && perspectiveRef.current) {
      perspectiveRef.current.position.setX(posX * dist);
      perspectiveRef.current.position.setY(posY * dist);
      perspectiveRef.current.position.setZ(posZ * dist);
      perspectiveRef.current.updateProjectionMatrix();
    }
  }, [camera, viewPortAspect]);
  // const prevScene = React.useRef(scene)
  // useEffect(() => {
  //   prevScene.current = scene;
  // }, [scene]);

  useFrame(() => {
    // if (useAnimations && camera && prevScene.current !== scene) {
    //   const [, , z] = cameraDist(scene);
    //   vector3.set(camera.position.x, camera.position.y, z);
    //   camera.position.lerp(vector3, 0.12);
    //   ref.current.enabled = false;
    //   invalidate();
    // } else {
    //   ref.current.enabled = true;
    // }
  });
  return (
    <>
      <PerspectiveCamera
        ref={perspectiveRef}
        near={camera.near}
        far={camera.far}
        fov={camera.type === "Perspective" ? camera.fov : 75}
        aspect={viewPortAspect}
        manual={true}
        makeDefault={camera.type === "Perspective"}
      />
      <OrthographicCamera
        ref={orthographicRef}
        up={[0, 1, 0]}
        near={camera.near}
        far={camera.far}
        manual={true}
        makeDefault={camera.type === "Orthographic"}
      />
      <ControlsWrapper {...orbitContolsProps} setControls={(c) => setControls(c.current)} />
      {(() => {
        switch (controlsHelper?.type) {
          case "Viewcube":
            return (
              <GizmoHelper
                {...controlsHelper.props}
                onTarget={() => controls?.target as Vector3}
                onUpdate={() => controls?.update?.()}
              >
                <GizmoViewcube {...(controlsHelper.viewcubeProps as any)} />
              </GizmoHelper>
            );
          case "Viewport":
            return (
              <GizmoHelper
                {...controlsHelper.props}
                onTarget={() => controls?.target as Vector3}
                onUpdate={() => controls?.update?.()}
              >
                <GizmoViewport {...(controlsHelper.viewportProps as any)} />
              </GizmoHelper>
            );
          case undefined:
          default:
            return <></>;
        }
      })()}
    </>
  );
}

type GizmoViewportProps = JSX.IntrinsicElements["group"] & {
  readonly axisColors?: readonly [string, string, string];
  readonly axisScale?: readonly [number, number, number];
  readonly labels?: readonly [string, string, string];
  readonly axisHeadScale?: number;
  readonly labelColor?: string;
  readonly hideNegativeAxes?: boolean;
  readonly hideAxisHeads?: boolean;
  readonly disabled?: boolean;
  readonly font?: string;
  readonly onClick?: (e: ThreeEvent<MouseEvent>) => null;
};

type GenericProps = {
  readonly font?: string;
  readonly opacity?: number;
  readonly color?: string;
  readonly hoverColor?: string;
  readonly textColor?: string;
  readonly strokeColor?: string;
  readonly onClick?: (e: ThreeEvent<MouseEvent>) => null;
  readonly faces?: ReadonlyArray<string>;
};

export const cameraDist = (size: Vec3, fov: number): number =>
  size.z * 0.5 + (size.x > size.y ? size.x : size.y) / (1 / 2 / Math.tan((Math.PI * fov) / 180 / 2));
