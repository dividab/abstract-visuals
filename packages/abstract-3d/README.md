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

### Realistic scenes

The viewer lights scenes with a photographed studio and a key light, and draws surfaces by what they are. Three things in the scene data decide how real it looks: what each material is, which parts are abstract, and how round the edges of sheet metal are.

**`type` on `Material`:** what the surface is. Each type gets a physical finish of its own in the material's `normal` color, and `metalness` and `roughness` are then not used. Without a type, a material is drawn as before, by its `metalness` and `roughness`.

| `type`         | For                                               | Finish                                                                            |
| -------------- | ------------------------------------------------- | --------------------------------------------------------------------------------- |
| `"painted"`    | painted panels, casings, motors                   | satin, with a light clearcoat                                                     |
| `"galvanized"` | galvanized or zinc-magnesium sheet, base frames   | matte metal                                                                       |
| `"aluminum"`   | frame profiles, fins, damper blades               | metal, a little smoother                                                          |
| `"stainless"`  | drip trays, screws, fittings                      | smooth metal                                                                      |
| `"copper"`     | coil pipes                                        | smooth metal                                                                      |
| `"plastic"`    | handles, corners, covers                          | semi-matte                                                                        |
| `"rubber"`     | gaskets, seals                                    | matte                                                                             |
| `"fabric"`     | filter bags, silencer media, flexible connections | matte, with a soft sheen                                                          |
| `"glass"`      | inspection windows                                | smooth and see-through, 25% opaque unless the material's `opacity` says otherwise |

**`castShadow: false` on `Material`:** for parts that aren't physical, e.g. symbols, image backings, hotspot markers and air direction arrows, so they cast no shadow, neither on the unit nor on the ground. Transparent parts never cast one.

**`radius` on `Box`:** the radius of the box's edges, e.g. 2 for sheet metal bent with a 2 mm radius, in the scene's units. The edges are shaded as rounded, without extra geometry, and boxes with the same radius share their geometry, so a few radii cost nothing. Boxes with holes stay sharp, as do boxes without a radius.

**`roundedEdges` on `Box`:** the edges `radius` rounds, all 12 by default, named by the two sides they're between, e.g. `"TopFront"` (`BoxEdge`, `boxEdges`). For a part made of several boxes, e.g. a corner piece, round only its outer edges and keep those where the boxes meet sharp, so it reads as one part instead of showing seams, e.g. `["TopBack", "TopFront", "BottomBack", "BottomFront"]` for an arm along x whose ends meet other boxes.

```ts
const panel = box(vec3(800, 600, 50), { normal: "rgb(230, 232, 235)", type: "painted" }, vec3Zero, vec3Zero, [], 2);
const profile = box(vec3(40, 600, 40), { normal: "rgb(170, 175, 185)", type: "aluminum" }, vec3(420, 0, 0), vec3Zero, [], 2);
const symbol = plane(vec3(0, 0, 26), vec2(120, 120), { normal: "rgb(255, 255, 255)", castShadow: false });
```

Only the three.js viewer uses these; the dxf, step, stl, svg and ifc renderers ignore them. The example app's `material-types.ts` and `round-boxes.ts` show them filled in from a material database's names.

Development: `pnpm test:abstract-3d`, `pnpm bench:abstract-3d` (compile, build, hover and picking in Node) and `pnpm bench:abstract-3d:browser [bench] [memory] [screenshots]` (frame times and draw calls; frames rendered while idle and GPU resources and heap over 150 scene swaps; screenshots written to `bench/out`; in headless Chromium).
