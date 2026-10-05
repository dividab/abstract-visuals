import { Color, SRGBColorSpace } from "three";
import type { Scene, Group, Material, Vec3 } from "../../abstract-3d.js";
import { vec3Zero, vec3PosX, vec3PosY, vec3Rot, vec3TransRot, vec3RotCombine } from "../../abstract-3d.js";
import type { MutableIfc } from "./ifc-encoding.js";
import { add, guid, ifcFile, point, real, ref, refs, serialize, str } from "./ifc-encoding.js";
import type { Triangulation } from "./ifc-geometry.js";
import { toIfc, triangulate } from "./ifc-geometry.js";

/** Element classes with the same attributes as IfcBuildingElementProxy (GlobalId, ..., Tag, PredefinedType) */
export type IfcElementEntity = "IfcBuildingElementProxy" | "IfcUnitaryEquipment";

export type IfcElementClass = {
  readonly entity: IfcElementEntity;
  /** The entity's PredefinedType, e.g. "AIRHANDLER" for IfcUnitaryEquipment, defaults to "NOTDEFINED" */
  readonly predefinedType?: string;
};

export type IfcOptions = {
  /** Name of the IFC project, defaults to "Abstract 3D" */
  readonly name?: string;
  /**
   * Wraps the whole scene in one element, e.g. `{ entity: "IfcUnitaryEquipment", predefinedType: "AIRHANDLER", name: "AHU" }`, otherwise the
   * top-level groups are placed directly in the storey
   */
  readonly root?: IfcElementClass & { readonly name: string };
};

type NodeMesh = { readonly material: Material; readonly triangulation: Triangulation };

/** A group that becomes an element, groups without any triangulated geometry in them are left out */
type ElementNode = {
  readonly group: Group;
  readonly elementClass: IfcElementClass;
  readonly pos: Vec3;
  readonly rot: Vec3;
  readonly meshes: ReadonlyArray<NodeMesh>;
  readonly children: ReadonlyArray<ElementNode>;
};

const proxyClass: IfcElementClass = { entity: "IfcBuildingElementProxy" };

type IfcContext = { readonly body: number; readonly styles: Map<string, number> };

/**
 * IFC4 (Reference View) with every mesh as an IfcTriangulatedFaceSet, in millimetres. Every top-level group and every group with `data` becomes an
 * IfcBuildingElementProxy placed relative to its parent element and aggregated into it. Groups without `data` are only transforms, so their meshes
 * are merged into the parent element
 */
export function render(scene: Scene, options: IfcOptions = {}): string {
  const name = options.name ?? "Abstract 3D";
  const m = ifcFile();

  const world = axisPlacement(m, vec3Zero, vec3Zero);
  const context = add(m, `IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,${ref(world)},$)`);
  const body = add(m, `IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,${ref(context)},$,.MODEL_VIEW.,$)`);
  const units = [
    add(m, "IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)"),
    add(m, "IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)"),
    add(m, "IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)"),
    add(m, "IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.)"),
  ];
  const project = add(m, `IFCPROJECT(${str(guid(m))},$,${str(name)},$,$,$,$,(${ref(context)}),${ref(add(m, `IFCUNITASSIGNMENT(${refs(units)})`))})`);

  const sitePlacement = add(m, `IFCLOCALPLACEMENT($,${ref(world)})`);
  const site = add(m, `IFCSITE(${str(guid(m))},$,'Site',$,$,${ref(sitePlacement)},$,$,.ELEMENT.,$,$,$,$,$)`);
  const buildingPlacement = add(m, `IFCLOCALPLACEMENT(${ref(sitePlacement)},${ref(world)})`);
  const building = add(m, `IFCBUILDING(${str(guid(m))},$,'Building',$,$,${ref(buildingPlacement)},$,$,.ELEMENT.,$,$,$)`);
  const storeyPlacement = add(m, `IFCLOCALPLACEMENT(${ref(buildingPlacement)},${ref(world)})`);
  const storey = add(m, `IFCBUILDINGSTOREY(${str(guid(m))},$,'Storey',$,$,${ref(storeyPlacement)},$,$,.ELEMENT.,0.)`);
  aggregate(m, project, [site]);
  aggregate(m, site, [building]);
  aggregate(m, building, [storey]);

  const center = scene.center_deprecated ?? vec3Zero;
  const sceneRot = scene.rotation_deprecated ?? vec3Zero;
  const c: IfcContext = { body, styles: new Map() };
  const nodes = options.root
    ? [elementNode({ pos: center, rot: sceneRot, groups: scene.groups, data: { name: options.root.name } }, center, sceneRot, options.root)]
    : scene.groups.map((g) => elementNode(g, vec3TransRot(g.pos, center, sceneRot), vec3RotCombine(sceneRot, g.rot ?? vec3Zero)));
  const elements = nodes.flatMap((node) => node ?? []).map((node, i) => element(m, node, `${i + 1}`, storeyPlacement, c));
  if (elements.length > 0) {
    add(m, `IFCRELCONTAINEDINSPATIALSTRUCTURE(${str(guid(m))},$,$,$,${refs(elements)},${ref(storey)})`);
  }

  const date = new Date().toISOString().split(".")[0] ?? "1970-01-01T00:00:00";
  return serialize(m, `${name}.ifc`, date);
}

function elementNode(group: Group, pos: Vec3, rot: Vec3, elementClass = proxyClass): ElementNode | undefined {
  const { meshes, children } = elementContent(group, vec3Zero, vec3Zero);
  return meshes.length > 0 || children.length > 0 ? { group, elementClass, pos, rot, meshes, children } : undefined;
}

/** Meshes of the group and its descendants without data, relative to the element the group is at pos/rot in, and the descendants with data as elements */
function elementContent(group: Group, pos: Vec3, rot: Vec3): Pick<ElementNode, "meshes" | "children"> {
  const meshes = (group.meshes ?? []).flatMap((mesh) => {
    const triangulation = triangulate(mesh.geometry, pos, rot);
    return triangulation ? [{ material: mesh.material, triangulation }] : [];
  });
  const nested = (group.groups ?? []).map((child) => {
    const childPos = vec3TransRot(child.pos, pos, rot);
    const childRot = vec3RotCombine(rot, child.rot ?? vec3Zero);
    return Object.keys(child.data ?? {}).length > 0
      ? { meshes: [], children: [elementNode(child, childPos, childRot)].flatMap((node) => node ?? []) }
      : elementContent(child, childPos, childRot);
  });
  return { meshes: [...meshes, ...nested.flatMap((n) => n.meshes)], children: nested.flatMap((n) => n.children) };
}

/** `path` is the element's position in the tree (e.g. "2.1"), named after it when the group has no `data.name` or `data.id` since IFC requires a name */
function element(m: MutableIfc, node: ElementNode, path: string, parentPlacement: number, c: IfcContext): number {
  const placement = add(m, `IFCLOCALPLACEMENT(${ref(parentPlacement)},${ref(axisPlacement(m, node.pos, node.rot))})`);
  const items = node.meshes.map(({ material, triangulation }) => faceSet(m, triangulation, material, c));
  const shape =
    items.length > 0
      ? ref(add(m, `IFCPRODUCTDEFINITIONSHAPE($,$,(${ref(add(m, `IFCSHAPEREPRESENTATION(${ref(c.body)},'Body','Tessellation',${refs(items)})`))}))`))
      : "$";
  const id = node.group.data?.["id"];
  const name = node.group.data?.["name"] ?? id ?? `Element ${path}`;
  const { entity, predefinedType = "NOTDEFINED" } = node.elementClass;
  const ifcElement = add(
    m,
    `${entity.toUpperCase()}(${str(guid(m, id))},$,${str(name)},$,$,${ref(placement)},${shape},${str(id)},.${predefinedType}.)`
  );
  aggregate(
    m,
    ifcElement,
    node.children.map((child, i) => element(m, child, `${path}.${i + 1}`, placement, c))
  );
  return ifcElement;
}

function faceSet(m: MutableIfc, { points, triangles }: Triangulation, material: Material, c: IfcContext): number {
  const pointList = add(m, `IFCCARTESIANPOINTLIST3D((${points.join(",")}))`);
  const faces = add(m, `IFCTRIANGULATEDFACESET(${ref(pointList)},$,.F.,(${triangles.map((t) => `(${t.join(",")})`).join(",")}),$)`);
  add(m, `IFCSTYLEDITEM(${ref(faces)},(${ref(surfaceStyle(m, material, c))}),$)`);
  return faces;
}

function surfaceStyle(m: MutableIfc, material: Material, c: IfcContext): number {
  const opacity = material.opacity ?? 1;
  const key = `${material.normal}_${opacity}`;
  const cached = c.styles.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const { r, g, b } = new Color(material.normal).getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace);
  const colour = add(m, `IFCCOLOURRGB($,${real(r)},${real(g)},${real(b)})`);
  const shading = add(m, `IFCSURFACESTYLESHADING(${ref(colour)},${real(1 - opacity)})`);
  const style = add(m, `IFCSURFACESTYLE(${str(material.normal)},.BOTH.,(${ref(shading)}))`);
  c.styles.set(key, style);
  return style;
}

/** The group's local axes, converted to IFC's Z-up where three.js' up (Y) becomes the placement's Axis (Z) */
function axisPlacement(m: MutableIfc, pos: Vec3, rot: Vec3): number {
  const location = add(m, `IFCCARTESIANPOINT(${point(toIfc(pos))})`);
  const axis = add(m, `IFCDIRECTION(${point(toIfc(vec3Rot(vec3PosY, vec3Zero, rot)))})`);
  const refDirection = add(m, `IFCDIRECTION(${point(toIfc(vec3Rot(vec3PosX, vec3Zero, rot)))})`);
  return add(m, `IFCAXIS2PLACEMENT3D(${ref(location)},${ref(axis)},${ref(refDirection)})`);
}

function aggregate(m: MutableIfc, parent: number, children: ReadonlyArray<number>): void {
  if (children.length > 0) {
    add(m, `IFCRELAGGREGATES(${str(guid(m))},$,$,$,${ref(parent)},${refs(children)})`);
  }
}
