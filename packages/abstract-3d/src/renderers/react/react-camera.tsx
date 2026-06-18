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

export type A3dPerspectiveCamera = {
  readonly type: "Perspective";
  readonly near?: number;
  readonly far?: number;
  readonly fov?: number;
};

export type Camera = A3dPerspectiveCamera | A3dOrthographicCamera;
export type CameraType = Camera["type"];

export type A3dOrthographicCamera = {
  readonly type: "Orthographic";
  readonly near?: number;
  readonly far?: number;
};

export type BufferZones = {
  readonly left?: number;
  readonly right?: number;
  readonly top?: number;
  readonly bottom?: number;
};

export type ControlsHelper = (Viewcube | Viewport) & {
  readonly props: Pick<GizmoHelperProps, "alignment" | "margin">;
};
type Viewcube = { readonly type: "Viewcube"; readonly viewcubeProps: GenericProps };
type Viewport = { readonly type: "Viewport"; readonly viewportProps: GizmoViewportProps };

export function ReactCamera({
  useAnimations,
  camera,
  view,
  scene,
  controlsHelper,
  orbitContolsProps,
  bufferZones = {},
  fitPadding = 0,
}: {
  readonly useAnimations: boolean;
  readonly camera: Camera;
  readonly view: View;
  readonly scene: Scene;
  readonly controlsHelper?: ControlsHelper;
  readonly orbitContolsProps?: OrbitControlsProps;
  readonly bufferZones?: BufferZones;
  readonly fitPadding?: number;
}): React.JSX.Element {
  const [controls, setControls] = useState<any | null>(null);
  const perspectiveRef = useRef<any | undefined>(undefined);
  const orthographicRef = useRef<any | undefined>(undefined);

  const initialDistRef = useRef<number | null>(null);
  const initialTargetRef = useRef(new Vector3());
  const initialFovRef = useRef<number | null>(null);

  const viewPortAspect = useThree(({ viewport: { aspect } }) => aspect);
  const canvasSize = useThree(({ size }) => size);
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

    if (camera.type === "Perspective") {
      const bufLeft = bufferZones.left ?? 0;
      const bufRight = bufferZones.right ?? 0;
      const bufTop = bufferZones.top ?? 0;
      const bufBottom = bufferZones.bottom ?? 0;
      const canvasW = canvasSize.width;
      const canvasH = canvasSize.height;
      const usableW = Math.max(1, canvasW - bufLeft - bufRight);
      const usableH = Math.max(1, canvasH - bufTop - bufBottom);
      newCamera.setViewOffset(usableW, usableH, -bufLeft, -bufTop, canvasW, canvasH);
    }

    newCamera.updateProjectionMatrix();
    controls.update();
    invalidate();
  };

  useLayoutEffect(() => {
    const [posX, posY, posZ, size, sceneAspect] = getViewTransform(view, scene);

    // size.x/y are scene width/height in screen space (remapped per view direction)
    const screenW = size.x;
    const screenH = size.y;

    const fov = camera.type === "Perspective" ? camera.fov ?? 45 : 45;

    // Buffer zones in CSS pixels
    const bufLeft = bufferZones.left ?? 0;
    const bufRight = bufferZones.right ?? 0;
    const bufTop = bufferZones.top ?? 0;
    const bufBottom = bufferZones.bottom! ?? 0;

    // Canvas size in CSS pixels — use R3F's reactive size so the effect
    // re-runs on resize and is correct on first mount.
    const canvasW = canvasSize.width;
    const canvasH = canvasSize.height;

    if (canvasW === 0 || canvasH === 0) return;

    // Usable area in CSS pixels
    const usableW = Math.max(1, canvasW - bufLeft - bufRight);
    const usableH = Math.max(1, canvasH - bufTop - bufBottom);
    const usableAspect = usableW / usableH;

    initialFovRef.current = camera.type === "Perspective" ? fov : null;

    // ------------------------------------------------------------------
    // ORTHOGRAPHIC
    // ------------------------------------------------------------------
    if (camera.type === "Orthographic" && orthographicRef.current) {
      const dist = cameraDist(size, fov);
      initialDistRef.current = dist;

      // Fit scene into the usable area
      let sceneHalfW: number;
      let sceneHalfH: number;

      const padFactor = 1 + fitPadding;
      if (sceneAspect > usableAspect) {
        // Scene wider than usable area — constrain by width
        sceneHalfW = (screenW / 2) * padFactor;
        sceneHalfH = (screenW / 2 / usableAspect) * padFactor;
      } else {
        // Scene taller — constrain by height
        sceneHalfH = (screenH / 2) * padFactor;
        sceneHalfW = ((usableAspect * screenH) / 2) * padFactor;
      }

      // World units per CSS pixel in the usable area
      const wpp = (sceneHalfW * 2) / usableW;
      const hpp = (sceneHalfH * 2) / usableH;

      // Extend frustum outward by buffer pixel amounts
      orthographicRef.current.left = -sceneHalfW - bufLeft * wpp;
      orthographicRef.current.right = sceneHalfW + bufRight * wpp;
      orthographicRef.current.top = sceneHalfH + bufTop * hpp;
      orthographicRef.current.bottom = -sceneHalfH - bufBottom * hpp;

      orthographicRef.current.position.set(posX * dist, posY * dist, posZ * dist);
      orthographicRef.current.zoom = 1;
      orthographicRef.current.updateProjectionMatrix();

      // ------------------------------------------------------------------
      // PERSPECTIVE
      // ------------------------------------------------------------------
    } else if (camera.type === "Perspective" && perspectiveRef.current) {
      const fovRad = (fov * Math.PI) / 180;

      // Horizontal FOV across just the *usable* area (not the full canvas) —
      // this is what the camera's fov/aspect should describe.
      const fovHRad = 2 * Math.atan(Math.tan(fovRad / 2) * usableAspect);

      // Fit the scene into the usable area only. No fraction math needed —
      // fov/aspect now directly describe the usable area's frustum.
      const distForH = screenH / 2 / Math.tan(fovRad / 2) + size.z * 0.5;
      const distForW = screenW / 2 / Math.tan(fovHRad / 2) + size.z * 0.5;

      const dist = Math.max(distForH, distForW) * (1 + fitPadding);
      initialDistRef.current = dist;

      perspectiveRef.current.fov = fov;
      perspectiveRef.current.aspect = usableAspect;
      perspectiveRef.current.position.set(posX * dist, posY * dist, posZ * dist);

      // Slice/extend the rendered frustum from the usable-area-sized window
      // out to the full canvas, asymmetrically per buffer side.
      perspectiveRef.current.setViewOffset(usableW, usableH, -bufLeft, -bufTop, canvasW, canvasH);

      perspectiveRef.current.updateProjectionMatrix();
    }
  }, [camera, viewPortAspect, canvasSize, bufferZones, view, scene, fitPadding]);

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

type ViewTransform = readonly [number, number, number, Vec3, number];
function getViewTransform(view: View, scene: Scene): ViewTransform {
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
