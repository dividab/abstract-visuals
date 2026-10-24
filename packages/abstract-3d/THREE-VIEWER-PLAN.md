# Plan: abstract-3d viewer on raw three.js

Replace the r3f renderer with a three.js viewer, plus a thin React wrapper. The current React renderer is deleted, not migrated: 4.0.0 gets a clean API.

Goals, in order:

1. It runs smoothly on weak graphics cards.
2. It looks clean and polished, and as real as costs nothing per frame: realism comes from the data (material types, edge radii) and from work done once per scene, not from post-processing.
3. The code is small and readable.

Particle effects (airflow, smoke, rain, spray) come later, but the frame loop has room for them from the start.

The other renderers (dxf, step, ifc, stl, svg) are unaffected; they ignore the viewer-only fields (`type`, `castShadow` and `radius`).

## Status (2026-10-24)

Phases 0–4 are implemented: `src/renderers/three/` (the viewer), `src/renderers/react/react.tsx` (the wrapper), the r3f renderer deleted, the example app migrated. 4.0.0 is in beta on npm's `beta` tag. `pnpm test:abstract-3d` covers compile, appearance (material classes, types, shadow casting), geometry (shared unit geometries, edge radii), text layout, build (batching, picking, repaint, animation, culling, dispose), camera fit and the quality governor. `pnpm typecheck:tests` type-checks the tests and the bench. `pnpm bench:abstract-3d` measures the scene layer in Node, and `pnpm bench:abstract-3d:browser` frame times, draw calls, memory over scene swaps and screenshots in headless Chromium.

Measured in headless Chromium (software GPU, so CPU side only), systemair3 with its materials typed and boxes rounded as in the example app:

|                          | ×1  | ×4  | ×9  |
| ------------------------ | --- | --- | --- |
| Draw calls               | 55  | 55  | 55  |
| CPU per frame (ms)       | 1.0 | 1.5 | 2.6 |
| Hover update (ms)        | 0.4 | 0.8 | 1.2 |
| Time until ready (ms)    | 735 | 820 | 920 |
| JS heap once loaded (MB) | 42  | 43  | 46  |

In Node, compiling, building and disposing systemair3 takes 5.0, 11.2 and 26 ms (×1, ×4, ×9), a pick 0.1, 0.4 and 1.0 ms, and a hover repaint 8–35 µs.

Draw calls include the viewcube's (about 26) and a batch per material type; the shadow map isn't rendered per frame, so it adds none. Time until ready includes loading the studio HDRI and compiling the physical materials, which the earlier 175–480 ms didn't have. Over 150 scene swaps GPU geometries, textures and programs stay flat (33, 54, 17) and the heap at 41–45 MB, and an idle viewer renders no frames.

The viewer is 2,235 lines without tests, comments and the HDRI's data, against 1,667 for the r3f renderer.

Where the implementation departs from this plan:

- **Renderer:** the classic `WebGLRenderer` and GLSL, the classic stack below, so WebGL libraries run as they are: `LineMaterial`, `three-viewport-gizmo` and `CSS2DRenderer`. `WebGPURenderer` cost about 230 lines of our own replacements for them, and on its WebGL2 fallback took 1.6–4 times longer until ready with up to 40% more CPU per frame; WebGPU itself draws a `BatchedMesh` as one draw per instance, as it has no multi-draw. WebGPU waits until particles need compute, or three batches on it.
- **No post-processing:** ambient occlusion (N8AO, and before it GTAO) looked noisy at a cost weak GPUs can't pay, so it's removed. Quality tiers set the resolution only: `high`, the default, the screen's pixel ratio as the r3f renderer, and `auto` drops to 1 when moving gets slow.
- **Lighting:** a photographed studio HDRI (Poly Haven's Studio Small 08, CC0, 512×256, bundled as a chunk loaded on demand) and a key light from the upper left front, whose shadows let 40% of it through, instead of an ambient light and directional lights. There's no other environment and no default lights; `lights` adds to them.
- **Shadows, each rendered once per scene:** a contact shadow on the ground, in a faint pool of light so it shows on dark backgrounds, both alpha-dithered against 8-bit banding; and the key light's shadow map, the solids' shadows on themselves. A material's `castShadow: false` keeps symbols and markers out of both.
- **Materials:** `Material.type` (painted, galvanized, aluminum, stainless, copper, plastic, rubber, fabric, glass) picks a `MeshPhysicalMaterial` finish, e.g. a clearcoat on paint and a sheen on fabric; a type that isn't one, e.g. a number from a database, is ignored. Each type is a batch.
- **Rounded edges:** `Box.radius` shades a box's edges as rounded by it, the normal of a rounded box from its signed distance function, at least two pixels wide so far edges stay smooth; no extra geometry, a shared unit geometry per radius.
- **Text:** our SDF atlas from the system font, in a `ShaderMaterial`, not troika, which needs a font file.
- **Camera:** the r3f renderer's, ported exactly: its fit math (identical in 1,296 compared cases), OrbitControls with damping, refitting only for a new camera or canvas aspect and keeping the panned target. Not camera-controls; two control implementations were redundant. The gizmo animates its own turns, and redraws its labels once web fonts load.
- **API:** flat options with the 3.x prop names (`options.ts`) instead of the grouped options sketched below. `updateViewer` takes the options that changed and redoes what a static table says each one needs, batched into the next frame; telling what changed is the caller's, so the React wrapper passes each group of props from an effect, and compares the few that would refit, rebuild or recreate the gizmo by value. The viewer is plain state with module functions (`createViewer`, `updateViewer`, `invalidate`, `disposeViewer`), as is every module: no closure factories. A resize renders right away, so the canvas never shows blank.
- **Fallback:** rendered by the React wrapper until the viewer's `onLoad`, not by the viewer.
- **Layout:** a folder per concern, each with its source and tests: `compile`, `appearance`, `geometry`, `text`, `build` (parts, materials), `camera` (controls, gizmo), `shadow` (ground shadow, key light), `environment` (the HDRI), `quality` and `viewer` (options, overlays).

## Sources

- **Batching:** three.js `BatchedMesh` and its `webgpu_mesh_batch` example; per-instance color as in three's `InstancedMesh` examples.
- **Text:** signed distance field glyphs from the system font with an atlas, the approach of Mapbox GL JS, through its `@mapbox/tiny-sdf`; layout constants (line height 1.5, centered anchors) from drei's `Text` (troika).
- **Camera fit, buffer zones, gizmo reset and pausing hover while orbiting:** the r3f renderer's `react-camera.tsx`, ported as it was.
- **Gizmo:** `three-viewport-gizmo`, with the options of drei's `GizmoViewcube` and `GizmoViewport` mapped to it.
- **Lighting:** Poly Haven's Studio Small 08 HDRI through three's `HDRLoader`; a key light with its shadow map rendered on demand, as three's `shadowMap.autoUpdate = false` examples.
- **Ground shadow:** three.js's `webgl_shadow_contact` example, rendered once as drei's `ContactShadows` with `frames={1}`.
- **Rounded edges:** Inigo Quilez's rounded box signed distance function (`sdRoundBox`), its normal used on the sharp box.
- **Render on demand and batched updates:** r3f's `frameloop="demand"`, r3f applying props in the next frame, and three's `OrbitControls` damping loop.
- **Overlays:** three's `CSS2DRenderer`, as drei's `Html` places elements.
- **Lines:** three.js `LineSegments2` with `LineMaterial`; culled dimension lines as the r3f renderer's shader did, on the CPU per camera move.

Not done yet:

- Filling in `type`, `castShadow` and `radius` in the real scene data; the example app derives them from material names. The material database already has a numeric `type` of its own, which collides with `Material.type` in TypeScript.
- Frame times on a weak GPU.
- Realism without post-processing: brushed (anisotropic) aluminum, fine normal maps for galvanized spangle and paint grain; a path-traced photo mode at rest, opt-in, for which three-gpu-pathtracer needs an unbatched scene and loses text and dimensions.
- A test that the shader insertions (rounded edges, clearcoat) still find three's chunks after a three upgrade.
- The selection outline, the effect hook (`addEffect`), pausing when offscreen, `buildScene` without batching for `GLTFExporter`, fitting to everything drawn (opt-in, as the camera must stay the r3f renderer's), a fallback without WebGL.
- 4.0.0 out of beta, with the betas' CHANGELOG section merged into it.

## Why raw three.js

- **The measured gains come from building the scene imperatively,** not from React. The PoC's numbers (systemair3, 1,247 meshes, below) are the floor; batching goes further.
- **We need full control of the frame:** render on demand vs a continuous loop, cheap frames while moving and full quality at rest, and the render order of effects. That control is direct in plain three and indirect through r3f.
- **drei's `Text`, `@react-three/postprocessing` and `n8ao` would be replaced anyway** (see Decisions), so r3f would end up as a reconciler around imperative code.
- **Fewer dependencies and no lockstep upgrades.** Only three and React matter, and the core works without React.

PoC baseline: r3f renderer vs a three.js layer that instances primitives (headless Chromium, software GPU, AO off):

|                          | r3f 1× | three 1× | r3f 4× | three 4× | r3f 9× | three 9× |
| ------------------------ | ------ | -------- | ------ | -------- | ------ | -------- |
| Draw calls               | 1,279  | 349      | 5,116  | 1,345    | 11,511 | 3,005    |
| CPU per frame (ms)       | 4.5    | 1.3      | 18.9   | 4.5      | 42.6   | 10.0     |
| Hover update (ms)        | 25.9   | 1.0      | 127    | 3.0      | 267    | 5.6      |
| Time until ready (ms)    | 642    | 265      | 982    | 428      | 1,646  | 545      |
| JS heap once loaded (MB) | 103    | 72       | 186    | 91       | 321    | 122      |

## Decisions

| Area            | Choice                                                                                                                                                                              | Why                                                                                                                                                                                      |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Renderer        | `WebGPURenderer` from `three/webgpu`, written in TSL, running on its WebGL2 backend (`forceWebGL: true`). Turning on WebGPU is a flag, used once it's mature                        | One codebase for both backends, so waiting for WebGPU costs nothing. Phase 0 checks the WebGL2 backend against classic `WebGLRenderer`; if it's slower, we use the classic stack (below) |
| Geometry        | `BatchedMesh` per material class; boxes, planes, spheres, cylinders and cones as scaled unit geometries                                                                             | Draw calls drop to roughly the number of material classes, regardless of scene size; per-object frustum culling built in                                                                 |
| State           | Per-instance RGBA color (`BatchedMesh.setColorAt` with a `Vector4`)                                                                                                                 | Hover, selection and disabled opacity are one texture write, with no rebuild                                                                                                             |
| Quality         | Tiers `low`, `medium` and `high`, plus `auto`, which picks one from measured frame times and keeps adapting                                                                         | Weak GPUs get cheap frames; stronger ones get AO and better transparency                                                                                                                 |
| Post-processing | `RenderPipeline` from `three/addons/tsl/display`: GTAO `ao()`, OIT, SMAA, TRAA; which ones run depends on the tier                                                                  | All from three; nothing extra to keep compatible                                                                                                                                         |
| Look            | `NeutralToneMapping`, `RoomEnvironment` through PMREM, today's default lights                                                                                                       | Clean and true to product colors; the environment is computed once and costs nothing per frame                                                                                           |
| Lines           | `LineSegments2` with `Line2NodeMaterial`, batched by thickness; `CulledLine` as a TSL node                                                                                          | One draw call per thickness                                                                                                                                                              |
| Text            | Signed distance field (SDF) glyphs from the OS's built-in font (`Helvetica, Arial, sans-serif`), rasterized with `@mapbox/tiny-sdf` into an atlas; one instanced quad per character | No font file to load, every character the OS has (å, ä, ö, ...), 4 vertices per character, and one draw call for all text. troika doesn't work with `WebGPURenderer`                     |
| Camera controls | `camera-controls` (yomotsu, MIT, peer `three`)                                                                                                                                      | Animated view changes, `setFocalOffset` for buffer zones, and `update(delta)` reports movement, which fits render on demand                                                              |
| Picking         | Our own `Raycaster` against a pick table (batch and instance → group id); effects on a layer it skips                                                                               | We build the scene, so a lookup replaces an event library                                                                                                                                |
| Gizmo           | `three-viewport-gizmo` (cube and sphere types)                                                                                                                                      | Viewcube with labels and hover. The fallback is our own viewcube in a scissored viewport, like three's `ViewHelper`                                                                      |
| Overlays        | HTML elements positioned from projected anchors; the React wrapper portals content into them                                                                                        | App context (theme, i18n) stays inside popovers and tooltips                                                                                                                             |
| `three`         | Peer dependency                                                                                                                                                                     | Apps that add their own objects must share one copy of three                                                                                                                             |
| React           | Optional peer dependency                                                                                                                                                            | `abstract-3d/three` works without React                                                                                                                                                  |

**Classic stack** (used only if phase 0 finds the WebGL2 backend of `WebGPURenderer` slower than `WebGLRenderer` on a weak GPU). Everything not listed here stays the same:

| Area                | TSL stack                  | Classic stack                               |
| ------------------- | -------------------------- | ------------------------------------------- |
| Post-processing, AO | `RenderPipeline`, GTAO     | pmndrs `postprocessing` with `N8AOPostPass` |
| Transparency        | OIT on `high`, else sorted | Sorted (`BatchedMesh.sortObjects`)          |
| Lines, `CulledLine` | `Line2NodeMaterial`, TSL   | `LineMaterial`, today's GLSL                |
| SDF text material   | TSL node                   | `ShaderMaterial`                            |

## Architecture

The scene goes through four layers. Each one depends only on the layers before it:

1. **compile** (pure, no GPU): `Scene` → flat `SceneItem`s, each with a world matrix, a shape key, a material class, a color and its group, dimension or relation id. Unit-tested in Node.
2. **build**: items → three objects (batches, lines, text, image meshes), plus the pick table, the state repaint, the animation update and disposal.
3. **viewer**: renderer, render pipeline, camera, controls, input, overlays, gizmo, effects and the frame loop.
4. **react**: lifecycle and portals.

```
src/renderers/three/
  index.ts          public: createViewer, buildScene, types
  compile.ts        Scene → SceneItem[] (pure): world matrices, material classes, ids, dimensions, relations
  geometry.ts       shape → BufferGeometry, cached by shape key: unit primitives, holes, extrusions, tubes (absorbs shared/three-geometry.ts)
  materials.ts      material class → material; textures from URLs and abstract-image
  lines.ts          LineSegments2 batches and the CulledLine material
  text.ts           SDF glyph atlas from the system font, text layout, instanced quads
  build.ts          items → batches, pick table, setState, tick (animations), dispose
  viewer.ts         createViewer: options diff, frame loop, resize, dpr, loading state
  quality.ts        tiers, auto selection from frame times, render pipeline per tier
  camera.ts         fit math (pure, unit-tested) and camera-controls setup
  input.ts          pointer → pick → group callbacks, hover, cursor, paused while dragging
  overlays.ts       anchors projected each frame, hidden behind the camera
  gizmo.ts          viewcube and axes, click to view and reset
  effects/          effect API, later particles
src/renderers/react/
  react.tsx         the wrapper
```

### Code principles

- **Closures and plain objects, no classes and no `this`**, following the repo's direction for the `functional` lint plugin. Mutation stays inside three objects owned by `build.ts` and `viewer.ts`.
- **Logic goes in pure functions** (compile, fit math, options diff, text layout, tier selection) and is tested without WebGL. The three.js code turns their results into objects.
- **Every GPU resource has an owner.** `buildScene()` and `createViewer()` return `dispose()`, and tests check that `renderer.info.memory` returns to its baseline.
- **No allocation per frame:** scratch vectors at module level, and no closures inside the loop.
- **One table decides what each option changes** (see the API). There are no scattered `if (changed)` checks.

### API

```ts
const viewer = createViewer<Content>(container, {
  scene, // Scene | undefined
  state: { selectedIds, hoveredIds, activeComponents, activeRelations, showDimensions },
  camera: { type, fov, near, far, view, bufferZones, fitPadding },
  controls, // camera-controls options subset
  gizmo, // { type: "cube" | "axes", placement, offset, colors, resetOnClick }
  look: { lights, environment, quality, outlineSelection, exposure },
  overlays: { popovers, getTooltips, fallback, onChange },
  events: { onClickGroup, onHoverGroup, onContextMenuGroup, onClickRelation },
  createGroupId,
});
viewer.update(options); // any subset, applied through the diff table
viewer.fitView(view, { animate: true });
viewer.addEffect(effect); // returns a function that removes it
viewer.three; // { renderer, scene, camera, controls }, for apps that add their own objects
viewer.dispose();
```

How `update()` applies each option:

| Option                             | Compared by  | Effect                                    |
| ---------------------------------- | ------------ | ----------------------------------------- |
| `scene`, `createGroupId`           | Reference    | Rebuild, then refit if the bounds changed |
| `state.*`                          | Contents     | Repaint instance colors, then render      |
| `camera.*`                         | Value        | Refit, animated                           |
| `look.*`                           | Value        | Rebuild the render pipeline               |
| `controls`, `gizmo`                | Value        | Reconfigure                               |
| `events.*`, `overlays.getTooltips` | Not compared | Stored; read on next use                  |

Events receive `{ groupId, point, nativeEvent }`, not three objects.

### React wrapper (about 80 lines)

- `useLayoutEffect`: `createViewer` on mount, `dispose` on unmount.
- `useLayoutEffect`: `viewer.update(props)` on every render. The diff is in the core, so the wrapper needs no memoization.
- `overlays.onChange`: stores `{ key, element, content }[]` in state and renders each with `createPortal(content, element)`.
- If it grows past about 80 lines, the logic belongs in the core.

## Look and quality

The look is clean and readable, like a good product illustration: environment lighting, true colors, soft contact shading and sharp text. No shadows, reflections or other effects that are there only for realism.

The quality tiers spend GPU time where it shows. The camera is still most of the time, and a still frame can afford effects a moving one can't:

| Tier     | While moving                             | At rest (rendered once, then the loop stops)        |
| -------- | ---------------------------------------- | --------------------------------------------------- |
| `low`    | Direct render, no post-processing, dpr 1 | Same, at full dpr                                   |
| `medium` | Direct render, no post-processing, dpr 1 | GTAO at half resolution and SMAA, at full dpr       |
| `high`   | GTAO and SMAA                            | GTAO, OIT for transparent panels, a few TRAA frames |

- **`auto`** (the default) starts at `medium`, measures frame times and moves between tiers, lowering dpr before dropping a tier.
- **Transparency** is sorted on `low` and `medium` and uses OIT on `high`.
- **Selection** is today's recolor, plus an optional `outline()` around selected groups on `high`.
- **On a tier change while at rest**, the frame with AO fades in over a few frames instead of popping.

## Performance

- **Draw calls:** `BatchedMesh` per material class (opacity bucket, metalness, roughness, side, textured or not). Identical shapes share one geometry; primitives use unit geometry and scale.
- **Render on demand:** frames render on invalidation (controls movement, state, resize, overlays) or while an effect or animation is active. The loop stops when nothing is active and pauses when the canvas is offscreen (`IntersectionObserver`) or the tab is hidden.
- **No first-frame hitch:** `await renderer.init()`, then `renderer.compileAsync(scene, camera)` before the fallback overlay is removed.
- **Hover:** one raycast per frame at most, coalesced from `pointermove`. If it's measured slow on big scenes, add `three-mesh-bvh` for large geometries, or read an id attachment from the scene pass (GPU picking).
- **Time until ready:** measure first. If geometry generation dominates, move it to a worker with transferable buffers.
- **Animations:** animated groups update their instances' matrices (`setMatrixAt`), with no separate objects.
- **Export:** `GLTFExporter` doesn't support `BatchedMesh`, so `buildScene(scene, { batched: false })` builds plain meshes from the same items.

## Effects (particles, smoke, rain)

How realistic the effects are is not decided yet (see Open decisions). This plan only adds what any approach needs:

- **Hook:** `viewer.addEffect({ object, update(dt), active(), dispose })`. Effect objects go on their own layer (never picked). While any effect is active, the loop keeps running.
- **Budget:** each effect gets a particle count per quality tier.
- **Determinism:** a seeded RNG, a fixed time step, and `viewer.setTime(t)` and pause for stable screenshots.
- **Later:** a declarative `Scene.effects` in `abstract-3d.ts` that the other renderers ignore, for example flow along a relation, colored by `airType`.

## Features to keep (from today's renderer)

- Groups, meshes and all geometry types; materials; hover and selection colors; disabled opacity; images, SVG and abstract-image textures; `materialStateImages`; `useAlphaTest`
- Text, `Line`, `CulledLine`; `g.animation`; the scene's `center_deprecated` and `rotation_deprecated`, applied in compile
- Dimensions, `showDimensions`, clickable dimension ids
- Relations, `activeRelations`, outline and hover, `onClickRelation`; only Accept groups clickable while relations are active
- Group click, hover and context menu; cursor; pointer events paused while orbiting
- Popovers, tooltips of the hovered group, the fallback while loading and when there's no scene
- Perspective and orthographic cameras, `view`, `bufferZones`, `fitPadding`, refit on resize
- Viewcube and axes gizmos, `resetZoomAndPanOnClick`, placement and margin
- Default lights, `useOldMode` light intensities, custom lights, dpr, `className`, `style`, `createGroupId`

Dropped: `createGroupKey`, `useAnimations`, `canvasProps` (now `className`, `style`, `rendererParameters`), drei's prop types, and r3f's `ThreeEvent`.

## Phases

Each phase leaves `pnpm build` and `pnpm test` green. The old renderer stays until phase 4.

### Phase 0: harness and spikes

- Benchmark and screenshot harness (`packages/abstract-3d/bench`, a Vite page plus Playwright). It measures draw calls, CPU per frame, GPU time, hover update, time until ready and heap, and screenshots each scene, view and camera type. Commit it before anything else.
- Run it on a reference machine with a weak integrated GPU as well as headless; software rendering says nothing about the GPU.
- Spikes, each a small page in the harness:
  1. `BatchedMesh` on systemair3 ×1, ×4 and ×9: draw calls, hover repaint, picking.
  2. Renderer: `WebGPURenderer` on WebGL2 vs classic `WebGLRenderer` (and WebGPU for reference) on the weak GPU: frame time while orbiting, the GTAO frame at rest, and time until ready including shader compilation. This decides between the TSL and classic stacks.
  3. SDF text from the system font next to troika, at small and large sizes, on macOS, Windows and Linux.
  4. `three-viewport-gizmo` and camera-controls with the chosen renderer.
- Exit: the numbers are in this plan, and the stack is chosen.

### Phase 1: compile and build

- `compile.ts` with tests: matrices, material classes, ids, dimensions, relations, deprecated center and rotation.
- `geometry.ts`, `materials.ts`, `lines.ts`, `text.ts`, `build.ts`: batches, pick table, `setState`, animations, `dispose`, and the unbatched mode for export.
- Tests: batching, pick → group id, state repaint, text layout, dispose returning memory to baseline.

### Phase 2: viewer

- `viewer.ts`: renderer init, options diff, frame loop with the effect hook, resize, dpr, loading state.
- `camera.ts`: port the fit math from `react-camera.tsx` as a pure function with tests (view offset, orthographic frustum, buffer zones, fitPadding, views), applied through camera-controls with animation.
- `input.ts`, `overlays.ts`, `gizmo.ts`.

### Phase 3: look and quality

- `quality.ts`: the tiers, `auto`, the render pipeline per tier, the fade-in at rest.
- Tune the look on the weak GPU first, then check that `high` is worth it on a strong one.

### Phase 4: React and switch-over

- The wrapper; migrate the example app; delete `src/renderers/react/*` except the wrapper, and the r3f custom typings.
- Remove `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` and `suspend-react`. Add `camera-controls`, `three-viewport-gizmo` and `@mapbox/tiny-sdf`. Make `three`, `react` and `react-dom` peers.

### Phase 5: release 4.0.0

- README migration section, CHANGELOG, and the benchmark on the reference machine.

### Later: effects

- Once the realism level is decided: the simulation approach, `Scene.effects` in the model, and a benchmark with effects running on the weak GPU.

## Acceptance criteria

- systemair3 ×4, measured the same way as the PoC:
  - draw calls ≤ 100, and roughly flat from ×1 to ×9;
  - hover update ≤ 3 ms;
  - CPU per frame ≤ 4.5 ms, including controls and input;
  - time until ready ≤ 450 ms, including shader compilation;
  - JS heap ≤ 100 MB.
- On the reference weak GPU at 1080p with `auto`: 60 fps while orbiting systemair3 ×4, and the full-quality frame at rest within 100 ms after the camera stops.
- `renderer.info.memory` returns to its baseline after 10 scene swaps and after `dispose()`.
- Works without React installed.
- Screenshot review passed for `demo`, `systemair3` and `systemair6`: front, top and orbit views; perspective and orthographic; hover, selection, active relations, dimensions on, and the gizmo visible.

## Risks

- **The WebGL2 backend of `WebGPURenderer`** may be slower than classic `WebGLRenderer`. Spike 2 measures it, and the classic stack is the fallback.
- **System fonts differ by OS** (Helvetica on macOS, Arial on Windows, Liberation Sans or similar on Linux), so text widths differ slightly. The screenshot harness pins the font on Linux. Text building needs a canvas (`OffscreenCanvas` in workers and Node exports).
- **SDF text** rounds sharp corners at very large sizes. That's acceptable for a simple sans-serif font.
- **`three-viewport-gizmo`:** its last release was March 2025. The fallback is our own viewcube, about 200 lines.
- **Async renderer init:** the first frame waits for `renderer.init()`. The loading state covers it.

## Open decisions

1. **Particle realism:** postponed until the effects work starts.
2. **Reference weak GPU:** which machine sets the performance targets, e.g. a laptop with Intel UHD 620-class graphics?
