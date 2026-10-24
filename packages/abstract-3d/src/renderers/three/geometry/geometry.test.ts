import { type BufferGeometry, Vector3 } from "three";
import { describe, expect, it } from "vitest";
import type { Mesh } from "../../../abstract-3d.js";
import { box, circleCurve, cone, cylinder, plane, polygon, roundHole, shape, sphere, tube, vec2, vec3, vec3Zero } from "../../../abstract-3d.js";
import { createSolidGeometry, getSolidShape, keepGeometries } from "./geometry.js";

const m = { normal: "rgb(0,0,0)" };
const local = (mesh: Mesh, x: number, y: number, z: number): ReadonlyArray<number> =>
  new Vector3(x, y, z)
    .applyMatrix4(getSolidShape(mesh.geometry)!.local)
    .toArray()
    .map((v) => Math.round(v * 1000) / 1000 + 0);
const key = (mesh: Mesh): string => getSolidShape(mesh.geometry)!.key;
const bounds = (mesh: Mesh): ReadonlyArray<number> => {
  const geometry = createSolidGeometry(mesh.geometry);
  geometry.computeBoundingBox();
  return [...geometry.boundingBox!.min.toArray(), ...geometry.boundingBox!.max.toArray()].map((v) => Math.round(v * 1000) / 1000 + 0);
};

describe("getSolidShape", () => {
  it("shares unit geometries between primitives of any size, scaled by the local matrix", () => {
    expect(key(box(vec3(1, 2, 3), m))).toBe(key(box(vec3(4, 5, 6), m)));
    expect(local(box(vec3(2, 4, 6), m, vec3(10, 0, 0)), 0.5, 0.5, 0.5)).toEqual([11, 2, 3]);
    expect(local(plane(vec3Zero, vec2(2, 4), m), 0.5, 0.5, 0)).toEqual([1, 2, 0]);
    expect(local(sphere(3, m, vec3(1, 0, 0)), 1, 0, 0)).toEqual([4, 0, 0]);
    expect(local(cone(vec3Zero, 2, 10, m), 1, 0.5, 0)).toEqual([2, 5, 0]);
  });

  it("scales cylinders by their largest radius, with a geometry per radius ratio", () => {
    expect(key(cylinder(vec3Zero, 1, 2, m))).toBe(key(cylinder(vec3Zero, 5, 7, m)));
    expect(key(cylinder(vec3Zero, 1, 2, m))).not.toBe(key(cylinder(vec3Zero, 1, 2, m, vec3Zero, false, [], 0, Math.PI * 2, 2)));
    expect(local(cylinder(vec3Zero, 1, 10, m, vec3Zero, false, [], 0, Math.PI * 2, 4), 1, 0.5, 0)).toEqual([4, 5, 0]);
  });

  it("shares geometries between identical shapes", () => {
    const triangle = polygon([vec3(0, 0, 0), vec3(1, 0, 0), vec3(1, 1, 0)], m);
    expect(key(triangle)).toBe(key(polygon([vec3(0, 0, 0), vec3(1, 0, 0), vec3(1, 1, 0)], m)));
  });

  it("ignores zero holes", () => {
    expect(key(box(vec3(1, 1, 1), m, vec3Zero, vec3Zero, [roundHole(vec2(0, 0), 0)]))).toBe(key(box(vec3(2, 2, 2), m)));
  });

  it("extrudes primitives with holes into their own geometry, centered", () => {
    const holed = box(vec3(10, 10, 2), m, vec3(1, 0, 0), vec3Zero, [roundHole(vec2(0, 0), 2)]);
    expect(key(holed)).not.toBe(key(box(vec3(10, 10, 2), m)));
    expect(local(holed, 0, 0, 0)).toEqual([1, 0, 0]);
    expect(bounds(holed)).toEqual([-5, -5, -1, 5, 5, 1]);
    expect(bounds(cylinder(vec3Zero, 2, 10, m, vec3Zero, false, [roundHole(vec2(0, 0), 1)]))).toEqual([-2, -5, -2, 2, 5, 2]);
  });
});

describe("createSolidGeometry", () => {
  it("closes partial cylinders with walls", () => {
    const whole = createSolidGeometry(cylinder(vec3Zero, 1, 1, m).geometry);
    const half = createSolidGeometry(cylinder(vec3Zero, 1, 1, m, vec3Zero, false, [], 0, Math.PI).geometry);
    expect(half.getAttribute("position").count).toBeGreaterThan(whole.getAttribute("position").count / 2);
  });

  it("draws 4-point polygons as a quad and other polygons as a triangle list", () => {
    expect(createSolidGeometry(polygon([vec3(0, 0, 0), vec3(1, 0, 0), vec3(1, 1, 0), vec3(0, 1, 0)], m).geometry).index!.count).toBe(6);
    expect(createSolidGeometry(polygon([vec3(0, 0, 0), vec3(1, 0, 0), vec3(1, 1, 0)], m).geometry).index!.count).toBe(3);
  });

  it("gives every geometry an index, normals and uvs, so they can share a batch", () => {
    const meshes = [
      box(vec3(1, 1, 1), m),
      box(vec3(1, 1, 1), m, vec3Zero, vec3Zero, [roundHole(vec2(0, 0), 0.1)]),
      polygon([vec3(0, 0, 0), vec3(1, 0, 0), vec3(1, 1, 0)], m),
      cylinder(vec3Zero, 1, 1, m, vec3Zero, false, [], 0, Math.PI),
      shape([vec2(0, 0), vec2(1, 0), vec2(0, 1)], vec3Zero, m, 1),
      tube(circleCurve(10, 0, Math.PI), 1, m),
    ];
    meshes.forEach((mesh) => {
      const geometry = createSolidGeometry(mesh.geometry);
      expect(geometry.index!.count).toBeGreaterThan(0);
      expect(Object.keys(geometry.attributes).sort()).toEqual(["normal", "position", "uv"]);
    });
  });
});

describe("keepGeometries", () => {
  it("disposes the geometries a build no longer uses", () => {
    const [kept, unused] = [createSolidGeometry(box(vec3(1, 1, 1), m).geometry), createSolidGeometry(sphere(1, m).geometry)];
    const cache = new Map<string, BufferGeometry>([
      ["Box", kept],
      ["Sphere", unused],
    ]);
    const disposed: Array<string> = [];
    unused.addEventListener("dispose", () => disposed.push("Sphere"));
    keepGeometries(cache, new Set(["Box"]));
    expect(disposed).toEqual(["Sphere"]);
    expect([...cache.keys()]).toEqual(["Box"]);
  });
});
