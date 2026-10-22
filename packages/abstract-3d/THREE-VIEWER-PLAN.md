# Plan: raw three.js viewer with a thin React wrapper

Replace the r3f-based React renderer with two layers:

1. **`abstract-3d/three`**: a framework-agnostic three.js layer, exported for any app (React, Vue, vanilla) and usable headless (e.g. building a scene for three's `GLTFExporter`). It has two levels:
   - `buildScene()`: turns a `Scene` into an `Object3D` tree, with instancing, picking, hover/selection state and disposal.
   - `createViewer()`: the full interactive viewer. Renderer, render loop, camera fitting, orbit controls, gizmos, pointer events, overlays and ambient occlusion.
2. **`abstract-3d/react`**: a thin React component around `createViewer()`. It depends only on `react`, `react-dom` and the core, with no `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` or `suspend-react`.

The other renderers (dxf, step, ifc, stl, svg) are unaffected.

## Why: measured and estimated benefits

### Performance (measured)

The PoC `buildScene()` layer and the benchmark harness were built locally to get these numbers and were not committed. Phase 0 re-implements the layer.

The benchmark compared the current r3f renderer with the PoC `buildScene()` layer on the real `systemair3` scene (1,247 meshes) and on copies of it repeated 4× and 9×. Setup:

- Headless Chromium on WSL, 1280×720, medians of one run per configuration.
- Same lights, antialiasing and tone mapping in both, AO off in both.
- Both rendered identical triangle counts, and the screenshots matched visually.

|                                     | React 1× | Three 1× | React 4× | Three 4×  | React 9× | Three 9×  |
| ----------------------------------- | -------- | -------- | -------- | --------- | -------- | --------- |
| Meshes                              | 1,247    | 1,247    | 4,988    | 4,988     | 11,223   | 11,223    |
| Draw calls                          | 1,279    | **349**  | 5,116    | **1,345** | 11,511   | **3,005** |
| CPU time per frame (ms)             | 4.5      | **1.3**  | 18.9     | **4.5**   | 42.6     | **10.0**  |
| Hover update before the render (ms) | 25.9     | **1.0**  | 127      | **3.0**   | 267      | **5.6**   |
| Time until ready (ms)               | 642      | **265**  | 982      | **428**   | 1,646    | **545**   |
| JS heap once loaded (MB)            | 103      | **72**   | 186      | **91**    | 321      | **122**   |

- **Hover and selection are 25–50× faster.** Changing them recolors materials and instances in place, instead of re-rendering React group components and diffing their props. At 9× scale, React's ~270 ms per hover is a visible lag; the three layer takes ~6 ms.
- **About a quarter of the draw calls**, from instancing boxes, planes, cones, spheres and whole cylinders. Draw calls are the main frame-rate cost on a real GPU.
- **About 4× less CPU per frame.** There's one animation loop instead of a `useFrame` callback per group, and no reconciler.
- **2–3× faster until ready, with 30–60% less JS heap.** There are no React components or fibers per group and mesh.
- **Not measured:** GPU frame time. Headless WSL renders in software, so frames including drawing came out about equal in both. Phase 5 re-measures in a browser with a real GPU.
- **More headroom:** the remaining draw calls come mostly from the meshes that aren't instanced yet. Per scene that's about 240 polygons, 190 lines, 50 tubes and 50 texts. Merging them by material is the next optimization (phase 6).

### Code size (estimated)

|                                                              | Lines today               | Lines after                                              |
| ------------------------------------------------------------ | ------------------------- | -------------------------------------------------------- |
| React renderer (`src/renderers/react/`)                      | about 1,850               | about 80 (wrapper)                                       |
| three layer, scene build (`src/renderers/three/`)            | 0 (the PoC was about 780) | about 900                                                |
| three layer, viewer (new)                                    | 0                         | about 750                                                |
| Shared helpers (`src/renderers/shared/`)                     | 87                        | about 230 (texture and material code moved out of React) |
| Custom r3f typings (`src/custom_typings/react-three-*.d.ts`) | yes                       | deleted                                                  |
| **Total**                                                    | **about 1,940**           | **about 1,960**                                          |

- **About the same size, for two renderers instead of one:** a viewer that works without React, plus the React wrapper. The React-specific code shrinks from about 1,850 lines to about 80.
- **React plumbing goes away:** the callback prop types repeated through three component levels, `groupPropsEqual`, `extend()`, the `fakeArgs` cast, and the lint disables and casts around `OrbitControlsInstance`.
- **Imported, not written:** the gizmos, pointer events, controls, text, lines and AO come from plain three.js libraries (see Libraries). Our new code is mainly the camera fitting ported from `react-camera.tsx`, overlays, and glue.
- **Keeping r3f and using the three layer only for the scene build** would cost about the same total, keep the r3f dependencies, and leave non-React users without a viewer.

### Dependencies and packaging

- **Removed:** `@react-three/fiber`, `@react-three/drei` and everything it pulls in, `@react-three/postprocessing`, `suspend-react`, and `react-reconciler` (a dependency of fiber).
- **Added:** `@pmndrs/pointer-events`, `three-viewport-gizmo`, `troika-three-text` (today it comes in through drei) and `n8ao`. See Libraries.
- **React and react-dom become optional peer dependencies.** Non-React users stop getting peer warnings and r3f packages installed.
- **No more lockstep upgrades.** Today fiber, drei, postprocessing, React and three have to be upgraded together. After this, only three and React matter, and the wrapper works with any React version that has hooks.

### Other benefits

- **A viewer for non-React consumers**, which exists only for React today.
- **Simpler profiling:** stack traces are just three plus our code.
- **Explicit disposal:** every geometry, material and texture has an owner. It also fixes the likely leak in today's `react-mesh.tsx`, where `useMemo`'d `ExtrudeGeometry`, `TubeGeometry` and culled-line geometries are passed as props and r3f never disposes them.

## Libraries: import as much as possible

Everything below is plain three.js with no React. Our code is the scene build, camera fitting, overlays, and the glue between these libraries.

| Need                                                                    | Library                                                                                    | Notes                                                                                                                                                                                                                                                                                                                                                                                                   |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pointer events: click, hover, context menu, bubbling, `stopPropagation` | `@pmndrs/pointer-events` (MIT, no dependencies, maintained by pmndrs, the team behind r3f) | The framework-agnostic version of r3f's event model. Listeners go on `Object3D`s, events bubble up the parent chain, and events carry `instanceId`. `forwardHtmlEvents(canvas, camera, scene)` wires it up. Setting `pointerEvents = "none"` on an object keeps disabled groups from blocking picks. r3f's own event system can't be imported without React: it's tied to fiber's store and reconciler. |
| Viewcube and viewport axes                                              | `three-viewport-gizmo` (MIT, peer `three >=0.162 <1.0`)                                    | `type: "cube"` gives the viewcube with face labels, edges, corners and hover. `type: "sphere"` gives the axes gizmo. `placement` and `offset` replace drei's `alignment` and `margin`. Also `font`, colors, `opacity`, `animated` and `attachControls(controls)`. Last release March 2025: small enough to fork if needed.                                                                              |
| Orbit controls                                                          | three/addons `OrbitControls`                                                               | What drei's `OrbitControls` wraps today                                                                                                                                                                                                                                                                                                                                                                 |
| Text                                                                    | `troika-three-text`                                                                        | What drei's `Text` wraps today, so text renders the same                                                                                                                                                                                                                                                                                                                                                |
| Lines                                                                   | three/addons `Line2`, `LineMaterial`, `LineGeometry`                                       | What drei's `Line` wraps today                                                                                                                                                                                                                                                                                                                                                                          |
| Ambient occlusion                                                       | `n8ao` with three/addons `EffectComposer`                                                  | Same N8AO effect as today's `@react-three/postprocessing`                                                                                                                                                                                                                                                                                                                                               |
| Environment lighting                                                    | three/addons `RoomEnvironment` and `PMREMGenerator`                                        | Replaces drei `<Environment>` for consumers' `lights`                                                                                                                                                                                                                                                                                                                                                   |

## Target architecture

```
src/renderers/three/
  index.ts             public: buildScene, createViewer, types
  three-scene.ts       Scene → Object3D tree, instancing, state, pick, dispose
  three-mesh.ts        geometry and material builders
  three-dimension.ts   dimensions as pickable groups
  three-relation.ts    active relations: unlit, outlined, hover, pick
  viewer.ts            createViewer: renderer, render on demand, resize/dpr, lights, AO, loading state
  viewer-camera.ts     perspective/orthographic, fitting with buffer zones and fitPadding, views, reset
  viewer-events.ts     @pmndrs/pointer-events wiring: group callbacks, instance → group hover, cursor, paused while dragging
  viewer-overlay.ts    overlays: which are shown (popovers, hovered group's tooltips, loading fallback), positions, hidden behind camera
  viewer-gizmo.ts      three-viewport-gizmo setup from controlsHelper, resetZoomAndPanOnClick
src/renderers/react/
  index.ts
  react.tsx            the render component: creates and disposes the viewer, passes props, portals overlay content
```

### Core API sketch

```ts
// Content is generic: an HTMLElement or string for vanilla users, a ReactNode in the React wrapper
const viewer = createViewer<Content>(container, {
  scene,
  view,
  camera,
  bufferZones,
  fitPadding,
  controls,
  controlsHelper,
  lights,
  environment,
  ambientOcclusion,
  useAlphaTest,
  materialStateImages,
  createGroupId,
  selectedIds,
  hoveredIds,
  activeComponents,
  activeRelations,
  showDimensions,
  popovers,
  getTooltips,
  fallback,
  onClickGroup,
  onHoverGroup,
  onContextMenuGroup,
  onClickRelation,
  // The overlays shown, each with a positioned element; omit it and HTMLElement/string content is mounted directly
  onOverlays,
});
viewer.update(options); // any subset of the options above, diffed in the core
viewer.dispose();
```

All behavior lives in the core:

- **Option diffing:** `update()` takes the full or partial options and works out what changed. A new scene rebuilds; changed state repaints; changed callbacks are just stored.
- **Overlays:** which ones are shown (popovers, the hovered group's tooltips, the fallback while loading or before a scene is set), where they are, and whether they're behind the camera.
- **Loading state** and the reading of every option.

### React wrapper (about 80 lines)

It only bridges the React lifecycle and renders React content:

- `useLayoutEffect`: `createViewer(div, props)` on mount, `viewer.dispose()` on unmount.
- `useLayoutEffect`: `viewer.update(props)` on every render. The core diffs the props, so the wrapper needs no memoization and no callback refs.
- `onOverlays`: stores the list of `{ key, element, content }` in state and renders each item with `createPortal(content, element)`. Portals keep the app's React context, such as themes and i18n, inside popovers and tooltips.
- Keeps today's prop names where possible, mapping them to core option names (e.g. `hoveredIdsExternal` → `hoveredIds`, `sceneFallback` → `fallback`).

## Feature parity checklist (everything `render` does today)

| Feature                                                                             | Today                                                               | In the new core                                                                    |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Groups, meshes, all geometry types                                                  | `react-group.tsx`, `react-mesh.tsx`                                 | `buildScene` (proven in the PoC)                                                   |
| Materials, hover/select colors, material states, disabled opacity                   | `react-material.tsx`                                                | `buildScene` (proven in the PoC)                                                   |
| Images, SVG and abstract-image textures, `materialStateImages`, `useAlphaTest`      | `react-image-material.tsx`                                          | `buildScene` (proven in the PoC)                                                   |
| Text                                                                                | drei `Text`                                                         | `troika-three-text` (proven in the PoC)                                            |
| Line, CulledLine                                                                    | drei `Line`, shader                                                 | `Line2` and the same shader (proven in the PoC)                                    |
| Animations (`g.animation`)                                                          | `useFrame` per group                                                | One loop over the animated groups (proven in the PoC)                              |
| Dimensions, `showDimensions`, clickable dimension ids                               | `react-dimension.tsx`                                               | `three-dimension.ts`                                                               |
| Relations, `activeRelations`, outline, hover, `onClickRelation`                     | `react-relation.tsx`                                                | `three-relation.ts`                                                                |
| Scene `center_deprecated` and `rotation_deprecated`                                 | `react-scene.tsx`                                                   | Applied on the `buildScene` root                                                   |
| `onClickGroup`, `onHoverGroup`, `onContextMenuGroup`, cursor                        | r3f events on groups                                                | `@pmndrs/pointer-events`, wired in `viewer-events.ts`                              |
| Only Accept groups clickable while relations are active                             | r3f handlers left off                                               | `pointerEvents = "none"` on disabled groups, so they don't block picks             |
| Pointer events paused while orbit-dragging                                          | `ControlsWrapper`                                                   | `viewer-events.ts`                                                                 |
| `popovers`, `getTooltips`                                                           | drei `Html`                                                         | `viewer-overlay.ts` decides which and where; the wrapper portals the React content |
| `sceneFallback` while loading, and when `scene` is undefined                        | Suspense with `Html`                                                | `fallback` overlay, shown by the core's loading state                              |
| `camera` perspective/orthographic, near, far, fov                                   | drei cameras                                                        | `viewer-camera.ts`                                                                 |
| `view`, `bufferZones`, `fitPadding`, refit on resize                                | `react-camera.tsx` fit math                                         | Ported as a pure, unit-tested function                                             |
| `orbitContolsProps` (damping, distance limits, zoom speed, ...)                     | drei `OrbitControls`                                                | three/addons `OrbitControls`                                                       |
| `controlsHelper` Viewcube and Viewport, `resetZoomAndPanOnClick`, alignment, margin | drei gizmos                                                         | `three-viewport-gizmo`, configured in `viewer-gizmo.ts`                            |
| Default lights, `useOldMode` intensities                                            | JSX lights                                                          | Same lights built in code                                                          |
| `lights`                                                                            | JSX element                                                         | `Object3D[]` or `(scene) => Object3D[]`, plus `environment?: Texture`              |
| N8AO (when `useOldMode` is off)                                                     | `@react-three/postprocessing`                                       | `n8ao` with three/addons `EffectComposer`                                          |
| `dpr`, render on demand                                                             | `Canvas`                                                            | `viewer.ts` (`setPixelRatio`, `invalidate`)                                        |
| `canvasProps` (style, className, gl options)                                        | r3f `CanvasProps`                                                   | `className`, `style`, `rendererParameters`, `dpr`                                  |
| `createGroupId`                                                                     | Supported                                                           | Supported                                                                          |
| `createGroupKey`, `useAnimations`                                                   | `createGroupKey` used as React keys, `useAnimations` already unused | Removed                                                                            |

## Breaking changes (major version, 4.0.0)

These props and types change:

- **`lights`**: a JSX element becomes `Object3D[]` or `(scene) => Object3D[]`, plus a new `environment` option. Consumers using drei `<Environment>` switch to `RoomEnvironment` with `PMREMGenerator`, or to a loaded HDR texture.
- **`canvasProps`**: replaced by `className`, `style`, `rendererParameters` and `dpr`.
- **`orbitContolsProps`**: now our own typed subset of `OrbitControls` properties, no longer drei's `OrbitControlsProps`. The typo could be fixed in this release.
- **Event callbacks**: they receive `SceneMouseEvent = { nativeEvent, point, object, instanceId }` instead of r3f's `ThreeEvent`. The `nativeEvent` and `point` fields stay compatible.
- **`ControlsHelper`**: no longer typed from drei's `GizmoHelperProps`. It's our own type with the same fields.
- **Removed props**: `createGroupKey` and `useAnimations`.

The example app's usage covers `controlsHelper`, `orbitContolsProps`, `canvasProps.style`, `bufferZones`, `fitPadding` and `sceneFallback`. It migrates in phase 4 and serves as the parity reference.

## Phases

Each phase leaves `pnpm build` and `pnpm test` green and the old renderer working until phase 5.

### Phase 0: `buildScene` (re-implement the PoC, with its gaps fixed)

- Build the `Scene` → `Object3D` tree:
  - Instance boxes, planes, cones, spheres and whole cylinders, batched by geometry and material, with a per-instance color.
  - Build the other geometry types as single meshes.
  - Map picks back to group ids, add one loop for animated groups, and track resources for disposal.
  - Move the React-free texture and material code from `react-image-material.tsx` and `react-material.tsx` into `src/renderers/shared/`.
- Track and dispose the `InstancedMesh`es on rebuild. The PoC missed this, and it's the likely cause of its heap growth across scene swaps.
- On hover and selection, repaint without re-resolving the whole scene, and only rebuild when disabled or material-state images change.
- Apply the scene's center and rotation on the root.
- Make disabled and non-pickable objects not block picks.
- Add dimensions and relations.
- Tests: batching, pick, state repaint, dispose; dimension and relation picking.

### Phase 1: viewer core

- `viewer.ts`: `WebGLRenderer`, `ResizeObserver`, dpr, render on demand through `invalidate()`, the loop for animated groups, default and custom lights, environment, AO with `n8ao`, loading state, `dispose()`.
- `viewer-camera.ts`: port the fit math from `react-camera.tsx` into a pure function with unit tests (perspective `setViewOffset`, orthographic frustum, buffer zones, fitPadding, views). Add camera type switching and `OrbitControls`.
- `viewer-events.ts`: wire `@pmndrs/pointer-events` with `forwardHtmlEvents`. Map events to group callbacks; for instanced meshes, map `instanceId` to the group and emit group hover in and out when it changes. Also the cursor, and pausing while dragging.
- `viewer-overlay.ts`: anchors projected each rendered frame and hidden when behind the camera.

### Phase 2: gizmos

- Map `controlsHelper` to `three-viewport-gizmo`:
  - Viewcube → `type: "cube"`, Viewport → `type: "sphere"`.
  - `alignment` and `margin` → `placement` and `offset`.
  - `viewcubeProps` colors and font → its style options.
- Attach it to the `OrbitControls`.
- Implement `resetZoomAndPanOnClick` with the camera fit from phase 1, hooked to the gizmo's events.
- Spike first: check the look against today's drei viewcube, and how to hook the reset.

### Phase 3: React wrapper

- Rewrite `react.tsx` as the thin wrapper above, about 80 lines. If it grows, the logic belongs in the core.
- Delete `react-scene.tsx`, `react-group.tsx`, `react-mesh.tsx`, `react-material.tsx`, `react-image-material.tsx`, `react-dimension.tsx`, `react-relation.tsx`, `react-camera.tsx` and the r3f custom typings.

### Phase 4: parity

- Migrate the example app.
- Add a benchmark and screenshot harness (Vite page plus Playwright, `packages/abstract-3d/bench`). It measures draw calls, CPU per frame, hover update, time until ready and heap, and screenshots each scene, view and camera type.
- Compare old and new screenshots for `demo`, `systemair3` and `systemair6`: front, top and orbit views, perspective and orthographic, with hover, selection, active relations, dimensions on, and the viewcube visible.

### Phase 5: release

- Remove the r3f, drei, postprocessing and suspend-react dependencies.
- Make React optional peers.
- Write the README migration section and CHANGELOG entries, and bump to 4.0.0.
- Re-run the benchmark in a browser with a real GPU.

### Phase 6 (optional): further performance

- Merge the polygons, lines and tubes that aren't instanced, by material.
- Add `three-mesh-bvh` for raycasting in very large scenes.
- Draw text in batches with troika's `BatchedText`.

## Acceptance criteria

- Visual parity with today's renderer in the phase 4 screenshot set.
- Benchmark at systemair3 ×4, measured the same way as the table above:
  - hover update ≤ 5 ms;
  - draw calls ≤ 1,345;
  - CPU per frame ≤ 6 ms, including controls and events.
- `renderer.info.memory` returns to its baseline after 10 scene swaps and after `dispose()`.
- `abstract-3d/three` works without React installed.

## Risks

- **`three-viewport-gizmo` maintenance:** its last release was March 2025. If it falls behind three, fork it; it's about 57 KB unminified.
- **Hover between instances:** pointer over and out fire per object, so moving between instances of one `InstancedMesh` needs `pointermove` plus an `instanceId` → group check. Verify in the phase 1 spike.
- **Event semantics:** `@pmndrs/pointer-events` has r3f-style bubbling and `stopPropagation`. Groups sharing a root id must still report the root id, as today.
- **`lights` migration** for consumers who pass drei JSX today.
- **Text rendering:** troika loads its default font from a CDN, as drei `Text` does today. Pass a font URL if offline use matters.
- **Swap crash in today's renderer:** in the benchmark, after scene swaps the current renderer threw from `useFrame` in `react-group.tsx` because a group's ref was null. It's unconfirmed whether that happens in the real app. Not a risk for the new layer, but the old renderer might need a fix if it stays in use during the migration.

## Open decisions

1. **`three`**: keep it as a dependency, or make it a peer dependency so apps that use three themselves don't get two copies?
2. **Prop names**: keep today's names exactly, or clean them up in 4.0.0 (`orbitContolsProps` → `orbitControls`, `render` → `Viewer`)?
3. **AO**: `n8ao` with three's `EffectComposer`, or pmndrs `postprocessing`?
