# abstract-3d

[![npm version][version-image]][version-url]
[![code style: oxfmt][oxfmt-image]][oxfmt-url]
[![MIT license][license-image]][license-url]

Abstract 3d with renderers for three.js (`abstract-3d/three`, with a React component in `abstract-3d/react`), svg, stl, step, ifc and dxf

## Viewer

`abstract-3d/three` is an interactive three.js viewer that works without React. It draws a scene in a few draw calls whatever its size, and renders only when something changes, so it runs smoothly on weak graphics cards. `quality: "auto"` lowers the resolution if moving gets slow.

```ts
import { createViewer, disposeViewer, updateViewer } from "abstract-3d/three";

const viewer = createViewer(element, {
  scene,
  createGroupId: (g) => g.id ?? "",
  onClickGroup: (id) => updateViewer(viewer, { selectedIds: { [id]: true } }),
});
updateViewer(viewer, { quality: "low" }); // the options that changed, redone in the next frame
disposeViewer(viewer);
```

`abstract-3d/react` wraps it as the `Viewer` component, with the same props as the 3.x `render` component except for the breaking changes listed in the CHANGELOG. `three` is a peer dependency, and `react` and `react-dom` are optional peer dependencies.

Development: `pnpm test:abstract-3d`, `pnpm bench:abstract-3d` (compile, build, hover and picking in Node) and `pnpm bench:abstract-3d:browser [bench] [memory] [screenshots]` (frame times and draw calls; frames rendered while idle and GPU resources and heap over 150 scene swaps; screenshots written to `bench/out`; in headless Chromium).
