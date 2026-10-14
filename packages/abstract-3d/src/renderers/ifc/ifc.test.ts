import { describe, expect, it, vi } from "vitest";
import type { Group, Scene } from "../../abstract-3d.js";
import { box, culledLine, cylinder, group, line, plane, roundHole, sphere, vec2, vec3, vec3Zero } from "../../abstract-3d.js";
import { guid, ifcFile, real, str } from "./ifc-encoding.js";
import { polyline, triangulate } from "./ifc-geometry.js";
import { render } from "./ifc.js";

const red = { normal: "rgb(255, 0, 0)", opacity: 0.5 };
const scene = (groups: Scene["groups"], relations?: Scene["relations"]): Scene => ({ size_deprecated: vec3Zero, groups, relations });
const count = (ifc: string, entity: string): number => ifc.split(`=${entity}(`).length - 1;
const ids = (s: string): ReadonlyArray<string> => Array.from(s.matchAll(/#(\d+)/g), (match) => match[1]);
/** Random GlobalIds replaced, to compare files */
const normalize = (ifc: string): string => ifc.replaceAll(/'[0-9A-Za-z_$]{22}'/g, "'guid'");

const entities = (ifc: string): ReadonlyMap<string, string> => new Map(Array.from(ifc.matchAll(/^#(\d+)=(.*);$/gm), (match) => [match[1], match[2]]));

/** The #id of the element or port named `name` */
const named = (ifc: string, name: string): string => new RegExp(`^#(\\d+)=IFC\\w+\\('[^']{22}',#\\d+,'${name}',`, "m").exec(ifc)![1];

/** The layer of every face set and polyline of the element named `name`, in order */
function elementLayers(ifc: string, name: string): ReadonlyArray<string | undefined> {
  const byId = entities(ifc);
  const layers = new Map(
    Array.from(ifc.matchAll(/[=]IFCPRESENTATIONLAYERASSIGNMENT\('([^']*)',\$,\(([^)]*)\),\$\);/g)).flatMap(([, layer, items]) =>
      ids(items).map((item) => [item, layer] as const)
    )
  );
  // The element's owner history, placement and shape, the shape's representations and their context and items
  const [, , shape] = ids(byId.get(named(ifc, name))!);
  const items = ids(byId.get(shape)!).flatMap((representation) => ids(byId.get(representation)!).slice(1));
  return items.map((item) => layers.get(item));
}

/** The location, axis and ref direction of the placement of the element or port named `name`, in IFC's Z-up */
function placementOf(ifc: string, name: string): ReadonlyArray<string> {
  const byId = entities(ifc);
  const [, placement] = ids(byId.get(named(ifc, name))!);
  const [, axes] = ids(byId.get(placement)!);
  return ids(byId.get(axes)!).map((id) => byId.get(id)!);
}

/** An air handler component with a panel and a fan with a motor, the motor's meshes two groups without id or name down */
const component = (id: string, layer: string): Group => ({
  ...group(
    [box(vec3(1, 1, 1), red)],
    vec3Zero,
    vec3Zero,
    [
      { ...group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [], { type: "panel" }), layer: "SECTIONS" },
      group([sphere(1, red)], vec3Zero, vec3Zero, [group([], vec3Zero, vec3Zero, [group([cylinder(vec3Zero, 1, 2, red)])])], { type: "fan_wall" }),
    ],
    { key: "FAN" }
  ),
  id,
  layer,
});

describe("ifc encoding", () => {
  it("writes reals with a decimal point", () => {
    expect([real(0), real(-0), real(1), real(-2.5), real(1e-9), real(1 / 3)]).toEqual(["0.", "0.", "1.", "-2.5", "0.", "0.333333"]);
  });

  it("escapes strings", () => {
    expect(str("it's a\\b")).toBe("'it''s a\\\\b'");
    expect(str("Fläkt")).toBe("'Fl\\X2\\00E4\\X0\\kt'");
    expect(str(undefined)).toBe("$");
  });

  it("derives the guid from a uuid and stays unique within a file", () => {
    const m = ifcFile();
    const uuid = "588c9525-0f1b-4b0b-a3e1-ba10f8a922ff";
    const first = guid(m, uuid);
    expect(first).toMatch(/^[0-9A-Za-z_$]{22}$/);
    expect(guid(ifcFile(), uuid)).toBe(first);
    expect(guid(m, uuid)).not.toBe(first);
  });

  it("derives the guid from a hash of any other id", () => {
    const fromId = guid(ifcFile(), "588c9525-0f1b-4b0b-a3e1-ba10f8a922ff_supply");
    expect(fromId).toMatch(/^[0-9A-Za-z_$]{22}$/);
    expect(guid(ifcFile(), "588c9525-0f1b-4b0b-a3e1-ba10f8a922ff_supply")).toBe(fromId);
    expect(guid(ifcFile(), "588c9525-0f1b-4b0b-a3e1-ba10f8a922ff_extract")).not.toBe(fromId);
    expect(guid(ifcFile(), "")).toMatch(/^[0-9A-Za-z_$]{22}$/);
  });
});

describe("ifc triangulation", () => {
  it("triangulates a box into 12 triangles over 8 shared points, converted to Z-up", () => {
    const t = triangulate(box(vec3(2, 4, 6), red, vec3(0, 10, 0)).geometry)!;
    expect(t.triangles).toHaveLength(12);
    expect(t.points).toHaveLength(8);
    // Y-up 10 + half height 2 becomes Z
    expect(t.points).toContain("(1.,3.,12.)");
  });

  it("triangulates holes and skips lines", () => {
    expect(triangulate(box(vec3(10, 10, 1), red, vec3Zero, vec3Zero, [roundHole(vec2(0, 0), 2)]).geometry)!.triangles.length).toBeGreaterThan(12);
    expect(triangulate(cylinder(vec3Zero, 1, 2, red, vec3Zero, false, [], 0, Math.PI).geometry)!.triangles.length).toBeGreaterThan(0);
    expect(triangulate(line(vec3Zero, vec3(1, 1, 1), 1, red).geometry)).toBeUndefined();
  });

  it("converts the end points of lines like the triangle points and nothing else", () => {
    expect(polyline(line(vec3(1, 2, 3), vec3(4, 5, 6), 1, red).geometry, vec3(0, 10, 0))).toEqual(["(1.,-3.,12.)", "(4.,-6.,15.)"]);
    expect(polyline(culledLine(vec3Zero, vec3(1, 0, 0), vec3(0, 0, 1), 1, red).geometry)).toEqual(["(0.,0.,0.)", "(1.,0.,0.)"]);
    expect(polyline(box(vec3(1, 1, 1), red).geometry)).toBeUndefined();
  });
});

describe("ifc render", () => {
  it("writes an element per top-level group and group with an id or name, merging the other groups into their parent", () => {
    const ifc = render(
      scene([
        {
          ...group(
            [box(vec3(1, 1, 1), red)],
            vec3Zero,
            vec3Zero,
            [
              { ...group([sphere(1, red)]), name: "Fan" },
              group([box(vec3(2, 2, 2), red)], vec3(0, 100, 0)),
              { ...group([line(vec3Zero, vec3(1, 0, 0), 1, red)]), name: "Lines only" },
            ],
            { id: "not read" }
          ),
          id: "588c9525-0f1b-4b0b-a3e1-ba10f8a922ff",
        },
        group([box(vec3(1, 1, 1), red)]),
        group([]),
      ])
    );
    expect(ifc).toMatch(/^ISO-10303-21;/);
    expect(ifc).toContain("FILE_SCHEMA(('IFC4'));");
    expect(ifc.trimEnd()).toMatch(/END-ISO-10303-21;$/);
    // The empty group is left out, the group without id or name is merged into its parent
    expect(count(ifc, "IFCBUILDINGELEMENTPROXY")).toBe(4);
    expect(count(ifc, "IFCTRIANGULATEDFACESET")).toBe(4);
    expect(count(ifc, "IFCRELAGGREGATES")).toBe(4);
    expect(count(ifc, "IFCRELCONTAINEDINSPATIALSTRUCTURE")).toBe(1);
    // The merged box keeps its group's offset, Y-up 100 + half height becomes Z
    expect(ifc).toContain("(1.,-1.,101.)");
    // Same material is styled once
    expect(count(ifc, "IFCSURFACESTYLE")).toBe(1);
    expect(ifc).toContain("IFCCOLOURRGB($,1.,0.,0.)");
    expect(ifc).toMatch(/[=]IFCSURFACESTYLERENDERING\(#\d+,0\.5,\$,\$,\$,\$,\$,\$,\.NOTDEFINED\.\);/);
    expect(ifc).not.toContain("IFCSURFACESTYLESHADING(");
    // The GlobalId comes from the uuid, the name and tag are the id when there's no name
    expect(ifc).toContain(`IFCBUILDINGELEMENTPROXY('${guid(ifcFile(), "588c9525-0f1b-4b0b-a3e1-ba10f8a922ff")}',`);
    expect(ifc).toContain(",'588c9525-0f1b-4b0b-a3e1-ba10f8a922ff',$,$,#");
    expect(ifc).toContain(",'588c9525-0f1b-4b0b-a3e1-ba10f8a922ff',.NOTDEFINED.)");
    expect(ifc).not.toContain("not read");
    expect(ifc).toContain(",'Fan',$,$,#");
    // IFC requires a name, top-level groups without one are named after their position
    expect(ifc).toContain(",'Element 2',$,$,#");
  });

  it("writes the transparency as one minus the opacity, styling each colour and opacity once", () => {
    const blue = { normal: "rgb(0, 0, 255)", opacity: 0.25 };
    const ifc = render(scene([group([box(vec3(1, 1, 1), blue), sphere(1, blue), box(vec3(1, 1, 1), { normal: "rgb(0, 0, 255)" })])]));
    expect(ifc).toMatch(/[=]IFCSURFACESTYLERENDERING\(#\d+,0\.75,\$,\$,\$,\$,\$,\$,\.NOTDEFINED\.\);/);
    // No opacity is opaque
    expect(ifc).toMatch(/[=]IFCSURFACESTYLERENDERING\(#\d+,0\.,\$,\$,\$,\$,\$,\$,\.NOTDEFINED\.\);/);
    expect(count(ifc, "IFCSURFACESTYLERENDERING")).toBe(2);
    expect(count(ifc, "IFCSURFACESTYLE")).toBe(2);
  });

  it("writes a line as a polyline in a Curve3D representation next to the face sets, styled with its colour and on its group's layer", () => {
    const green = { normal: "rgb(0, 255, 0)" };
    const ifc = render(
      scene([
        {
          ...group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [group([line(vec3(1, 2, 3), vec3(4, 5, 6), 2, green)], vec3(0, 100, 0))]),
          layer: "A",
        },
      ])
    );
    const byId = entities(ifc);
    expect(count(ifc, "IFCPOLYLINE")).toBe(1);
    const [, polylineId, start, end] = /^#(\d+)=IFCPOLYLINE\(\(#(\d+),#(\d+)\)\);$/m.exec(ifc)!;
    // The line keeps its group's offset, Y-up 100 becomes Z
    expect([byId.get(start), byId.get(end)]).toEqual(["IFCCARTESIANPOINT((1.,-3.,102.))", "IFCCARTESIANPOINT((4.,-6.,105.))"]);
    const [tessellation, curve] = ids(Array.from(byId.values()).find((e) => e.startsWith("IFCPRODUCTDEFINITIONSHAPE("))!);
    expect(byId.get(tessellation)).toMatch(/^IFCSHAPEREPRESENTATION\(#\d+,'Body','Tessellation',\(#\d+\)\)$/);
    expect(byId.get(curve)).toMatch(new RegExp(`^IFCSHAPEREPRESENTATION\\(#\\d+,'Body','Curve3D',\\(#${polylineId}\\)\\)$`));
    const [, style] = ids(Array.from(byId.values()).find((e) => e.startsWith(`IFCSTYLEDITEM(#${polylineId},`))!);
    const [colour] = ids(byId.get(style)!);
    expect(byId.get(style)).toBe(`IFCCURVESTYLE($,$,$,#${colour},.T.)`);
    expect(byId.get(colour)).toBe("IFCCOLOURRGB($,0.,1.,0.)");
    expect(elementLayers(ifc, "Element 1")).toEqual(["A", "A"]);
  });

  it("writes an element with only lines, styling each colour once", () => {
    const green = { normal: "rgb(0, 255, 0)" };
    const ifc = render(
      scene([
        { ...group([line(vec3Zero, vec3(1, 0, 0), 1, green), culledLine(vec3Zero, vec3(0, 1, 0), vec3(0, 0, 1), 1, green)]), name: "Lines only" },
      ])
    );
    expect(count(ifc, "IFCBUILDINGELEMENTPROXY")).toBe(1);
    expect(ifc).toContain(",'Lines only',$,$,#");
    expect(count(ifc, "IFCPOLYLINE")).toBe(2);
    expect(count(ifc, "IFCCURVESTYLE")).toBe(1);
    expect(count(ifc, "IFCTRIANGULATEDFACESET")).toBe(0);
    expect(count(ifc, "IFCSHAPEREPRESENTATION")).toBe(1);
    expect(ifc).toMatch(/[=]IFCSHAPEREPRESENTATION\(#\d+,'Body','Curve3D',\(#\d+,#\d+\)\);/);
  });

  it("writes each element as the class entity gives it, an IfcBuildingElementProxy otherwise", () => {
    const ifc = render(
      scene([
        {
          ...group([], vec3Zero, vec3Zero, [
            { ...group([box(vec3(1, 1, 1), red)]), name: "Filter" },
            { ...group([box(vec3(1, 1, 1), red)], vec3(0, 0, 10)), name: "Fan", description: "Supply" },
            { ...group([box(vec3(1, 1, 1), red)], vec3(0, 0, 20)), name: "Inspection" },
          ]),
          name: "AHU",
        },
      ]),
      {
        entity: (g) =>
          g.name === "AHU"
            ? { entity: "IfcUnitaryEquipment", predefinedType: "AIRHANDLER" }
            : g.name === "Fan"
              ? { entity: "IfcFan", predefinedType: "CENTRIFUGALBACKWARDINCLINEDCURVED" }
              : g.name === "Filter"
                ? { entity: "IfcFilter" }
                : undefined,
      }
    );
    expect(ifc).toMatch(/[=]IFCUNITARYEQUIPMENT\('[^']{22}',#\d+,'AHU',\$,\$,#\d+,\$,\$,\.AIRHANDLER\.\);/);
    expect(ifc).toMatch(/[=]IFCFAN\('[^']{22}',#\d+,'Fan','Supply',\$,#\d+,#\d+,\$,\.CENTRIFUGALBACKWARDINCLINEDCURVED\.\);/);
    expect(ifc).toMatch(/[=]IFCFILTER\('[^']{22}',#\d+,'Filter',\$,\$,#\d+,#\d+,\$,\.NOTDEFINED\.\);/);
    expect(ifc).toMatch(/[=]IFCBUILDINGELEMENTPROXY\('[^']{22}',#\d+,'Inspection',/);
    // Only the AHU is in the storey, the groups are aggregated into it
    expect(ifc).toMatch(/[=]IFCRELCONTAINEDINSPATIALSTRUCTURE\('[^']{22}',#\d+,\$,\$,\(#\d+\),#\d+\);/);
    expect(count(ifc, "IFCRELAGGREGATES")).toBe(4);
  });

  it("writes the owner history on every rooted entity and the author and application in the header", () => {
    const ifc = render(scene([group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [{ ...group([sphere(1, red)]), name: "Fan" }])]), {
      author: "Ivan",
      organization: "Acme",
      application: { name: "airCalc ACOM", version: "10.1" },
    });
    expect(ifc).toContain("/* name */ 'Abstract 3D.ifc',");
    expect(ifc).toContain("/* author */ ('Ivan'),\n/* organization */ ('Acme'),");
    expect(ifc).toContain("/* originating_system */ 'airCalc ACOM',");
    expect(ifc).toMatch(/[=]IFCPERSON\('Ivan',/);
    expect(ifc).toContain("IFCORGANIZATION($,'Acme',$,$,$)");
    expect(ifc).toMatch(/[=]IFCAPPLICATION\(#\d+,'10.1','airCalc ACOM','airCalc ACOM'\);/);
    expect(ifc).toMatch(/[=]IFCOWNERHISTORY\(#\d+,#\d+,\$,\.ADDED\.,\d+,\$,\$,\d+\);/);
    const ownerHistory = /^#(\d+)=IFCOWNERHISTORY\(/m.exec(ifc)![1];
    const rooted = Array.from(ifc.matchAll(/^#\d+=IFC\w+\('[^']{22}',([^,]+),/gm), (match) => match[1]);
    // Project, site, building, storey, 2 elements, 4 aggregates and the containment
    expect(rooted).toHaveLength(11);
    expect(rooted.every((owner) => owner === `#${ownerHistory}`)).toBe(true);
  });

  it("defaults the owner to an unknown author and organization and the application to Abstract 3D by Divid AB", () => {
    const ifc = render(scene([group([box(vec3(1, 1, 1), red)])]));
    expect(ifc).toContain("/* author */ (' '),\n/* organization */ ('UNKNOWN'),");
    expect(ifc).toContain("/* originating_system */ 'Abstract 3D',");
    expect(ifc).toContain("IFCORGANIZATION($,'UNKNOWN',$,$,$)");
    expect(ifc).toContain("IFCORGANIZATION($,'Divid AB',$,$,$)");
  });

  it("uses one organization as both owner and application developer when they're the same", () => {
    const ifc = render(scene([group([box(vec3(1, 1, 1), red)])]), { organization: "Divid AB" });
    expect(count(ifc, "IFCORGANIZATION")).toBe(1);
  });

  it("makes elements only of groups with an id or name, merging groups with only data into their parent", () => {
    const ifc = render(
      scene([
        group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [
          group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [{ ...group([sphere(1, red)]), id: "fan" }], { type: "panel", id: "data" }),
          { ...group([sphere(1, red)], vec3Zero, vec3Zero, [], { type: "motor" }), name: "Motor" },
        ]),
      ])
    );
    expect(count(ifc, "IFCBUILDINGELEMENTPROXY")).toBe(3);
    // The panel's box is merged into the top-level element, the element below the panel is aggregated into it
    expect(elementLayers(ifc, "Element 1")).toHaveLength(2);
    expect(count(ifc, "IFCRELAGGREGATES")).toBe(4);
    expect(ifc).toMatch(/[=]IFCRELAGGREGATES\('[^']{22}',#\d+,\$,\$,#\d+,\(#\d+,#\d+\)\);/);
  });

  it("puts the meshes on the layer of the nearest group above them with one, through elements and groups without one", () => {
    const ifc = render(scene([component("a1", "FAN"), component("a2", "FAN"), component("a3", "DUCTCONNECTORS")]));
    // Box, panel, fan and the motor two groups without a layer further down
    expect(elementLayers(ifc, "a1")).toEqual(["FAN", "SECTIONS", "FAN", "FAN"]);
    expect(elementLayers(ifc, "a3")).toEqual(["DUCTCONNECTORS", "SECTIONS", "DUCTCONNECTORS", "DUCTCONNECTORS"]);
    // One layer per name across the elements
    expect(count(ifc, "IFCPRESENTATIONLAYERASSIGNMENT")).toBe(3);
    expect(ifc).toMatch(/[=]IFCPRESENTATIONLAYERASSIGNMENT\('SECTIONS',\$,\(#\d+,#\d+,#\d+\),\$\);/);
    expect(ifc).toMatch(/[=]IFCPRESENTATIONLAYERASSIGNMENT\('FAN',\$,\((#\d+,){5}#\d+\),\$\);/);

    const nested = render(
      scene([
        {
          ...group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [
            { ...group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [], {}), name: "Inner" },
          ]),
          layer: "A",
        },
        group([box(vec3(1, 1, 1), red)]),
      ])
    );
    // Elements inherit the layer too, meshes without a layer above them get none
    expect(elementLayers(nested, "Inner")).toEqual(["A"]);
    expect(elementLayers(nested, "Element 2")).toEqual([undefined]);
    expect(count(nested, "IFCPRESENTATIONLAYERASSIGNMENT")).toBe(1);
  });

  it("only adds the layers to the output", () => {
    vi.useFakeTimers({ now: new Date("2026-10-12T10:00:00Z") });
    const fan = { ...group([sphere(1, red)], vec3Zero, vec3Zero, [group([cylinder(vec3Zero, 1, 2, red)])]), name: "Fan" };
    const s = (layer?: string): Scene => scene([group([box(vec3(1, 1, 1), red)], vec3(1, 2, 3), vec3(0.1, 0, 0), [{ ...fan, layer }])]);
    const plain = normalize(render(s()));
    const withLayer = normalize(render(s("A")));
    vi.useRealTimers();
    expect(count(plain, "IFCPRESENTATIONLAYERASSIGNMENT")).toBe(0);
    expect(withLayer.replace(/^#\d+=IFCPRESENTATIONLAYERASSIGNMENT\('A',\$,\(#\d+,#\d+\),\$\);\n/m, "")).toBe(plain);
  });

  it("writes a relation between two elements as a source port and a sink port nested in them and connected", () => {
    const ifc = render(
      scene(
        [
          { ...group([box(vec3(1, 1, 1), red)]), id: "filter" },
          { ...group([box(vec3(1, 1, 1), red)], vec3(100, 0, 0)), id: "fan" },
        ],
        [{ id: "r1", from: "filter", to: "fan", pos: vec3(50, 0, 0), name: "Filter to fan" }]
      ),
      { port: () => ({ predefinedType: "DUCT", systemType: "VENTILATION" }) }
    );
    const ports = Array.from(
      ifc.matchAll(/^#(\d+)=IFCDISTRIBUTIONPORT\('[^']{22}',#\d+,'Filter to fan',\$,\$,#\d+,\$,\.(\w+)\.,\.DUCT\.,\.VENTILATION\.\);$/gm)
    );
    expect(ports.map(([, , flow]) => flow)).toEqual(["SOURCE", "SINK"]);
    const [source, sink] = ports.map(([, id]) => id);
    expect(ifc).toMatch(new RegExp(`=IFCRELCONNECTSPORTS\\('[^']{22}',#\\d+,\\$,\\$,#${source},#${sink},\\$\\);`));
    expect(ifc).toMatch(new RegExp(`=IFCRELNESTS\\('[^']{22}',#\\d+,\\$,\\$,#${named(ifc, "filter")},\\(#${source}\\)\\);`));
    expect(ifc).toMatch(new RegExp(`=IFCRELNESTS\\('[^']{22}',#\\d+,\\$,\\$,#${named(ifc, "fan")},\\(#${sink}\\)\\);`));
    // Each port is placed relative to its element, the fan's at -50 along x
    const byId = entities(ifc);
    const [, sinkPlacement] = ids(byId.get(sink)!);
    expect(ids(byId.get(sinkPlacement)!)[0]).toBe(ids(byId.get(named(ifc, "fan"))!)[1]);
    expect(ifc).toContain("IFCCARTESIANPOINT((-50.,0.,0.))");
    // Ports are only nested, not contained in the storey
    expect(ifc).toMatch(/[=]IFCRELCONTAINEDINSPATIALSTRUCTURE\('[^']{22}',#\d+,\$,\$,\(#\d+,#\d+\),#\d+\);/);
  });

  it("writes sibling groups with the same id as one element, its parts in their places, with ports from relations to either part", () => {
    const ifc = render(
      scene(
        [
          { ...group([box(vec3(1, 1, 1), red)], vec3(0, 0, 0)), id: "exchanger", name: "PTD", description: "Plate", layer: "SUPPLY" },
          { ...group([box(vec3(1, 1, 1), red)], vec3(0, 100, 0)), id: "exchanger", name: "PTD", description: "Plate", layer: "EXHAUST" },
          { ...group([box(vec3(1, 1, 1), red)], vec3(100, 100, 0)), id: "filter" },
        ],
        [{ id: "r1", from: "filter", to: "exchanger", pos: vec3(50, 100, 0) }]
      )
    );

    expect(count(ifc, "IFCBUILDINGELEMENTPROXY")).toBe(2);
    expect(ifc).toMatch(/[=]IFCBUILDINGELEMENTPROXY\('[^']{22}',#\d+,'PTD','Plate',/);
    expect(elementLayers(ifc, "PTD")).toEqual(["SUPPLY", "EXHAUST"]);
    expect(placementOf(ifc, "PTD")[0]).toBe("IFCCARTESIANPOINT((0.,0.,0.))");
    expect(count(ifc, "IFCRELCONNECTSPORTS")).toBe(1);
  });

  it("writes a relation with one element as an open port with the relation's groups as its shape, and leaves out relations without elements", () => {
    const terminal = { ...group([plane(vec3Zero, vec2(10, 10), red)], vec3(50, 0, 0)), id: "terminal", layer: "DUCTCONNECTORS" };
    const ifc = render(
      scene(
        [{ ...group([box(vec3(1, 1, 1), red)]), id: "fan" }],
        [
          { id: "sup", from: "fan", to: "terminal", pos: vec3(50, 0, 0), name: "SUP", groups: [terminal] },
          { id: "oda", to: "fan", pos: vec3(-50, 0, 0), name: "ODA" },
          { id: "unknown", from: "nothing", to: "missing", pos: vec3Zero, name: "Unknown" },
        ]
      )
    );
    expect(count(ifc, "IFCDISTRIBUTIONPORT")).toBe(2);
    expect(ifc).toMatch(/[=]IFCDISTRIBUTIONPORT\('[^']{22}',#\d+,'SUP',\$,\$,#\d+,#\d+,\.SOURCE\.,\.NOTDEFINED\.,\$\);/);
    expect(ifc).toMatch(/[=]IFCDISTRIBUTIONPORT\('[^']{22}',#\d+,'ODA',\$,\$,#\d+,\$,\.SINK\.,\.NOTDEFINED\.,\$\);/);
    expect(count(ifc, "IFCRELCONNECTSPORTS")).toBe(0);
    // Both ports in one nesting
    expect(count(ifc, "IFCRELNESTS")).toBe(1);
    // The shape is relative to the port, the terminal's group isn't an element
    expect(elementLayers(ifc, "SUP")).toEqual(["DUCTCONNECTORS"]);
    expect(ifc).toContain("(5.,0.,5.)");
    expect(ifc).not.toContain("'terminal'");
    expect(ifc).not.toContain("'Unknown'");
  });

  it("places a port in its element's rotated axes, and the relation's shape on the source's port only", () => {
    const ifc = render(
      scene(
        [
          { ...group([box(vec3(1, 1, 1), red)], vec3Zero, vec3(0, Math.PI / 2, 0)), id: "a" },
          { ...group([box(vec3(1, 1, 1), red)], vec3(0, 0, -20)), id: "b" },
        ],
        [
          {
            id: "r",
            from: "a",
            to: "b",
            name: "A to B",
            pos: vec3(0, 0, -10),
            rot: vec3(0, Math.PI / 2, 0),
            groups: [group([plane(vec3Zero, vec2(1, 1), red)], vec3(0, 0, -10), vec3(0, Math.PI / 2, 0))],
          },
        ]
      )
    );
    const [source, sink] = Array.from(ifc.matchAll(/^#(\d+)=IFCDISTRIBUTIONPORT\(.*'A to B',\$,\$,#\d+,([#$\d]+),/gm), ([, , shape]) => shape);
    expect(source).toMatch(/^#\d+$/);
    expect(sink).toBe("$");
    // The element is turned 90° around Y-up so its x points along -z, where the relation is, and the relation turned the same way
    const byId = entities(ifc);
    const [sourcePort] = Array.from(ifc.matchAll(/^#(\d+)=IFCDISTRIBUTIONPORT\(/gm), (match) => match[1]);
    const [, placement] = ids(byId.get(sourcePort)!);
    const [, axes] = ids(byId.get(placement)!);
    expect(ids(byId.get(axes)!).map((id) => byId.get(id))).toEqual([
      "IFCCARTESIANPOINT((10.,0.,0.))",
      "IFCDIRECTION((0.,0.,1.))",
      "IFCDIRECTION((1.,0.,0.))",
    ]);
    expect(placementOf(ifc, "b")[0]).toBe("IFCCARTESIANPOINT((0.,20.,0.))");
  });

  it("only references entities that exist", () => {
    const ifc = render(
      scene(
        [
          {
            ...group([box(vec3(1, 1, 1), red), line(vec3Zero, vec3(1, 1, 1), 1, red)], vec3(1, 2, 3), vec3(0.1, 0.2, 0.3), [group([sphere(1, red)])]),
            id: "a",
          },
          { ...group([box(vec3(1, 1, 1), red)]), id: "b" },
        ],
        [
          { id: "r", from: "a", to: "b", pos: vec3Zero, groups: [group([plane(vec3Zero, vec2(1, 1), red)], vec3(1, 2, 3), vec3(0.1, 0.2, 0.3))] },
          { id: "o", from: "b", pos: vec3Zero },
        ]
      )
    );
    const ids = new Set(Array.from(ifc.matchAll(/^#(\d+)=/gm), (match) => match[1]));
    const referenced = Array.from(ifc.matchAll(/[(,]#(\d+)/g), (match) => match[1]);
    expect(referenced.filter((id) => !ids.has(id))).toEqual([]);
  });
});
