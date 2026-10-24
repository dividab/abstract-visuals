/* oxlint-disable no-console, vitest/expect-expect -- benchmarks print their results and assert nothing */
import { PerspectiveCamera, Raycaster, Vector2 } from "three";
import { test } from "vitest";
import type { Scene } from "../src/abstract-3d.js";
import { buildScene, disposeScene, getPickables, paintScene } from "../src/renderers/three/build/build.js";
import { compileScene } from "../src/renderers/three/compile/compile.js";
import type { GlyphBitmap } from "../src/renderers/three/text/text.js";
import { createGlyphAtlas, SDF_BUFFER } from "../src/renderers/three/text/text.js";
import { createGroupId, repeatScene, scenes } from "./scenes.js";

/** CPU cost of the scene layer in Node: compile, build, hover repaint and picking, at 1, 4 and 9 copies of systemair3 */

const rasterize = (): GlyphBitmap => {
  const [width, height] = [20 + 2 * SDF_BUFFER, 40 + 2 * SDF_BUFFER];
  return {
    data: new Uint8ClampedArray(width * height),
    width,
    height,
    glyphWidth: 20,
    glyphHeight: 40,
    glyphLeft: 0,
    glyphTop: 30,
    glyphAdvance: 24,
  };
};
const structure = { relationsActive: false };
const build = (scene: Scene): ReturnType<typeof buildScene> =>
  buildScene(compileScene(scene, createGroupId), { structure, geometries: new Map(), atlas: createGlyphAtlas(rasterize) });

const repeated = [1, 4, 9].map((n) => [n, repeatScene(scenes["systemair3"]!, n)] as const);

test("scene sizes", () => {
  console.table(
    repeated.map(([n, scene]) => ({
      copies: n,
      groups: scene.groups.length,
      items: compileScene(scene, createGroupId).items.length,
      drawCalls: build(scene).parts.length,
    }))
  );
});

repeated.forEach(([n, scene]) => {
  test(`systemair3 ×${n}`, async ({ bench }) => {
    const built = build(scene);
    const flip = { target: 0 };
    const camera = new PerspectiveCamera(45, 16 / 9, 100, 100000);
    camera.position.set(0, 0, scene.size_deprecated.x * 1.5);
    camera.updateMatrixWorld();
    built.root.updateMatrixWorld();
    const raycaster = new Raycaster();
    const pointer = new Vector2();
    await bench.compare(
      bench("compile", () => {
        compileScene(scene, createGroupId);
      }),
      bench("compile + build + dispose", () => {
        disposeScene(build(scene));
      }),
      bench("hover repaint", () => {
        flip.target = flip.target === 0 ? 1 : 0;
        paintScene(built, { ...structure, dimensionsClickable: true, hoveredTarget: flip.target });
      }),
      bench("pick", () => {
        pointer.set(Math.random() * 2 - 1, Math.random() * 2 - 1);
        raycaster.setFromCamera(pointer, camera);
        raycaster.intersectObjects(getPickables(built), false);
      })
    );
  });
});
