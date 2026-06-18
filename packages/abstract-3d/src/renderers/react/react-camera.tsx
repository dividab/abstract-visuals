/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useLayoutEffect, useRef, useState } from "react";
import {
  type GizmoHelperProps,
  PerspectiveCamera,
  OrthographicCamera,
  type OrbitControlsProps,
  OrbitControls,
  GizmoHelper,
  GizmoViewcube,
  GizmoViewport,
} from "@react-three/drei";
import { type ThreeEvent, useThree } from "@react-three/fiber";
import { exhaustiveCheck } from "ts-exhaustive-check";
import { Vector3 } from "three";
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
}): React.JSX.Element {
  const [controls, setControls] = useState<any | null>(null);
  const perspectiveRef = useRef<any | undefined>(undefined);
  const orthographicRef = useRef<any | undefined>(undefined);

  const initialDistRef = useRef<number | null>(null);
  const initialTargetRef = useRef(new Vector3());
  const initialFovRef = useRef<number | null>(null);

  const viewPortAspect = useThree(({ viewport: { aspect } }) => aspect);
  const { invalidate } = useThree();

  const resetZoomOnGizmoClick = (): void => {
    if (!controls || initialDistRef.current == null || (!perspectiveRef.current && !orthographicRef.current)) {
      return;
    }

    const newCamera = camera.type === "Perspective" ? perspectiveRef.current : orthographicRef.current;
    const target = initialTargetRef.current.clone();

    controls.target.copy(target);

    const dist = initialDistRef.current;
    const dir = newCamera.position.clone().sub(target).normalize();
    newCamera.fov = initialFovRef.current;
    newCamera.zoom = 1;
    newCamera.position.copy(target.clone().add(dir.multiplyScalar(dist)));
    newCamera.updateProjectionMatrix();

    controls.update();
    invalidate();
  };

  useLayoutEffect(() => {
    const [posX, posY, posZ, size, sceneAspect] = getViewTransform(view, scene, vec3);

    const dist = cameraDist(size, camera.type === "Perspective" ? camera.fov ?? 45 : 45);
    initialDistRef.current = dist;
    initialFovRef.current = camera.type === "Perspective" ? camera.fov ?? 45 : null;

    if (camera.type === "Orthographic" && orthographicRef.current) {
      const [left, right, top, bottom] =
        sceneAspect > viewPortAspect
          ? [-size.x / 2, size.x / 2, size.x / 2 / viewPortAspect, -size.x / 2 / viewPortAspect]
          : [(-viewPortAspect * size.y) / 2, (viewPortAspect * size.y) / 2, size.y / 2, -size.y / 2];
      orthographicRef.current.position.set(posX * dist, posY * dist, posZ * dist);
      orthographicRef.current.left = left;
      orthographicRef.current.right = right;
      orthographicRef.current.bottom = bottom;
      orthographicRef.current.top = top;
      orthographicRef.current.updateProjectionMatrix();
    } else if (camera.type === "Perspective" && perspectiveRef.current) {
      perspectiveRef.current.position.set(posX * dist, posY * dist, posZ * dist);
      perspectiveRef.current.updateProjectionMatrix();
    }
  }, [camera, viewPortAspect]);
  // const prevScene = React.useRef(scene)
  // useEffect(() => {
  //   prevScene.current = scene;
  // }, [scene]);

  // useFrame(() => {
  // if (useAnimations && camera && prevScene.current !== scene) {
  //   const [, , z] = cameraDist(scene);
  //   vector3.set(camera.position.x, camera.position.y, z);
  //   camera.position.lerp(vector3, 0.12);
  //   ref.current.enabled = false;
  //   invalidate();
  // } else {
  //   ref.current.enabled = true;
  // }
  // });
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

      <ControlsWrapper
        {...orbitContolsProps}
        setControls={(c) => {
          setControls(c);
        }}
      />

      {(() => {
        switch (controlsHelper?.type) {
          case "Viewcube":
            return (
              <GizmoHelper
                {...controlsHelper.props}
                onTarget={() => {
                  if (controlsHelper.viewcubeProps.resetZoomAndPanOnClick) {
                    resetZoomOnGizmoClick();
                  }
                  return controls?.target as Vector3;
                }}
                onUpdate={() => controls?.update?.()}
              >
                <GizmoViewcube {...controlsHelper.viewcubeProps} />
              </GizmoHelper>
            );
          case "Viewport":
            return (
              <GizmoHelper
                {...controlsHelper.props}
                onTarget={() => {
                  if (controlsHelper.viewportProps.resetZoomAndPanOnClick) {
                    resetZoomOnGizmoClick();
                  }
                  return controls?.target as Vector3;
                }}
                onUpdate={() => controls?.update?.()}
              >
                <GizmoViewport {...controlsHelper.viewportProps} />
              </GizmoHelper>
            );
          case undefined:
          default:
            return null;
        }
      })()}
    </>
  );
}

const ControlsWrapper = (
  props: OrbitControlsProps & {
    setControls: (controls: any) => void;
  }
): React.JSX.Element => {
  const ref = useRef<any>(null);

  useLayoutEffect(() => {
    if (!ref.current) {
      return;
    }
    props.setControls(ref.current);
  });
  return <OrbitControls {...props} makeDefault ref={ref} />;
};
type GizmoViewportProps = React.JSX.IntrinsicElements["group"] & {
  readonly axisColors?: [string, string, string];
  readonly axisScale?: [number, number, number];
  readonly labels?: [string, string, string];
  readonly axisHeadScale?: number;
  readonly labelColor?: string;
  readonly hideNegativeAxes?: boolean;
  readonly hideAxisHeads?: boolean;
  readonly disabled?: boolean;
  readonly font?: string;
  readonly onClick?: (e: ThreeEvent<MouseEvent>) => null;
  readonly resetZoomAndPanOnClick?: boolean;
};

type GenericProps = {
  readonly font?: string;
  readonly opacity?: number;
  readonly color?: string;
  readonly hoverColor?: string;
  readonly textColor?: string;
  readonly strokeColor?: string;
  readonly onClick?: (e: ThreeEvent<MouseEvent>) => null;
  readonly faces?: Array<string>;
  readonly resetZoomAndPanOnClick?: boolean;
};

export const cameraDist = (size: Vec3, fov: number): number =>
  size.z * 0.5 + (size.x > size.y ? size.x : size.y) / (1 / 2 / Math.tan((Math.PI * fov) / 180 / 2));

function getViewTransform(view: View, scene: any, vec3: any) {
  const size = scene.size_deprecated;

  switch (view) {
    case "front":
      return [0, 0, 1, size, size.x / size.y] as const;

    case "back":
      return [0, 0, -1, size, size.x / size.y] as const;

    case "top":
      return [0, 1, 0, vec3(size.x, size.z, size.y), size.x / size.z] as const;

    case "bottom":
      return [0, -1, 0, vec3(size.x, size.z, size.y), size.x / size.z] as const;

    case "right":
      return [1, 0, 0, vec3(size.z, size.y, size.x), size.z / size.y] as const;

    case "left":
      return [-1, 0, 0, vec3(size.z, size.y, size.x), size.z / size.y] as const;

    default:
      return exhaustiveCheck(view);
  }
}
