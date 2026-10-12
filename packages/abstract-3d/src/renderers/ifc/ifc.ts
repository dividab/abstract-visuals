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

export type IfcApplicationInfo = {
  readonly name: string;
  readonly version?: string;
  /** Organization that develops the application, defaults to "Divid AB" */
  readonly developer?: string;
};

export type IfcOptions = {
  /** Name of the IFC project, defaults to "Abstract 3D" */
  readonly name?: string;
  /** Person exporting the file, written in the header and as the owner of every object, defaults to " " */
  readonly author?: string;
  /** Organization of the author, defaults to "UNKNOWN" */
  readonly organization?: string;
  /** Application that produced the scene, e.g. `{ name: "airCalc ACOM", version: "10.1" }`, defaults to Abstract 3D by Divid AB */
  readonly application?: IfcApplicationInfo;
  /**
   * Wraps the whole scene in one element, e.g. `{ entity: "IfcUnitaryEquipment", predefinedType: "AIRHANDLER", name: "AHU" }`, otherwise the
   * top-level groups are placed directly in the storey
   */
  readonly root?: IfcElementClass & { readonly name: string };
  /**
   * Layer of a group's shapes, from the `data` of every group from the root down to this group, this group last; groups without `data` are skipped
   * and the root element of `root` comes first. Undefined or "" keeps the layer of the group above
   */
  readonly layer?: (path: ReadonlyArray<Record<string, string>>) => string | undefined;
};

type NodeMesh = { readonly material: Material; readonly triangulation: Triangulation; readonly layer: string | undefined };

/** The `data` of the groups from the root down to a group and the layer its meshes are on */
type Layering = {
  readonly layerOf: IfcOptions["layer"];
  readonly path: ReadonlyArray<Record<string, string>>;
  readonly layer: string | undefined;
};

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

/**
 * `owner` is the encoded GlobalId and OwnerHistory every IfcRoot entity starts with, call it once per entity since the GlobalId must be unique.
 * `layers` are the face sets on each layer
 */
type IfcContext = {
  readonly body: number;
  readonly owner: (id?: string) => string;
  readonly styles: Map<string, number>;
  readonly layers: Map<string, Array<number>>;
};

/**
 * IFC4 (Reference View) with every mesh as an IfcTriangulatedFaceSet, in millimetres. Every top-level group and every group with a `data.id` or
 * `data.name` becomes an IfcBuildingElementProxy placed relative to its parent element and aggregated into it. Other groups are only transforms or
 * metadata, so their meshes are merged into the parent element. With `layer`, the face sets are assigned to an IfcPresentationLayerAssignment per
 * layer, the presentation layer of the Reference View
 */
export function render(scene: Scene, options: IfcOptions = {}): string {
  const name = options.name ?? "Abstract 3D";
  const author = options.author ?? " ";
  const organization = options.organization ?? "UNKNOWN";
  const application = options.application ?? { name: "Abstract 3D" };
  const now = new Date();
  const m = ifcFile();

  const ownerHistory = ownerHistoryEntity(m, author, organization, application, now);
  const world = axisPlacement(m, vec3Zero, vec3Zero);
  const context = add(m, `IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.E-05,${ref(world)},$)`);
  const body = add(m, `IFCGEOMETRICREPRESENTATIONSUBCONTEXT('Body','Model',*,*,*,*,${ref(context)},$,.MODEL_VIEW.,$)`);
  const c: IfcContext = { body, owner: (id) => `${str(guid(m, id))},${ref(ownerHistory)}`, styles: new Map(), layers: new Map() };
  const units = [
    add(m, "IFCSIUNIT(*,.LENGTHUNIT.,.MILLI.,.METRE.)"),
    add(m, "IFCSIUNIT(*,.AREAUNIT.,$,.SQUARE_METRE.)"),
    add(m, "IFCSIUNIT(*,.VOLUMEUNIT.,$,.CUBIC_METRE.)"),
    add(m, "IFCSIUNIT(*,.PLANEANGLEUNIT.,$,.RADIAN.)"),
  ];
  const project = add(m, `IFCPROJECT(${c.owner()},${str(name)},$,$,$,$,(${ref(context)}),${ref(add(m, `IFCUNITASSIGNMENT(${refs(units)})`))})`);

  const sitePlacement = add(m, `IFCLOCALPLACEMENT($,${ref(world)})`);
  const site = add(m, `IFCSITE(${c.owner()},'Site',$,$,${ref(sitePlacement)},$,$,.ELEMENT.,$,$,$,$,$)`);
  const buildingPlacement = add(m, `IFCLOCALPLACEMENT(${ref(sitePlacement)},${ref(world)})`);
  const building = add(m, `IFCBUILDING(${c.owner()},'Building',$,$,${ref(buildingPlacement)},$,$,.ELEMENT.,$,$,$)`);
  const storeyPlacement = add(m, `IFCLOCALPLACEMENT(${ref(buildingPlacement)},${ref(world)})`);
  const storey = add(m, `IFCBUILDINGSTOREY(${c.owner()},'Storey',$,$,${ref(storeyPlacement)},$,$,.ELEMENT.,0.)`);
  aggregate(m, c, project, [site]);
  aggregate(m, c, site, [building]);
  aggregate(m, c, building, [storey]);

  const center = scene.center_deprecated ?? vec3Zero;
  const sceneRot = scene.rotation_deprecated ?? vec3Zero;
  const top: Layering = { layerOf: options.layer, path: [], layer: undefined };
  const rootGroup: Group | undefined = options.root && { pos: center, rot: sceneRot, groups: scene.groups, data: { name: options.root.name } };
  const nodes = rootGroup
    ? [elementNode(rootGroup, center, sceneRot, groupLayering(rootGroup, top), options.root)]
    : scene.groups.map((g) =>
        elementNode(g, vec3TransRot(g.pos, center, sceneRot), vec3RotCombine(sceneRot, g.rot ?? vec3Zero), groupLayering(g, top))
      );
  const elements = nodes.flatMap((node) => node ?? []).map((node, i) => element(m, node, `${i + 1}`, storeyPlacement, c));
  if (elements.length > 0) {
    add(m, `IFCRELCONTAINEDINSPATIALSTRUCTURE(${c.owner()},$,$,${refs(elements)},${ref(storey)})`);
  }
  c.layers.forEach((items, layer) => add(m, `IFCPRESENTATIONLAYERASSIGNMENT(${str(layer)},$,${refs(items)},$)`));

  const date = now.toISOString().split(".")[0] ?? "1970-01-01T00:00:00";
  return serialize(m, { fileName: `${name}.ifc`, date, author, organization, originatingSystem: application.name });
}

/** The author as the owning user and the application, ADDED requires LastModifiedDate in IFC4 so it's set to the creation date */
function ownerHistoryEntity(m: MutableIfc, author: string, organization: string, application: IfcApplicationInfo, now: Date): number {
  const person = add(m, `IFCPERSON(${str(author)},$,$,$,$,$,$,$)`);
  const owningOrganization = add(m, `IFCORGANIZATION($,${str(organization)},$,$,$)`);
  const { name, version = "", developer = "Divid AB" } = application;
  const developerOrganization = developer === organization ? owningOrganization : add(m, `IFCORGANIZATION($,${str(developer)},$,$,$)`);
  const user = add(m, `IFCPERSONANDORGANIZATION(${ref(person)},${ref(owningOrganization)},$)`);
  const app = add(m, `IFCAPPLICATION(${ref(developerOrganization)},${str(version)},${str(name)},${str(name)})`);
  const timestamp = Math.floor(now.getTime() / 1000);
  return add(m, `IFCOWNERHISTORY(${ref(user)},${ref(app)},$,.ADDED.,${timestamp},$,$,${timestamp})`);
}

/** `layering` is the group's own, see `groupLayering` */
function elementNode(group: Group, pos: Vec3, rot: Vec3, layering: Layering, elementClass = proxyClass): ElementNode | undefined {
  const { meshes, children } = elementContent(group, vec3Zero, vec3Zero, layering);
  return meshes.length > 0 || children.length > 0 ? { group, elementClass, pos, rot, meshes, children } : undefined;
}

/**
 * Meshes of the group and its descendants that aren't elements, relative to the element the group is at pos/rot in, and the descendants with a
 * `data.id` or `data.name` as elements
 */
function elementContent(group: Group, pos: Vec3, rot: Vec3, layering: Layering): Pick<ElementNode, "meshes" | "children"> {
  const meshes = (group.meshes ?? []).flatMap((mesh) => {
    const triangulation = triangulate(mesh.geometry, pos, rot);
    return triangulation ? [{ material: mesh.material, triangulation, layer: layering.layer }] : [];
  });
  const nested = (group.groups ?? []).map((child) => {
    const childPos = vec3TransRot(child.pos, pos, rot);
    const childRot = vec3RotCombine(rot, child.rot ?? vec3Zero);
    const childLayering = groupLayering(child, layering);
    return child.data?.["id"] !== undefined || child.data?.["name"] !== undefined
      ? { meshes: [], children: [elementNode(child, childPos, childRot, childLayering)].flatMap((node) => node ?? []) }
      : elementContent(child, childPos, childRot, childLayering);
  });
  return { meshes: [...meshes, ...nested.flatMap((n) => n.meshes)], children: nested.flatMap((n) => n.children) };
}

/** Groups with `data` are added to the path and get the layer `layerOf` returns for it, if any, otherwise the layer of the parent */
function groupLayering(group: Group, parent: Layering): Layering {
  const data = group.data;
  if (data === undefined || Object.keys(data).length === 0) {
    return parent;
  }
  const path = [...parent.path, data];
  const layer = parent.layerOf?.(path);
  return { ...parent, path, layer: layer === undefined || layer === "" ? parent.layer : layer };
}

/** `path` is the element's position in the tree (e.g. "2.1"), named after it when the group has no `data.name` or `data.id` since IFC requires a name */
function element(m: MutableIfc, node: ElementNode, path: string, parentPlacement: number, c: IfcContext): number {
  const placement = add(m, `IFCLOCALPLACEMENT(${ref(parentPlacement)},${ref(axisPlacement(m, node.pos, node.rot))})`);
  const items = node.meshes.map((mesh) => faceSet(m, mesh, c));
  const shape =
    items.length > 0
      ? ref(add(m, `IFCPRODUCTDEFINITIONSHAPE($,$,(${ref(add(m, `IFCSHAPEREPRESENTATION(${ref(c.body)},'Body','Tessellation',${refs(items)})`))}))`))
      : "$";
  const id = node.group.data?.["id"];
  const name = node.group.data?.["name"] ?? id ?? `Element ${path}`;
  const { entity, predefinedType = "NOTDEFINED" } = node.elementClass;
  const ifcElement = add(m, `${entity.toUpperCase()}(${c.owner(id)},${str(name)},$,$,${ref(placement)},${shape},${str(id)},.${predefinedType}.)`);
  aggregate(
    m,
    c,
    ifcElement,
    node.children.map((child, i) => element(m, child, `${path}.${i + 1}`, placement, c))
  );
  return ifcElement;
}

/** One face set per mesh, so meshes on different layers are never in the same item */
function faceSet(m: MutableIfc, { material, triangulation: { points, triangles }, layer }: NodeMesh, c: IfcContext): number {
  const pointList = add(m, `IFCCARTESIANPOINTLIST3D((${points.join(",")}))`);
  const faces = add(m, `IFCTRIANGULATEDFACESET(${ref(pointList)},$,.F.,(${triangles.map((t) => `(${t.join(",")})`).join(",")}),$)`);
  add(m, `IFCSTYLEDITEM(${ref(faces)},(${ref(surfaceStyle(m, material, c))}),$)`);
  if (layer !== undefined) {
    const items = c.layers.get(layer);
    if (items) {
      items.push(faces);
    } else {
      c.layers.set(layer, [faces]);
    }
  }
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
  // Rendering rather than its supertype shading, since many viewers only read the transparency from rendering
  const rendering = add(m, `IFCSURFACESTYLERENDERING(${ref(colour)},${real(1 - opacity)},$,$,$,$,$,$,.NOTDEFINED.)`);
  const style = add(m, `IFCSURFACESTYLE(${str(material.normal)},.BOTH.,(${ref(rendering)}))`);
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

function aggregate(m: MutableIfc, c: IfcContext, parent: number, children: ReadonlyArray<number>): void {
  if (children.length > 0) {
    add(m, `IFCRELAGGREGATES(${c.owner()},$,$,${ref(parent)},${refs(children)})`);
  }
}
