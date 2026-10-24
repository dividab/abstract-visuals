# Change Log

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](http://keepachangelog.com/) and this project adheres to [Semantic Versioning](http://semver.org/).

## [Unreleased]

## [4.0.0-beta.5] - 2026-10-24

- Changed (breaking): the react renderer is rewritten on plain three.js, without `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` and `suspend-react`. The new `abstract-3d/three` entry is the viewer without React (`createViewer`), and `abstract-3d/react` is a thin component around it. Solids of the same material are drawn as one batch, so a scene takes about a dozen draw calls whatever its size, and hover and selection repaint instance colors instead of re-rendering components

- Changed (breaking): `three`, `react` and `react-dom` are optional peer dependencies. `three` is needed by the `three`, `react` and `ifc` renderers; the `dxf`, `step`, `stl` and `svg` renderers don't use it

- Changed (breaking): the component is `Viewer` instead of `render`. Event callbacks get a `SceneEvent` (`nativeEvent` and the hit `point`) instead of r3f's `ThreeEvent`. `lights` is an array of three.js objects or a function of the scene that returns them, added to the environment's light, instead of a JSX element replacing the default lights

- Changed: the scene is lit by a photographed studio, Poly Haven's Studio Small 08 HDRI (CC0), which lights faces by which way they turn and gives metal and glass real reflections, instead of a strong ambient light that lit every face alike and directional lights. It's bundled, about 350 kB gzipped, and loaded on demand by the 3D viewer only

- Added: `type` on `Material`, what the surface is: `"painted"`, `"galvanized"`, `"aluminum"`, `"stainless"`, `"copper"`, `"plastic"`, `"rubber"`, `"fabric"` or `"glass"` (`MaterialType`, `materialTypes`). The three.js viewer draws each with a physical finish of its own in the material's color, e.g. a clearcoat on painted sheet, a sheen on fabric, see-through glass, instead of `metalness` and `roughness`; a `type` that isn't one, e.g. a number from a database, is ignored

- Added: `radius` on `Box`, which rounds its edges, e.g. by the bend of sheet metal. The three.js viewer shades the edges of boxes without holes as rounded by it, at least two pixels wide so far edges stay smooth, without extra geometry; the other renderers draw boxes sharp as before

- Added: a soft shadow on the ground under the scene, in a faint pool of light so it also shows on dark backgrounds, rendered once per scene so it costs nothing per frame. Turn it off with `groundShadow={false}`

- Removed (breaking): ambient occlusion. The new `quality` prop sets the resolution instead: `"high"`, the default, renders at the screen's pixel ratio as 3.x did, `"medium"` at up to 1.5 and `"low"` at 1 pixel per CSS pixel, and `"auto"` starts at high and drops to low once moving gets slow

- Changed (breaking): `orbitContolsProps` is `controls`, the same OrbitControls options with the 3.x behavior: damping, the `onStart`, `onChange` and `onEnd` callbacks, and fitting the scene at first and for a new camera or canvas aspect. Pointer events pause while the camera is dragged

- Changed: `controlsHelper` draws the viewcube or axes with `three-viewport-gizmo`, with the same options except `hideAxisHeads`, which is removed. Text is drawn with the system font (Helvetica or Arial), so no font is loaded

- Removed (breaking): `canvasProps` (use `className`, `style` and the new `onPointerMissed` prop, called for a click on nothing clickable), `createGroupKey`, `useAnimations` and `useOldMode`

## [3.0.2] - 2026-10-17

- Added: `type` on `Group` and `Scene`, what it is (`GroupType`), e.g. `"AirHandler"`, `"Fan"`, `"WaterCoil"`, `"RotaryHeatExchanger"` or `"Part"` for a part of what it's in, `airType` on `Relation`, the air through it by where the unit's air comes in or goes out (`AirType`), `"fresh"`, `"supply"`, `"extract"` or `"exhaust"`, and `id` and `name` on `Scene`, what the scene is as a whole

- Added: the IFC renderer writes an element as the class of its `type` when the `entity` option doesn't give one, e.g. `IfcFan` or `IfcCoil` HYDRONICCOIL, and the ports of a relation with an `airType` as ducts of its system, VENTILATION for fresh and supply air and EXHAUST for extract and exhaust air, when the `port` option doesn't give their type. A scene with an `id`, `name` or `type` is one element with all its groups in it, e.g. an `IfcUnitaryEquipment` air handler

## [3.0.0] - 2026-10-14

- Removed (breaking): `hotSpots_deprecated` on `Scene` and the `HotSpot` type, and the react renderer's `activeHotSpots`, `onClickHotSpot`, `hotSpotTexts` and `showHotSpotTexts` props and the `HotSpotInfo` type. Use the scene's `relations` instead: the react renderer draws the `groups` of the relations whose ids are in the new `activeRelations` prop, clickable and darker when hovered, and calls the new `onClickRelation` prop with the clicked relation. While `activeRelations` is defined, even when empty, only the groups whose material state is Accept can be clicked, as with `activeHotSpots`

- Added: `id`, `name`, `description` and `layer` on `Group`. `id` identifies what the group is, sibling groups with the same `id` are parts of the same thing, `layer` is inherited by the groups below that don't have their own. `data` is now only the application's own and isn't read by any renderer

- Added: `relations` on `Scene`, connections between two groups by their `id` (`from` → `to`), or with one end where something outside the scene connects to a group, each with a position and rotation whose local x points along the flow, and optional `groups` as its shape, in the scene's coordinates like the top-level groups

- Added: the IFC renderer writes every relation as an `IfcDistributionPort` nested in each of its groups' elements, SOURCE in `from` and SINK in `to`, placed relative to the element, and connects the two ports of a relation with both ends with `IfcRelConnectsPorts`. The relation's groups are merged into the first port's shape. The new `port` option gives a relation's ports their type and system, e.g. `{ predefinedType: "DUCT", systemType: "VENTILATION" }`

- Added: `entity` option on the IFC renderer that gives each element its class, e.g. `{ entity: "IfcFan", predefinedType: "CENTRIFUGALAIRFOIL" }`, with the IFC4 PredefinedTypes of IfcUnitaryEquipment, IfcFan, IfcFilter, IfcCoil, IfcAirToAirHeatRecovery, IfcDamper, IfcDuctSilencer, IfcHumidifier and IfcBuildingElementProxy, which it defaults to, and IfcBuildingElementPart, e.g. for the parts of a casing that aren't equipment of their own

- Changed: the IFC GlobalId is derived from a hash of any `id` that isn't a uuid too, so every object with an id keeps its GlobalId between exports

- Changed (breaking): in the IFC renderer the groups that become elements are the top-level groups and the groups with an `id` or `name`, which also give the element's GlobalId, name and tag, instead of `data.id` and `data.name`. The layers come from `layer` on the groups, the `layer` option is removed. The `root` option is removed, wrap the groups in one group with a `name` and give it its class with `entity` instead

## [2.12.0] - 2026-10-12

- Changed (behaviour change): in the IFC renderer only groups whose `data` has an `id` or `name` become elements (top-level groups still always do). A group whose `data` only has other keys, e.g. `{ type: "panel" }`, is now metadata and its meshes are merged into the element above it, like a group without `data`

- Added: `layer` option on the IFC renderer that puts the shapes on presentation layers (CAD layers). It's called with the `data` of the groups from the root down to each group with `data`, and every mesh is on the layer of the nearest group above it that got one. Each layer is written as one `IfcPresentationLayerAssignment` on the mesh's `IfcTriangulatedFaceSet`, so one element can have shapes on several layers. Without `layer` the output is unchanged

- Added: the IFC renderer writes an `IfcOwnerHistory` (person, organization, application and creation date) on every object, and the author, organization and application in the file header. Set them with the new `author`, `organization` and `application` options, which default to an unknown author and organization and Abstract 3D by Divid AB

## [2.11.2] - 2026-10-05

- Added: `backfaceCulling` on `Material`, which makes the react renderer draw only the front side of meshes and images that use it, e.g. an image on the far wall that should not show through an open casing. Default is still both sides

## [2.11.0] - 2026-10-05

- Added: IFC renderer (`abstract-3d/ifc`, `Ifc.render(scene)`), exports an IFC4 file where every mesh is triangulated into an `IfcTriangulatedFaceSet` with its color, and every top-level group and every group with `data` becomes an `IfcBuildingElementProxy` aggregated into its parent element, groups without `data` are merged into their parent. The GlobalId comes from the group's `data.id` when it's a uuid. The `root` option wraps the whole scene in one element, e.g. an `IfcUnitaryEquipment` air handler

## [2.10.6] - 2026-10-05

- Fixed: the lines of a selected or hovered dimension are now also drawn in the select color in the react renderer

## [2.10.5] - 2026-10-01

- Changed: groups are memoized in the react renderer so unchanged groups skip re-rendering

## [2.10.4] - 2026-10-01

- Fixed: removed: zoom now resets when the 3D model changes in the react renderer. Reset only on gizmo click

## [2.10.3] - 2026-09-30

- Fixed: zoom now resets when the 3D model changes in the react renderer

## [2.10.2] - 2026-09-29

- Added optional `id` to `DimensionAligned` and `DimensionMesh` (and a last `id` argument to `alignedDimension`). In the react renderer a dimension with an id is clickable like a group when `onClickGroup` is given: it calls `onClickGroup`, `onHoverGroup` and `onContextMenuGroup` with that id, and is drawn in the select color when hovered or when its id is selected.

## [2.10.1] - 2026-09-29

- Bumped `three`, `@react-three/fiber`, `@react-three/drei` and `@react-three/postprocessing` dependencies. No functional changes.

## [2.10.0] - 2026-09-27

- Added optional `radiusEnd` to `Cylinder` (radius at the +y end, defaults to `radius`) for tapered cylinders and truncated cones, supported by all renderers. Holes are ignored on tapered cylinders.

## [2.9.0] - 2026-09-10

- Internal: activated `typescript/no-unnecessary-condition`. No functional changes.

## [2.8.0] - 2026-09-06

- Internal: activated 39 additional oxlint rules — curly, default-case, eqeqeq, init-declarations, no-alert, no-bitwise, no-case-declarations, no-empty-pattern, no-prototype-builtins, no-restricted-globals, no-restricted-properties, no-shadow, no-throw-literal, no-unused-vars, no-useless-return, node/global-require, one-var, prefer-const, prefer-object-spread, typescript/array-type, typescript/ban-tslint-comment, typescript/dot-notation, typescript/explicit-module-boundary-types, typescript/no-empty-object-type, typescript/no-explicit-any, typescript/no-require-imports, typescript/no-unnecessary-boolean-literal-compare, typescript/no-var-requires, typescript/no-wrapper-object-types, typescript/parameter-properties, typescript/prefer-nullish-coalescing, typescript/prefer-optional-chain, typescript/prefer-readonly, typescript/prefer-reduce-type-parameter, typescript/prefer-string-starts-ends-with, typescript/switch-exhaustiveness-check, typescript/unified-signatures, unicorn/no-array-sort — and upgraded `oxlint-config-divid` to 1.2.0. No functional changes.

## [2.7.31] - 2026-09-05

- Internal: adopt `verbatimModuleSyntax` and stricter compiler/lint settings (no unused locals/params, no bracket-free index-signature access, no non-null-assertion lint rule dropped). No functional changes.

## v2.7.4

- Added culled lines

## v2.7.0

- Added support for aligned dimensions for native dimension support in DXF

## v2.4.0

- Added support for tooltips.

## v2.2.0

- Added flag to react 3d renderer allowing user to force reset pan and zoom on cube/viewport click

## v2.1.0

- Made dxf exporter use LINE and POLYLINE instead of 3DFACE for the lines and polylines

## v2.0.9

- Made Text only front sided

## v1.7.0

- Allow using the abstract 3d scene origin in the DXF export

## v1.6.0

- Included abstract image and made a new Image component to draw abstract images.

## v1.4.0

- Added a flag to turn off alpha test on texture materials.

## v1.3.9

- Added a setting for the dxf exporter to specify the sides of the cylinders.

## v1.3.4

- Bugfix Polygon: THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.

## v1.3.1

- Text bounds calculation.

## v1.3.0

- Exposed functions to calculate bounds from geometry.

## v1.2.2

- Fixed the square holes to the SVG renderer
- Added opacity to the SVG elements

## v1.2.0

- Added holes rendering to the SVG renderer

## v1.1.4

- Added screen space ambient occlusion

## v1.1.0

- Added outlines to hotspots

## v0.9.0

- Added React event to React renderer callbacks

## v0.8.0

- Added reactPopovers to React renderer

## v0.7.0

- Added onHoverGroup to React renderer

## v0.1.0 - 2024-06-05

- Start of changelog.
