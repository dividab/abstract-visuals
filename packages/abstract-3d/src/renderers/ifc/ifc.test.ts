import { describe, expect, it } from "vitest";
import type { Scene } from "../../abstract-3d.js";
import { box, cylinder, group, line, roundHole, sphere, vec2, vec3, vec3Zero } from "../../abstract-3d.js";
import { guid, ifcFile, real, str } from "./ifc-encoding.js";
import { triangulate } from "./ifc-geometry.js";
import { render } from "./ifc.js";

const red = { normal: "rgb(255, 0, 0)", opacity: 0.5 };
const scene = (groups: Scene["groups"]): Scene => ({ size_deprecated: vec3Zero, groups });
const count = (ifc: string, entity: string): number => ifc.split(`=${entity}(`).length - 1;

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
    // The line-only and the empty group are left out, the group without data is merged into its parent
    expect(count(ifc, "IFCBUILDINGELEMENTPROXY")).toBe(3);
    expect(count(ifc, "IFCTRIANGULATEDFACESET")).toBe(4);
    expect(count(ifc, "IFCRELAGGREGATES")).toBe(4);
    expect(count(ifc, "IFCRELCONTAINEDINSPATIALSTRUCTURE")).toBe(1);
    // The merged box keeps its group's offset, Y-up 100 + half height becomes Z
    expect(ifc).toContain("(1.,-1.,101.)");
    // Same material is styled once
    expect(count(ifc, "IFCSURFACESTYLE")).toBe(1);
    expect(ifc).toContain("IFCCOLOURRGB($,1.,0.,0.)");
    expect(ifc).toContain("IFCSURFACESTYLESHADING(#");
    expect(ifc).toContain(",'588c9525-0f1b-4b0b-a3e1-ba10f8a922ff',$,$,#");
    expect(ifc).toContain(",'588c9525-0f1b-4b0b-a3e1-ba10f8a922ff',.NOTDEFINED.)");
    expect(ifc).toContain(",'Fan',$,$,#");
    // IFC requires a name, top-level groups without data are named after their position
    expect(ifc).toContain(",'Element 2',$,$,#");
  });

  it("wraps the scene in one root element", () => {
    const ifc = render(
      scene([
        group([box(vec3(1, 1, 1), red)], vec3Zero, vec3Zero, [], { name: "Filter" }),
        group([box(vec3(1, 1, 1), red)], vec3(0, 0, 10), vec3Zero, [], { name: "Fan" }),
      ]),
      { root: { entity: "IfcUnitaryEquipment", predefinedType: "AIRHANDLER", name: "AHU" } }
    );
    expect(ifc).toMatch(/[=]IFCUNITARYEQUIPMENT\('[^']{22}',\$,'AHU',\$,\$,#\d+,\$,\$,\.AIRHANDLER\.\);/);
    expect(count(ifc, "IFCBUILDINGELEMENTPROXY")).toBe(2);
    // Only the root is in the storey, the groups are aggregated into it
    expect(ifc).toMatch(/[=]IFCRELCONTAINEDINSPATIALSTRUCTURE\('[^']{22}',\$,\$,\$,\(#\d+\),#\d+\);/);
    expect(count(ifc, "IFCRELAGGREGATES")).toBe(4);
  });

  it("only references entities that exist", () => {
    const ifc = render(scene([group([box(vec3(1, 1, 1), red)], vec3(1, 2, 3), vec3(0.1, 0.2, 0.3), [group([sphere(1, red)])])]));
    const ids = new Set(Array.from(ifc.matchAll(/^#(\d+)=/gm), (match) => match[1]));
    const referenced = Array.from(ifc.matchAll(/[(,]#(\d+)/g), (match) => match[1]);
    expect(referenced.filter((id) => !ids.has(id))).toEqual([]);
  });
});
