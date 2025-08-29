import {
  Plane,
  Vec2,
  Vec3,
  View,
  vec2Scale,
  vec3TransRot,
  vec3RotCombine,
  vec3Zero,
  vec3,
  isZero,
  vec2,
  vec3ZMean,
  Material,
} from "../../../abstract-3d.js";
import { gray, black, zElem, zOrderElement } from "./shared.js";
import { EmbededImage, svgImage, svgPolygon } from "../svg-encoding.js";
import { rgbGrayScale } from "../../shared.js";

export function plane(
  p: Plane,
  point: (x: number, y: number) => Vec2,
  material: Material,
  onlyStroke: boolean | undefined,
  grayScale: boolean | undefined,
  stroke: number,
  onlyStrokeFill: string,
  parentPos: Vec3,
  parentRot: Vec3,
  view: View,
  imageDataByUrl: Record<string, Uint8Array | string> | undefined
): ReadonlyArray<zOrderElement> {
  const half = vec2Scale(p.size, 0.5);
  const pos = vec3TransRot(p.pos, parentPos, parentRot);
  const rot = vec3RotCombine(parentRot, p.rot ?? vec3Zero);
  const vec3tr = (x: number, y: number): Vec3 => vec3TransRot(vec3(x, y, 0), pos, rot);

  const v1 = vec3tr(-half.x, -half.y);
  const v2 = vec3tr(half.x, -half.y);
  const v3 = vec3tr(half.x, half.y);
  const v4 = vec3tr(-half.x, half.y);

  const imageData = material.imageUrl ? imageDataByUrl?.[material.imageUrl] : undefined;
  const image: EmbededImage | undefined =
    material.imageUrl && typeof imageData === "string"
      ? { type: "svg", svg: imageData }
      : material.imageUrl
      ? { type: "url", url: imageData instanceof Uint8Array ? toBase64String(imageData) : material.imageUrl }
      : undefined;

  if (view === "front" && image) {
    const [leftX, rightX] = v4.x > v2.x ? [v2.x, v4.x] : [v4.x, v2.x];
    const [bottomY, topY] = v4.y > v2.y ? [v4.y, v2.y] : [v2.y, v4.y];
    const bottomLeft = point(leftX, bottomY);
    const topRight = point(rightX, topY);
    const degrees = isZero(rot.z, 0.1) ? 0 : rot.z * (-180 / Math.PI);
    const img = svgImage(bottomLeft, vec2(topRight.x - bottomLeft.x, topRight.y - bottomLeft.y), degrees, image);
    return [zElem(img, (v2.z + v4.z) / 2)];
  }

  const points = [point(v1.x, v1.y), point(v2.x, v2.y), point(v3.x, v3.y), point(v4.x, v4.y)];

  const [strokeColor, fill, strokeThickness] = onlyStroke
    ? [grayScale ? gray : material.normal, onlyStrokeFill, stroke]
    : [black, grayScale ? rgbGrayScale(material.normal) : material.normal, 0];
  return [zElem(svgPolygon(points, fill, strokeColor, strokeThickness), vec3ZMean(v1, v2, v3, v4))];
}

function toBase64String(u8: Uint8Array): string {
  const imageFormat = u8[0] === 0xff && u8[1] === 0xd8 ? "image/jpeg" : "image/png";
  // Node
  if (typeof Buffer !== "undefined") {
    return `data:${imageFormat};base64,${Buffer.from(u8).toString("base64")}`;
  }
  // Browser
  let bin = "";
  for (const e of u8) {
    bin += String.fromCharCode(e);
  }

  return `data:${imageFormat};base64,${btoa(bin)}`;
}
