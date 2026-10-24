import { OrthographicCamera, PerspectiveCamera } from "three";
import { describe, expect, it } from "vitest";
import { vec3 } from "../../../abstract-3d.js";
import type { FitInput } from "./camera.js";
import { fitCamera } from "./camera.js";

const input: FitInput = { view: "front", size: vec3(4000, 2000, 1000), canvas: { width: 800, height: 400 }, bufferZones: {}, fitPadding: 0 };
const tan = Math.tan((45 * Math.PI) / 360);
const fitPerspective = (partial: Partial<FitInput> = {}): readonly [PerspectiveCamera, ReturnType<typeof fitCamera>] => {
  const camera = new PerspectiveCamera(45);
  return [camera, fitCamera(camera, { ...input, ...partial })];
};
const fitOrthographic = (partial: Partial<FitInput> = {}): ReadonlyArray<number> => {
  const camera = new OrthographicCamera();
  fitCamera(camera, { ...input, ...partial });
  return [camera.left, camera.right, camera.top, camera.bottom, camera.zoom];
};

describe("fitCamera", () => {
  it("fits nothing into an empty canvas", () => {
    expect(fitPerspective({ canvas: { width: 0, height: 400 } })[1]).toBeUndefined();
  });

  it("backs a perspective camera off until the scene's width and height fit, plus half its depth", () => {
    const [camera, placement] = fitPerspective();
    expect(placement!.distance).toBeCloseTo(Math.max(1000 / tan, 2000 / (tan * 2)) + 500);
    expect(placement!.direction).toEqual(vec3(0, 0, 1));
    expect(camera.aspect).toBe(2);
  });

  it("pads the distance", () => {
    expect(fitPerspective({ fitPadding: 0.1 })[1]!.distance).toBeCloseTo(fitPerspective()[1]!.distance * 1.1);
  });

  it("fits into the area inside the buffer zones, and offsets the view to it", () => {
    const [camera] = fitPerspective({ bufferZones: { left: 200, top: 100 } });
    expect(camera.aspect).toBeCloseTo(600 / 300);
    expect(camera.view).toMatchObject({ enabled: true, fullWidth: 600, fullHeight: 300, offsetX: -200, offsetY: -100, width: 800, height: 400 });
  });

  it("looks along each view, with the scene's size seen from it", () => {
    expect(fitPerspective({ view: "top" })[1]!.direction).toEqual(vec3(0, 1, 0));
    expect(fitPerspective({ view: "left" })[1]!.direction).toEqual(vec3(-1, 0, 0));
    // From the top, the scene is 4000 wide and 1000 high on screen, and 2000 deep
    expect(fitPerspective({ view: "top" })[1]!.distance).toBeCloseTo(Math.max(500 / tan, 2000 / (tan * 2)) + 1000);
  });

  it("frames orthographic cameras around the scene, extended by the buffer zones", () => {
    expect(fitOrthographic()).toEqual([-2000, 2000, 1000, -1000, 1]);
    // The usable area is 400 x 400, so the scene's 4000 width sets 10 world units per pixel
    expect(fitOrthographic({ bufferZones: { right: 400 } })).toEqual([-2000, 6000, 2000, -2000, 1]);
  });
});
