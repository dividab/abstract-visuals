import { exhaustiveCheck } from "ts-exhaustive-check";
import {
  vec2,
  Scene,
  Vec3,
  Mesh,
  vec3Rot,
  vec3Zero,
  vec3RotCombine,
  vec3,
  Vec2,
  Group,
  vec3TransRot,
  Material,
  rotationForCameraPos,
  sizeBoundsForCameraPos,
  Bounds2,
  bounds2FromPosAndSize,
  bounds2ToSize,
  bounds2Merge,
  vec2Zero,
  vec3Flip,
  vec2Add,
  View,
  vec3RotInverse,
} from "../../abstract-3d.js";
import { SvgOptions, zOrderElement } from "./svg-geometries/shared.js";
import { box } from "./svg-geometries/svg-box.js";
import { cylinder } from "./svg-geometries/svg-cylinder.js";
import { line } from "./svg-geometries/svg-line.js";
import { plane } from "./svg-geometries/svg-plane.js";
import { shape } from "./svg-geometries/svg-shape.js";
import { polygon } from "./svg-geometries/svg-polygon.js";
import { text } from "./svg-geometries/svg-text.js";
import { cone } from "./svg-geometries/svg-cone.js";
import { Optional } from "../../utils.js";
import { svg } from "./svg-encoding.js";
import { image } from "./svg-geometries/svg-image.js";

export type SvgScene = {
  readonly scene: Scene;
  readonly options?: Optional<SvgOptions>;
  readonly pos: Vec2;
};

export type SvgWithSize = { readonly image: string; readonly width: number; readonly height: number };

export function renderScenes(scenes: ReadonlyArray<SvgScene>, baseOptions?: Optional<SvgOptions>): SvgWithSize {
  const allElements = Array<zOrderElement>();
  const bounds = Array<Bounds2>();

  for (const view of scenes) {
    const { elements, size, center } = renderInternal(view.scene, { ...baseOptions, ...view.options }, view.pos);
    allElements.push(...elements);
    const newBounds = bounds2FromPosAndSize(center, size);
    bounds.push(newBounds);
  }
  const mergedBounds = bounds2Merge(...bounds);
  const size = bounds2ToSize(mergedBounds);
  const image = svg(
    mergedBounds.min,
    size,
    allElements.reduce((a, { element }) => `${a} ${element}`, "")
  );
  return { image, width: size.x, height: size.y };
}

export function render(scene: Scene, options?: Optional<SvgOptions>): SvgWithSize {
  const { elements, size, center } = renderInternal(scene, options, vec2Zero);

  const image = svg(
    vec2(center.x - size.x / 2, center.y - size.y / 2),
    size,
    elements.reduce((a, { element }) => `${a} ${element}`, "")
  );
  return { image, width: size.x, height: size.y };
}

function renderInternal(
  scene: Scene,
  options: Optional<SvgOptions> | undefined,
  offset: Vec2
): {
  readonly elements: ReadonlyArray<zOrderElement>;
  readonly size: Vec2;
  readonly center: Vec2;
} {
  const opts: SvgOptions = {
    view: options?.view ?? "front",
    stroke_thickness: options?.stroke_thickness ?? 2,
    only_stroke: options?.only_stroke ?? false,
    gray_scale: options?.gray_scale ?? false,
    background: options?.background ?? "rgba(255,255,255,0)",
    font: options?.font ?? "",
    imageDataByUrl: options?.imageDataByUrl ?? {},
    rotation: options?.rotation ?? 0,
    imageBg: options?.imageBg ?? false,
  };
  const cameraRot = rotationForCameraPos(opts.view);
  const viewRot = opts.rotation ? vec3RotCombine(vec3(0, 0, (opts.rotation * Math.PI) / 180), cameraRot) : cameraRot;
  const unitRot = vec3RotCombine(viewRot, scene.rotation_deprecated ?? vec3Zero);
  const textCorrection = dimensionTextCorrection(viewRot, unitRot);

  const unitCenter = vec3Rot(scene.center_deprecated ?? vec3Zero, vec3Zero, rotationForCameraPos(opts.view));
  const [unitSize] = sizeBoundsForCameraPos(scene.size_deprecated, unitCenter, unitRot);
  const svgSize = vec2(unitSize.x + 1.5 * opts.stroke_thickness, unitSize.y + 1.5 * opts.stroke_thickness);
  const svgCenter = vec2(offset.x + opts.stroke_thickness * 0.75, offset.y + opts.stroke_thickness * 0.75);
  const point = (x: number, y: number): Vec2 => vec2(svgCenter.x + x, svgCenter.y - y);
  const unitCenterFlipped = vec3Flip(unitCenter);

  const elements = Array<zOrderElement>();
  for (const g of scene.groups) {
    elements.push(...svgGroup(g, unitCenterFlipped, unitRot, point, opts));
  }
  const dimOpts: SvgOptions = { ...opts, only_stroke: false, gray_scale: false };
  elements.sort((a, b) => a.zOrder - b.zOrder);

  const cameraPositionForView = (view: View): Vec3 => {
		switch (view) {
			case "front":
				return vec3(0, 0, 1);
			case "back":
				return vec3(0, 0, -1);
			case "top":
				return vec3(0, 1, 0);
			case "bottom":
				return vec3(0, -1, 0);
			case "right":
				return vec3(1, 0, 0);
			case "left":
				return vec3(-1, 0, 0);
      default:
        return vec3(0, 0, 1);
		}
	};

  console.log({
    view: opts.view,
    sceneRotation: scene.rotation_deprecated,
    textCorrection,
    textCorrectionDegrees: textCorrection * 180 / Math.PI,
  });

	const cam = vec3Rot(
		cameraPositionForView(opts.view),
		vec3Zero,
		scene.rotation_deprecated ?? vec3Zero
	);

	const visibleViews = {
  	[cam.x >= 0 ? "right" : "left"]: opts.view === "right" || opts.view === "left",
		[cam.y >= 0 ? "top" : "bottom"]: opts.view === "top" || opts.view === "bottom",
		[cam.z >= 0 ? "front" : "back"]: opts.view === "front" || opts.view === "back",
	};

  for (const d of scene.dimensions_deprecated?.dimensions ?? []) {
    if(d.views[0] && visibleViews[d.views[0]] === true) {
      const pos = vec3TransRot(d.pos, unitCenterFlipped, unitRot);
			const rot = vec3RotCombine(unitRot, d.rot);
      for (const m of d.meshes) {
        elements.push(...svgMesh(m, pos, rot, point, scene.dimensions_deprecated?.material ?? { normal: "" }, dimOpts, textCorrection));
      }
    }
  }
  return { elements, size: svgSize, center: svgCenter };
}

function svgGroup(
  g: Group,
  parentPos: Vec3,
  parentRot: Vec3,
  point: (x: number, y: number) => Vec2,
  opts: SvgOptions
): ReadonlyArray<zOrderElement> {
  const pos = vec3TransRot(g.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, g.rot ?? vec3Zero);
  const elements = Array<zOrderElement>();
  for (const m of g.meshes ?? []) {
    elements.push(...svgMesh(m, pos, rot, point, m.material, opts));
  }
  for (const sg of g.groups ?? []) {
    elements.push(...svgGroup(sg, pos, rot, point, opts));
  }
  return elements;
}

function svgMesh(
  mesh: Mesh,
  parentPos: Vec3,
  parentRot: Vec3,
  point: (x: number, y: number) => Vec2,
  material: Material,
  opts: SvgOptions,
  textCorrection: number = 0
): ReadonlyArray<zOrderElement> {
  switch (mesh.geometry.type) {
    case "Box":
      return box(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Plane":
      return plane(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Cylinder":
      return cylinder(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Cone":
      return cone(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Line":
      return line(mesh.geometry, point, material.normal, opts, parentPos, parentRot);
    case "Polygon":
      return polygon(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Shape":
      return shape(mesh.geometry, point, material, opts, parentPos, parentRot);
    case "Text":
      return text(mesh.geometry, point, material.normal, opts, parentPos, parentRot, textCorrection);
    case "Image":
      return image(mesh.geometry, point, opts, parentPos, parentRot);
    case "Tube":
    case "Sphere":
      return [];
    default:
      return exhaustiveCheck(mesh.geometry);
  }
}

function signedAngle2D(from: Vec2, to: Vec2): number {
  const fromLength = Math.hypot(from.x, from.y);
  const toLength = Math.hypot(to.x, to.y);

  if (fromLength < 1e-6 || toLength < 1e-6) {
    return 0;
  }

  const fromX = from.x / fromLength;
  const fromY = from.y / fromLength;
  const toX = to.x / toLength;
  const toY = to.y / toLength;

  const dot = fromX * toX + fromY * toY;
  const cross = fromX * toY - fromY * toX;

  return Math.atan2(cross, dot);
}

function dimensionTextCorrection(
  viewRot: Vec3,
  unitRot: Vec3
): number {
  /*
   * Find the 3D direction that normally appears as page-up
   * for this view.
   *
   * viewRot transforms it into camera-space +Y, which later
   * becomes SVG -Y through point().
   */
  const pageUpInSceneSpace = vec3Rot(
    vec3(0, 1, 0),
    vec3Zero,
    vec3RotInverse(viewRot)
  );

  /*
   * Now apply the actual view + scene rotation.
   */
  const transformedPageUp = vec3Rot(
    pageUpInSceneSpace,
    vec3Zero,
    unitRot
  );

  /*
   * Convert to SVG coordinates. SVG Y points downward.
   */
  const actualSvgUp = vec2(
    transformedPageUp.x,
    -transformedPageUp.y
  );

  const desiredSvgUp = vec2(0, -1);

  return signedAngle2D(actualSvgUp, desiredSvgUp);
}