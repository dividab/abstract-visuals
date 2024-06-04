import { Vec3, vec3Sub } from "../../abstract-3d.js";

export const stlTriangle = (vec1: Vec3, vec2: Vec3, vec3: Vec3): string => {
  const v = vec3Sub(vec2, vec1);
  const w = vec3Sub(vec3, vec1);
  const nx = v.y * w.z - v.z * w.y;
  const ny = v.z * w.x - v.x * w.z;
  const nz = v.x * w.y - v.y * w.x;
  const sum = Math.sqrt(nx * nx + ny * ny + nz * nz);
  return `facet normal ${nx / sum} ${ny / sum} ${nz / sum}
  outer loop
    vertex ${vec1.x} ${vec1.y} ${vec1.z}
    vertex ${vec2.x} ${vec2.y} ${vec2.z}
    vertex ${vec3.x} ${vec3.y} ${vec3.z}
  endloop
endfacet
`;
};

export function stlPlaneOfVertices(v1: Vec3, v2: Vec3, v3: Vec3, v4: Vec3): string {
  return stlTriangle(v1, v2, v3) + stlTriangle(v3, v4, v1);
}
