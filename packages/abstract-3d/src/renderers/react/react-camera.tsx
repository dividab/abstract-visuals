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
import React, { useLayoutEffect, useRef, useState } from "react";
import type { OrthographicCamera as ThreeOrthographicCamera, PerspectiveCamera as ThreePerspectiveCamera } from "three";
import { Vector3 } from "three";
import { exhaustiveCheck } from "ts-exhaustive-check";
import type { View, Scene, Vec3 } from "../../abstract-3d.js";
import { vec3 } from "../../abstract-3d.js";

export type Camera = A3dPerspectiveCamera | A3dOrthographicCamera;
export type CameraType = Camera["type"];

export type A3dPerspectiveCamera = {
  readonly type: "Perspective";
  readonly near?: number;
  readonly far?: number;
  readonly fov?: number;
};

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
type Viewcube = {
  readonly type: "Viewcube";
  readonly viewcubeProps: GenericProps;
};
type Viewport = {
  readonly type: "Viewport";
  readonly viewportProps: GizmoViewportProps;
};

type RefInstance<C> = C extends React.ForwardRefExoticComponent<infer P> ? (P extends React.RefAttributes<infer R> ? R : never) : never;
type OrbitControlsInstance = RefInstance<typeof OrbitControls>;

export function ReactCamera({
  useAnimations: _useAnimations,
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
  // oxlint-disable-next-line typescript/no-redundant-type-constituents -- oxlint's type-aware checker resolves OrbitControlsInstance (a conditional type over a forward-ref component) as `any`; tsc resolves it correctly and the `| null` is not actually redundant
  const [controls, setControls] = useState<OrbitControlsInstance | null>(null);
  const perspectiveRef = useRef<ThreePerspectiveCamera | undefined>(undefined);
  const orthographicRef = useRef<ThreeOrthographicCamera | undefined>(undefined);

  const initialTargetRef = useRef(new Vector3());

  const viewPortAspect = useThree(({ viewport: { aspect } }) => aspect);
  const canvasSize = useThree(({ size }) => size);
  const invalidate = useThree(({ invalidate }) => invalidate);

  // Fits the active camera's frustum to the latest scene/canvas/buffer zones.
  // Returns the fitted camera, its fit distance and the view's default direction;
  // callers position the camera and call updateProjectionMatrix().
  const fitCamera = ():
    | {
        readonly cam: ThreePerspectiveCamera | ThreeOrthographicCamera;
        readonly dist: number;
        readonly viewDir: Vector3;
      }
    | undefined => {
    const [posX, posY, posZ, size, sceneAspect] = getViewTransform(view, scene);

    // size.x/y are scene width/height in screen space (remapped per view direction)
    const screenW = size.x;
    const screenH = size.y;

    const fov = camera.type === "Perspective" ? (camera.fov ?? 45) : 45;

    // Buffer zones in CSS pixels
    const bufLeft = bufferZones.left ?? 0;
    const bufRight = bufferZones.right ?? 0;
    const bufTop = bufferZones.top ?? 0;
    const bufBottom = bufferZones.bottom ?? 0;

    // Canvas size in CSS pixels — use R3F's reactive size so the effect
    // re-runs on resize and is correct on first mount.
    const canvasW = canvasSize.width;
    const canvasH = canvasSize.height;

    if (canvasW === 0 || canvasH === 0) {
      return undefined;
    }

    // Usable area in CSS pixels
    const usableW = Math.max(1, canvasW - bufLeft - bufRight);
    const usableH = Math.max(1, canvasH - bufTop - bufBottom);
    const usableAspect = usableW / usableH;
    const viewDir = new Vector3(posX, posY, posZ);

    // ------------------------------------------------------------------
    // ORTHOGRAPHIC
    // ------------------------------------------------------------------
    if (camera.type === "Orthographic" && orthographicRef.current) {
      const cam = orthographicRef.current;
      const dist = cameraDist(size, fov);

      // Fit scene into the usable area
      const padFactor = 1 + fitPadding;
      const { sceneHalfW, sceneHalfH } =
        sceneAspect > usableAspect
          ? // Scene wider than usable area — constrain by width
            {
              sceneHalfW: (screenW / 2) * padFactor,
              sceneHalfH: (screenW / 2 / usableAspect) * padFactor,
            }
          : // Scene taller — constrain by height
            {
              sceneHalfH: (screenH / 2) * padFactor,
              sceneHalfW: ((usableAspect * screenH) / 2) * padFactor,
            };

      // World units per CSS pixel in the usable area
      const wpp = (sceneHalfW * 2) / usableW;
      const hpp = (sceneHalfH * 2) / usableH;

      // Extend frustum outward by buffer pixel amounts
      cam.left = -sceneHalfW - bufLeft * wpp;
      cam.right = sceneHalfW + bufRight * wpp;
      cam.top = sceneHalfH + bufTop * hpp;
      cam.bottom = -sceneHalfH - bufBottom * hpp;
      cam.zoom = 1;
      return { cam, dist, viewDir };

      // ------------------------------------------------------------------
      // PERSPECTIVE
      // ------------------------------------------------------------------
    } else if (camera.type === "Perspective" && perspectiveRef.current) {
      const cam = perspectiveRef.current;
      const fovRad = (fov * Math.PI) / 180;

      // Horizontal FOV across just the *usable* area (not the full canvas) —
      // this is what the camera's fov/aspect should describe.
      const fovHRad = 2 * Math.atan(Math.tan(fovRad / 2) * usableAspect);

      // Fit the scene into the usable area only. No fraction math needed —
      // fov/aspect now directly describe the usable area's frustum.
      const distForH = screenH / 2 / Math.tan(fovRad / 2) + size.z * 0.5;
      const distForW = screenW / 2 / Math.tan(fovHRad / 2) + size.z * 0.5;

      const dist = Math.max(distForH, distForW) * (1 + fitPadding);

      cam.fov = fov;
      cam.aspect = usableAspect;
      cam.zoom = 1;

      // Slice/extend the rendered frustum from the usable-area-sized window
      // out to the full canvas, asymmetrically per buffer side.
      cam.setViewOffset(usableW, usableH, -bufLeft, -bufTop, canvasW, canvasH);
      return { cam, dist, viewDir };
    }
    return undefined;
  };

  const resetZoomOnGizmoClick = (): void => {
    const fit = fitCamera();
    if (!controls || !fit) {
      return;
    }

    const target = initialTargetRef.current.clone();
    // oxlint-disable-next-line typescript/no-unsafe-call -- oxlint's type-aware checker resolves OrbitControlsInstance as `any` (see the note on its declaration above); tsc resolves it correctly
    controls.target.copy(target);

    // Keep the current direction, the gizmo animates the rotation itself
    const dir = fit.cam.position.clone().sub(target).normalize();
    fit.cam.position.copy(target.add(dir.multiplyScalar(fit.dist)));
    fit.cam.updateProjectionMatrix();
    // oxlint-disable-next-line typescript/no-unsafe-call -- oxlint's type-aware checker resolves OrbitControlsInstance as `any` (see the note on its declaration above); tsc resolves it correctly
    controls.update();
    invalidate();
  };

  useLayoutEffect(() => {
    const fit = fitCamera();
    if (!fit) {
      return;
    }
    fit.cam.position.copy(fit.viewDir.multiplyScalar(fit.dist));
    fit.cam.updateProjectionMatrix();
    //}, [camera, viewPortAspect, canvasSize, bufferZones, view, scene, fitPadding]);
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- deps intentionally trimmed, see b290bc3e;
  }, [camera, viewPortAspect]);

  return (
    <>
      <PerspectiveCamera
        ref={perspectiveRef as unknown as React.RefObject<ThreePerspectiveCamera | null>}
        near={camera.near}
        far={camera.far}
        fov={camera.type === "Perspective" ? camera.fov : 75}
        aspect={viewPortAspect}
        manual={true}
        makeDefault={camera.type === "Perspective"}
      />
      <OrthographicCamera
        ref={orthographicRef as unknown as React.RefObject<ThreeOrthographicCamera | null>}
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
                // oxlint-disable-next-line typescript/no-unsafe-call typescript/no-unsafe-return -- oxlint's type-aware checker resolves OrbitControlsInstance as `any` (see the note on its declaration above); tsc resolves it correctly
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
                // oxlint-disable-next-line typescript/no-unsafe-call typescript/no-unsafe-return -- oxlint's type-aware checker resolves OrbitControlsInstance as `any` (see the note on its declaration above); tsc resolves it correctly
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
    setControls: (controls: OrbitControlsInstance) => void;
  }
): React.JSX.Element => {
  const ref = useRef<OrbitControlsInstance>(null);

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
