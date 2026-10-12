import { describe, expect, it, vi } from "vitest";
import type { Scene } from "../../abstract-3d.js";
import { box, culledLine, cylinder, group, line, roundHole, sphere, vec2, vec3, vec3Zero } from "../../abstract-3d.js";
import { guid, ifcFile, real, str } from "./ifc-encoding.js";
import { polyline, triangulate } from "./ifc-geometry.js";
import { render } from "./ifc.js";

const red = { normal: "rgb(255, 0, 0)", opacity: 0.5 };
const scene = (groups: Scene["groups"]): Scene => ({ size_deprecated: vec3Zero, groups });
const count = (ifc: string, entity: string): number => ifc.split(`=${entity}(`).length - 1;
const ids = (s: string): ReadonlyArray<string> => Array.from(s.matchAll(/#(\d+)/g), (match) => match[1]);
/** Random GlobalIds replaced, to compare files */
const normalize = (ifc: string): string => ifc.replaceAll(/'[0-9A-Za-z_$]{22}'/g, "'guid'");

const entities = (ifc: string): ReadonlyMap<string, string> => new Map(Array.from(ifc.matchAll(/^#(\d+)=(.*);$/gm), (match) => [match[1], match[2]]));

/** The layer of every face set and polyline of the element named `name`, in order */
function elementLayers(ifc: string, name: string): ReadonlyArray<string | undefined> {
  const byId = entities(ifc);
  const layers = new Map(
    Array.from(ifc.matchAll(/[=]IFCPRESENTATIONLAYERASSIGNMENT\('([^']*)',\$,\(([^)]*)\),\$\);/g)).flatMap(([, layer, items]) =>
      ids(items).map((item) => [item, layer] as const)
    )
  );
  // The element's owner history, placement and shape, the shape's representations and their context and items
  const [, , shape] = ids(Array.from(byId.values()).find((e) => e.includes(`,'${name}',$,$,#`))!);
  const items = ids(byId.get(shape)!).flatMap((representation) => ids(byId.get(representation)!).slice(1));
  return items.map((item) => layers.get(item));
}

/** An air handler component with a panel and a fan with a motor, the motor's meshes two groups without data down */
const component = (id: string, key: string): Scene["groups"][number] =>
  group(
    [box(vec3(1, 1, 1), red)],
    vec3Zero,
    vec3Zero,
    [
      group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [], { type: "panel" }),
      group([sphere(1, red)], vec3Zero, vec3Zero, [group([], vec3Zero, vec3Zero, [group([cylinder(vec3Zero, 1, 2, red)])])], { type: "fan_wall" }),
    ],
    { id, key }
  );

const layered = (layer: string, groups: Scene["groups"]): Scene["groups"][number] => group([], vec3Zero, vec3Zero, groups, { layer });

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
  it("writes an element per top-level group and group with data, merging groups without data into their parent", () => {
    const ifc = render(
      scene([
        group(
          [box(vec3(1, 1, 1), red)],
          vec3Zero,
          vec3Zero,
          [
            group([sphere(1, red)], vec3Zero, vec3Zero, [], { name: "Fan" }),
            group([box(vec3(2, 2, 2), red)], vec3(0, 100, 0)),
            group([line(vec3Zero, vec3(1, 0, 0), 1, red)], vec3Zero, vec3Zero, [], { name: "Lines only" }),
          ],
          { id: "588c9525-0f1b-4b0b-a3e1-ba10f8a922ff" }
        ),
        group([box(vec3(1, 1, 1), red)]),
        group([]),
      ])
    );
    expect(ifc).toMatch(/^ISO-10303-21;/);
    expect(ifc).toContain("FILE_SCHEMA(('IFC4'));");
    expect(ifc.trimEnd()).toMatch(/END-ISO-10303-21;$/);
    // The empty group is left out, the group without data is merged into its parent
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
    expect(ifc).toContain(",'588c9525-0f1b-4b0b-a3e1-ba10f8a922ff',$,$,#");
    expect(ifc).toContain(",'588c9525-0f1b-4b0b-a3e1-ba10f8a922ff',.NOTDEFINED.)");
    expect(ifc).toContain(",'Fan',$,$,#");
    // IFC requires a name, top-level groups without data are named after their position
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
        group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [group([line(vec3(1, 2, 3), vec3(4, 5, 6), 2, green)], vec3(0, 100, 0))], {
          layer: "A",
        }),
      ]),
      { layer: (path) => path.at(-1)?.layer }
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
        group([line(vec3Zero, vec3(1, 0, 0), 1, green), culledLine(vec3Zero, vec3(0, 1, 0), vec3(0, 0, 1), 1, green)], vec3Zero, vec3Zero, [], {
          name: "Lines only",
        }),
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

  it("wraps the scene in one root element", () => {
    const ifc = render(
      scene([
        group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [], { name: "Filter" }),
        group([box(vec3(1, 1, 1), red)], vec3(0, 0, 10), vec3Zero, [], { name: "Fan" }),
      ]),
      { root: { entity: "IfcUnitaryEquipment", predefinedType: "AIRHANDLER", name: "AHU" } }
    );
    expect(ifc).toMatch(/[=]IFCUNITARYEQUIPMENT\('[^']{22}',#\d+,'AHU',\$,\$,#\d+,\$,\$,\.AIRHANDLER\.\);/);
    expect(count(ifc, "IFCBUILDINGELEMENTPROXY")).toBe(2);
    // Only the root is in the storey, the groups are aggregated into it
    expect(ifc).toMatch(/[=]IFCRELCONTAINEDINSPATIALSTRUCTURE\('[^']{22}',#\d+,\$,\$,\(#\d+\),#\d+\);/);
    expect(count(ifc, "IFCRELAGGREGATES")).toBe(4);
  });

  it("writes the owner history on every rooted entity and the author and application in the header", () => {
    const ifc = render(
      scene([group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [group([sphere(1, red)], vec3Zero, vec3Zero, [], { name: "Fan" })])]),
      {
        author: "Ivan",
        organization: "Acme",
        application: { name: "airCalc ACOM", version: "10.1" },
      }
    );
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

  it("makes elements only of groups with data.id or data.name, merging groups with other data into their parent", () => {
    const ifc = render(
      scene([
        group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [
          group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [group([sphere(1, red)], vec3Zero, vec3Zero, [], { id: "fan" })], { type: "panel" }),
          group([sphere(1, red)], vec3Zero, vec3Zero, [], { name: "Motor", type: "motor" }),
        ]),
      ])
    );
    expect(count(ifc, "IFCBUILDINGELEMENTPROXY")).toBe(3);
    // The panel's box is merged into the top-level element, the element below the panel is aggregated into it
    expect(elementLayers(ifc, "Element 1")).toHaveLength(2);
    expect(count(ifc, "IFCRELAGGREGATES")).toBe(4);
    expect(ifc).toMatch(/[=]IFCRELAGGREGATES\('[^']{22}',#\d+,\$,\$,#\d+,\(#\d+,#\d+\)\);/);
  });

  it("puts the meshes on the layer of the nearest group above them with one, from the data path of the root and the groups with data", () => {
    const paths: Array<ReadonlyArray<Record<string, string>>> = [];
    const ifc = render(scene([component("a1", "FAN"), component("a2", "FAN"), component("a3", "DUCTCONNECTORS")]), {
      root: { entity: "IfcUnitaryEquipment", predefinedType: "AIRHANDLER", name: "AHU" },
      layer: (path) => {
        paths.push(path);
        const key = path.filter((d) => "key" in d).at(-1)?.key;
        return path.at(-1)?.type === "panel" ? "acomSECTIONS" : key ? `acom${key}` : undefined;
      },
    });
    // Box, panel, fan and the motor two groups without data further down
    expect(elementLayers(ifc, "a1")).toEqual(["acomFAN", "acomSECTIONS", "acomFAN", "acomFAN"]);
    expect(elementLayers(ifc, "a3")).toEqual(["acomDUCTCONNECTORS", "acomSECTIONS", "acomDUCTCONNECTORS", "acomDUCTCONNECTORS"]);
    // One layer per name across the elements
    expect(count(ifc, "IFCPRESENTATIONLAYERASSIGNMENT")).toBe(3);
    expect(ifc).toMatch(/[=]IFCPRESENTATIONLAYERASSIGNMENT\('acomSECTIONS',\$,\(#\d+,#\d+,#\d+\),\$\);/);
    expect(ifc).toMatch(/[=]IFCPRESENTATIONLAYERASSIGNMENT\('acomFAN',\$,\((#\d+,){5}#\d+\),\$\);/);
    expect(paths).toContainEqual([{ name: "AHU" }, { id: "a1", key: "FAN" }, { type: "panel" }]);
    // The root, 3 components and their panel and fan, groups without data are skipped
    expect(paths).toHaveLength(10);
  });

  it("inherits the layer through groups without data and groups the layer returns undefined or an empty name for", () => {
    const ifc = render(
      scene([
        group(
          [box(vec3(1, 1, 1), red)],
          vec3Zero,
          vec3Zero,
          [
            group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [], { type: "panel" }),
            layered("", [group([box(vec3(1, 1, 1), red)])]),
            layered("B", [group([], vec3Zero, vec3Zero, [group([box(vec3(1, 1, 1), red)])])]),
            layered("B", [group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [], { name: "Inner", type: "fan" })]),
          ],
          { layer: "A" }
        ),
        group([box(vec3(1, 1, 1), red)]),
      ]),
      { layer: (path) => path.at(-1)?.layer }
    );
    expect(elementLayers(ifc, "Element 1")).toEqual(["A", "A", "A", "B"]);
    expect(elementLayers(ifc, "Inner")).toEqual(["B"]);
    // Meshes without a layer above them get none
    expect(elementLayers(ifc, "Element 2")).toEqual([undefined]);
    expect(count(ifc, "IFCPRESENTATIONLAYERASSIGNMENT")).toBe(2);
  });

  it("only adds the layers to the output", () => {
    vi.useFakeTimers({ now: new Date("2026-10-12T10:00:00Z") });
    const s = scene([
      group([box(vec3(1, 1, 1), red)], vec3(1, 2, 3), vec3(0.1, 0, 0), [
        group([sphere(1, red)], vec3Zero, vec3Zero, [group([cylinder(vec3Zero, 1, 2, red)])], { name: "Fan" }),
      ]),
    ]);
    const plain = normalize(render(s));
    const undefinedLayers = normalize(render(s, { layer: () => undefined }));
    const withLayers = normalize(render(s, { layer: () => "A" }));
    vi.useRealTimers();
    expect(count(plain, "IFCPRESENTATIONLAYERASSIGNMENT")).toBe(0);
    expect(undefinedLayers).toBe(plain);
    // Only the fan's meshes are in a group with data
    expect(withLayers.replace(/^#\d+=IFCPRESENTATIONLAYERASSIGNMENT\('A',\$,\(#\d+,#\d+\),\$\);\n/m, "")).toBe(plain);
  });

  it("only references entities that exist", () => {
    const ifc = render(
      scene([group([box(vec3(1, 1, 1), red), line(vec3Zero, vec3(1, 1, 1), 1, red)], vec3(1, 2, 3), vec3(0.1, 0.2, 0.3), [group([sphere(1, red)])])])
    );
    const ids = new Set(Array.from(ifc.matchAll(/^#(\d+)=/gm), (match) => match[1]));
    const referenced = Array.from(ifc.matchAll(/[(,]#(\d+)/g), (match) => match[1]);
    expect(referenced.filter((id) => !ids.has(id))).toEqual([]);
  });
});
