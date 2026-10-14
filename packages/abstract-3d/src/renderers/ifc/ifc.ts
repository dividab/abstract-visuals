import { Color, SRGBColorSpace } from "three";
import type { Scene, Group, Material, Relation, Vec3 } from "../../abstract-3d.js";
import { vec3Zero, vec3PosX, vec3PosY, vec3Rot, vec3Sub, vec3TransRot, vec3RotCombine, vec3RotInverse } from "../../abstract-3d.js";
import type { MutableIfc } from "./ifc-encoding.js";
import { add, guid, ifcFile, point, real, ref, refs, serialize, str } from "./ifc-encoding.js";
import type { Polyline, Triangulation } from "./ifc-geometry.js";
import { polyline, toIfc, triangulate } from "./ifc-geometry.js";

/** IFC4's PredefinedType values of the element classes, besides NOTDEFINED and USERDEFINED */
type PredefinedTypes = {
  readonly IfcBuildingElementProxy: "COMPLEX" | "ELEMENT" | "PARTIAL" | "PROVISIONFORVOID" | "PROVISIONFORSPACE";
  readonly IfcBuildingElementPart: "INSULATION" | "PRECASTPANEL";
  readonly IfcUnitaryEquipment: "AIRHANDLER" | "AIRCONDITIONINGUNIT" | "DEHUMIDIFIER" | "SPLITSYSTEM" | "ROOFTOPUNIT";
  readonly IfcFan:
    | "CENTRIFUGALFORWARDCURVED"
    | "CENTRIFUGALRADIAL"
    | "CENTRIFUGALBACKWARDINCLINEDCURVED"
    | "CENTRIFUGALAIRFOIL"
    | "TUBEAXIAL"
    | "VANEAXIAL"
    | "PROPELLORAXIAL";
  readonly IfcFilter: "AIRPARTICLEFILTER" | "COMPRESSEDAIRFILTER" | "ODORFILTER" | "OILFILTER" | "STRAINER" | "WATERFILTER";
  readonly IfcCoil:
    | "DXCOOLINGCOIL"
    | "ELECTRICHEATINGCOIL"
    | "GASHEATINGCOIL"
    | "HYDRONICCOIL"
    | "STEAMHEATINGCOIL"
    | "WATERCOOLINGCOIL"
    | "WATERHEATINGCOIL";
  readonly IfcAirToAirHeatRecovery:
    | "FIXEDPLATECOUNTERFLOWEXCHANGER"
    | "FIXEDPLATECROSSFLOWEXCHANGER"
    | "FIXEDPLATEPARALLELFLOWEXCHANGER"
    | "ROTARYWHEEL"
    | "RUNAROUNDCOILLOOP"
    | "HEATPIPE"
    | "TWINTOWERENTHALPYRECOVERYLOOPS"
    | "THERMOSIPHONSEALEDTUBEHEATEXCHANGERS"
    | "THERMOSIPHONCOILTYPEHEATEXCHANGERS";
  readonly IfcDamper:
    | "BACKDRAFTDAMPER"
    | "BALANCINGDAMPER"
    | "BLASTDAMPER"
    | "CONTROLDAMPER"
    | "FIREDAMPER"
    | "FIRESMOKEDAMPER"
    | "FUMEHOODEXHAUST"
    | "GRAVITYDAMPER"
    | "GRAVITYRELIEFDAMPER"
    | "RELIEFDAMPER"
    | "SMOKEDAMPER";
  readonly IfcDuctSilencer: "FLATOVAL" | "RECTANGULAR" | "ROUND";
  readonly IfcHumidifier:
    | "STEAMINJECTION"
    | "ADIABATICAIRWASHER"
    | "ADIABATICPAN"
    | "ADIABATICWETTEDELEMENT"
    | "ADIABATICATOMIZING"
    | "ADIABATICULTRASONIC"
    | "ADIABATICRIGIDMEDIA"
    | "ADIABATICCOMPRESSEDAIRNOZZLE"
    | "ASSISTEDELECTRIC"
    | "ASSISTEDNATURALGAS"
    | "ASSISTEDPROPANE"
    | "ASSISTEDBUTANE"
    | "ASSISTEDSTEAM";
};

/** An element class, all with the attributes GlobalId, ..., Tag, PredefinedType, and one of its PredefinedTypes, which defaults to NOTDEFINED */
export type IfcEntity = {
  readonly [E in keyof PredefinedTypes]: { readonly entity: E; readonly predefinedType?: PredefinedTypes[E] | "NOTDEFINED" };
}[keyof PredefinedTypes];

/** IFC4's IfcDistributionSystemEnum, the system a port belongs to, it only connects to ports of the same system */
export type IfcDistributionSystem =
  | "AIRCONDITIONING"
  | "AUDIOVISUAL"
  | "CHEMICAL"
  | "CHILLEDWATER"
  | "COMMUNICATION"
  | "COMPRESSEDAIR"
  | "CONDENSERWATER"
  | "CONTROL"
  | "CONVEYING"
  | "DATA"
  | "DISPOSAL"
  | "DOMESTICCOLDWATER"
  | "DOMESTICHOTWATER"
  | "DRAINAGE"
  | "EARTHING"
  | "ELECTRICAL"
  | "ELECTROACOUSTIC"
  | "EXHAUST"
  | "FIREPROTECTION"
  | "FUEL"
  | "GAS"
  | "HAZARDOUS"
  | "HEATING"
  | "LIGHTING"
  | "LIGHTNINGPROTECTION"
  | "MUNICIPALSOLIDWASTE"
  | "OIL"
  | "OPERATIONAL"
  | "POWERGENERATION"
  | "RAINWATER"
  | "REFRIGERATION"
  | "SECURITY"
  | "SEWAGE"
  | "SIGNAL"
  | "STORMWATER"
  | "TELEPHONE"
  | "TV"
  | "VACUUM"
  | "VENT"
  | "VENTILATION"
  | "WASTEWATER"
  | "WATERSUPPLY";

export type IfcPortType = {
  readonly predefinedType: "CABLE" | "CABLECARRIER" | "DUCT" | "PIPE";
  readonly systemType?: IfcDistributionSystem;
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
  /** The class of a group that becomes an element, e.g. `{ entity: "IfcFan" }`, IfcBuildingElementProxy when undefined */
  readonly entity?: (group: Group) => IfcEntity | undefined;
  /** The type of a relation's ports, e.g. `{ predefinedType: "DUCT", systemType: "VENTILATION" }`, NOTDEFINED when undefined */
  readonly port?: (relation: Relation) => IfcPortType | undefined;
};

/** A triangulated mesh or a line, `type` is the RepresentationType of the shape representation it's written in */
type NodeMesh = { readonly material: Material; readonly layer: string | undefined } & (
  | { readonly type: "Tessellation"; readonly triangulation: Triangulation }
  | { readonly type: "Curve3D"; readonly polyline: Polyline }
);

const representationTypes = ["Tessellation", "Curve3D"] as const;

/** A group that becomes an element, groups without any triangulated geometry or lines in them are left out */
type ElementNode = {
  readonly group: Group;
  readonly pos: Vec3;
  readonly rot: Vec3;
  readonly meshes: ReadonlyArray<NodeMesh>;
  readonly children: ReadonlyArray<ElementNode>;
};

/** A written element with its placement and where it is in the scene, after the scene's center and rotation */
type IfcElement = { readonly element: number; readonly placement: number; readonly pos: Vec3; readonly rot: Vec3 };

/**
 * `owner` is the encoded GlobalId and OwnerHistory every IfcRoot entity starts with, call it once per entity since the GlobalId must be unique.
 * `layers` are the representation items (face sets and polylines) on each layer, `elements` the written elements by their group's id and `ports` the
 * ports nested in each element
 */
type IfcContext = {
  readonly body: number;
  readonly owner: (id?: string) => string;
  readonly entity: IfcOptions["entity"];
  readonly styles: Map<string, number>;
  readonly layers: Map<string, Array<number>>;
  readonly elements: Map<string, IfcElement>;
  readonly ports: Map<number, Array<number>>;
};

/**
 * IFC4 (Reference View) with every mesh as an IfcTriangulatedFaceSet and every line as an IfcPolyline without thickness, in millimetres. Every
 * top-level group and every group with an `id` or `name` becomes an element of the class `entity` gives it, an IfcBuildingElementProxy by default,
 * placed relative to its parent element and aggregated into it. Other groups are only transforms, so their meshes are merged into the parent element.
 * The face sets and polylines are on an IfcPresentationLayerAssignment per `layer`. Every relation becomes an IfcDistributionPort nested in each of
 * the elements of its groups, with the flow leaving `from` and entering `to`, and the two ports of a relation with both are connected
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
  const c: IfcContext = {
    body,
    owner: (id) => `${str(guid(m, id))},${ref(ownerHistory)}`,
    entity: options.entity,
    styles: new Map(),
    layers: new Map(),
    elements: new Map(),
    ports: new Map(),
  };
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
  const elements = mergeSameId(scene.groups)
    .flatMap((g) => elementNode(g, vec3TransRot(g.pos, center, sceneRot), vec3RotCombine(sceneRot, g.rot ?? vec3Zero), g.layer) ?? [])
    .map((node, i) => element(m, node, `${i + 1}`, { element: storey, placement: storeyPlacement, pos: vec3Zero, rot: vec3Zero }, c));
  if (elements.length > 0) {
    add(m, `IFCRELCONTAINEDINSPATIALSTRUCTURE(${c.owner()},$,$,${refs(elements)},${ref(storey)})`);
  }
  for (const relation of scene.relations ?? []) {
    relationPorts(m, relation, center, sceneRot, options.port, c);
  }
  c.ports.forEach((ports, e) => add(m, `IFCRELNESTS(${c.owner()},$,$,${ref(e)},${refs(ports)})`));
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

/** `layer` is the group's own or the one it inherits */
function elementNode(group: Group, pos: Vec3, rot: Vec3, layer: string | undefined): ElementNode | undefined {
  const { meshes, children } = elementContent(group, vec3Zero, vec3Zero, layer);
  return meshes.length > 0 || children.length > 0 ? { group, pos, rot, meshes, children } : undefined;
}

/**
 * Meshes of the group and its descendants that aren't elements, relative to the element the group is at pos/rot in, and the descendants with an `id`
 * or `name` as elements
 */
function elementContent(group: Group, pos: Vec3, rot: Vec3, layer: string | undefined): Pick<ElementNode, "meshes" | "children"> {
  const meshes = (group.meshes ?? []).flatMap(({ material, geometry }): ReadonlyArray<NodeMesh> => {
    const triangulation = triangulate(geometry, pos, rot);
    const line = polyline(geometry, pos, rot);
    return triangulation
      ? [{ type: "Tessellation", material, layer, triangulation }]
      : line
        ? [{ type: "Curve3D", material, layer, polyline: line }]
        : [];
  });
  const nested = mergeSameId(group.groups ?? []).map((child) => {
    const childPos = vec3TransRot(child.pos, pos, rot);
    const childRot = vec3RotCombine(rot, child.rot ?? vec3Zero);
    const childLayer = child.layer ?? layer;
    return child.id !== undefined || child.name !== undefined
      ? { meshes: [], children: [elementNode(child, childPos, childRot, childLayer)].flatMap((node) => node ?? []) }
      : elementContent(child, childPos, childRot, childLayer);
  });
  return {
    meshes: [...meshes, ...nested.flatMap((n) => n.meshes)],
    children: nested.flatMap((n) => n.children),
  };
}

/** Sibling groups with the same `id` as one group at the origin, with the first's name, description, layer and data, and the groups as its parts */
function mergeSameId(groups: ReadonlyArray<Group>): ReadonlyArray<Group> {
  return groups.flatMap((g, i) => {
    const same = g.id === undefined ? [] : groups.filter((s) => s.id === g.id);
    if (same.length < 2) {
      return [g];
    }
    return groups.findIndex((s) => s.id === g.id) === i
      ? [
          {
            id: g.id,
            name: g.name,
            description: g.description,
            layer: g.layer,
            data: g.data,
            pos: vec3Zero,
            groups: same.map((s) => ({ ...s, id: undefined, name: undefined })),
          },
        ]
      : [];
  });
}

/**
 * `path` is the element's position in the tree (e.g. "2.1"), named after it when the group has no `name` or `id` since IFC requires a name. `parent`
 * is the element or storey the element is placed and aggregated in
 */
function element(m: MutableIfc, node: ElementNode, path: string, parent: IfcElement, c: IfcContext): number {
  const placement = add(m, `IFCLOCALPLACEMENT(${ref(parent.placement)},${ref(axisPlacement(m, node.pos, node.rot))})`);
  const { id, name = id ?? `Element ${path}`, description } = node.group;
  const { entity, predefinedType = "NOTDEFINED" } = c.entity?.(node.group) ?? { entity: "IfcBuildingElementProxy" };
  const ifcElement = add(
    m,
    `${entity.toUpperCase()}(${c.owner(id)},${str(name)},${str(description)},$,${ref(placement)},${representation(m, node.meshes, c)},${str(id)},.${predefinedType}.)`
  );
  const written: IfcElement = {
    element: ifcElement,
    placement,
    pos: vec3TransRot(node.pos, parent.pos, parent.rot),
    rot: vec3RotCombine(parent.rot, node.rot),
  };
  if (id !== undefined) {
    c.elements.set(id, written);
  }
  aggregate(
    m,
    c,
    ifcElement,
    node.children.map((child, i) => element(m, child, `${path}.${i + 1}`, written, c))
  );
  return ifcElement;
}

/**
 * A port nested in the element of each of the relation's groups that is one, placed relative to it, and the two ports connected when both are. The
 * relation's groups are its shape, merged into the first port relative to its placement, groups in them with an `id` or `name` are left out
 */
function relationPorts(m: MutableIfc, relation: Relation, center: Vec3, sceneRot: Vec3, portType: IfcOptions["port"], c: IfcContext): void {
  const pos = vec3TransRot(relation.pos, center, sceneRot);
  const rot = vec3RotCombine(sceneRot, relation.rot ?? vec3Zero);
  const portInverse = vec3RotInverse(rot);
  const { predefinedType = "NOTDEFINED", systemType } = portType?.(relation) ?? {};
  const ends = [
    { e: relation.from === undefined ? undefined : c.elements.get(relation.from), flow: "SOURCE" },
    { e: relation.to === undefined ? undefined : c.elements.get(relation.to), flow: "SINK" },
  ].flatMap(({ e, flow }) => (e ? [{ e, flow }] : []));
  const ports = ends.map(({ e, flow }, i) => {
    const inverse = vec3RotInverse(e.rot);
    const placement = add(
      m,
      `IFCLOCALPLACEMENT(${ref(e.placement)},${ref(axisPlacement(m, vec3Rot(vec3Sub(pos, e.pos), vec3Zero, inverse), vec3RotCombine(inverse, rot)))})`
    );
    const meshes =
      i === 0
        ? (relation.groups ?? []).flatMap((g) => {
            const groupPos = vec3Rot(vec3Sub(vec3TransRot(g.pos, center, sceneRot), pos), vec3Zero, portInverse);
            const groupRot = vec3RotCombine(portInverse, vec3RotCombine(sceneRot, g.rot ?? vec3Zero));
            return elementContent(g, groupPos, groupRot, g.layer).meshes;
          })
        : [];
    // Each port's id is the relation's with its flow, so they're kept between exports
    const port = add(
      m,
      `IFCDISTRIBUTIONPORT(${c.owner(`${relation.id}_${flow}`)},${str(relation.name)},$,$,${ref(placement)},${representation(m, meshes, c)},.${flow}.,.${predefinedType}.,${systemType === undefined ? "$" : `.${systemType}.`})`
    );
    const nested = c.ports.get(e.element);
    if (nested) {
      nested.push(port);
    } else {
      c.ports.set(e.element, [port]);
    }
    return port;
  });
  const [relating, related] = ports;
  if (relating !== undefined && related !== undefined) {
    add(m, `IFCRELCONNECTSPORTS(${c.owner()},$,$,${ref(relating)},${ref(related)},$)`);
  }
}

/** The encoded IfcProductDefinitionShape with a shape representation per representation type, or $ without meshes */
function representation(m: MutableIfc, meshes: ReadonlyArray<NodeMesh>, c: IfcContext): string {
  const representations = representationTypes.flatMap((type) => {
    const items = meshes.filter((mesh) => mesh.type === type).map((mesh) => representationItem(m, mesh, c));
    return items.length > 0 ? [add(m, `IFCSHAPEREPRESENTATION(${ref(c.body)},'Body',${str(type)},${refs(items)})`)] : [];
  });
  return representations.length > 0 ? ref(add(m, `IFCPRODUCTDEFINITIONSHAPE($,$,${refs(representations)})`)) : "$";
}

/** One face set or polyline per mesh, so meshes on different layers are never in the same item */
function representationItem(m: MutableIfc, mesh: NodeMesh, c: IfcContext): number {
  const [item, style] =
    mesh.type === "Tessellation"
      ? [faceSet(m, mesh.triangulation), surfaceStyle(m, mesh.material, c)]
      : [add(m, `IFCPOLYLINE(${refs(mesh.polyline.map((p) => add(m, `IFCCARTESIANPOINT(${p})`)))})`), curveStyle(m, mesh.material, c)];
  add(m, `IFCSTYLEDITEM(${ref(item)},(${ref(style)}),$)`);
  if (mesh.layer !== undefined) {
    const items = c.layers.get(mesh.layer);
    if (items) {
      items.push(item);
    } else {
      c.layers.set(mesh.layer, [item]);
    }
  }
  return item;
}

function faceSet(m: MutableIfc, { points, triangles }: Triangulation): number {
  const pointList = add(m, `IFCCARTESIANPOINTLIST3D((${points.join(",")}))`);
  return add(m, `IFCTRIANGULATEDFACESET(${ref(pointList)},$,.F.,(${triangles.map((t) => `(${t.join(",")})`).join(",")}),$)`);
}

function surfaceStyle(m: MutableIfc, material: Material, c: IfcContext): number {
  const opacity = material.opacity ?? 1;
  return cachedStyle(c, `surface_${material.normal}_${opacity}`, () => {
    // Rendering rather than its supertype shading, since many viewers only read the transparency from rendering
    const rendering = add(m, `IFCSURFACESTYLERENDERING(${ref(colour(m, material))},${real(1 - opacity)},$,$,$,$,$,$,.NOTDEFINED.)`);
    return add(m, `IFCSURFACESTYLE(${str(material.normal)},.BOTH.,(${ref(rendering)}))`);
  });
}

/** Only the colour, IFC has no line width that viewers reliably show */
const curveStyle = (m: MutableIfc, material: Material, c: IfcContext): number =>
  cachedStyle(c, `curve_${material.normal}`, () => add(m, `IFCCURVESTYLE($,$,$,${ref(colour(m, material))},.T.)`));

function cachedStyle(c: IfcContext, key: string, create: () => number): number {
  const cached = c.styles.get(key);
  if (cached !== undefined) {
    return cached;
  }
  const style = create();
  c.styles.set(key, style);
  return style;
}

function colour(m: MutableIfc, material: Material): number {
  const { r, g, b } = new Color(material.normal).getRGB({ r: 0, g: 0, b: 0 }, SRGBColorSpace);
  return add(m, `IFCCOLOURRGB($,${real(r)},${real(g)},${real(b)})`);
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
