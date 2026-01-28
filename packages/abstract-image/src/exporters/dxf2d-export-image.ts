import { AbstractImage } from "../model/abstract-image.js";
import { Component, corners } from "../model/component.js";
import { Size } from "../model/size.js";

export const DXF_DATA_URL = "data:application/dxf,";

export function dxf2dExportImage(root: AbstractImage): string {
  let svg = "";
  let layer = 0;

  svg += "999\nELIGO DXF GENERATOR\n";

  /* HEADER */
  svg += "0\nSECTION\n2\nHEADER\n";
  svg += "9\n$ACADVER\n1\nAC1009\n9\n$INSBASE\n10\n0.0\n20\n0.0\n30\n0.0\n";
  svg += "9\n$EXTMIN\n10\n0.0\n20\n0.0\n";
  svg += "9\n$EXTMAX\n";
  svg += "10\n" + root.size.width.toString() + "\n";
  svg += "20\n" + root.size.height.toString() + "\n";
  svg += "0\nENDSEC\n";

  let entities = "";
  let blocks = "";
  for (const component of root.components) {
    const [newSvg, newBlocks] = componentSvg(component, layer, root.size);
    entities += newSvg;
    blocks += newBlocks;
  }
  /* BLOCKS */
  svg += "0\nSECTION\n2\nBLOCKS\n";
  svg += blocks;
  svg += "0\nENDSEC\n";

  /* ENTITIES */
  svg += "0\nSECTION\n2\nENTITIES\n";
  svg += entities;
  svg += "0\nENDSEC\n";

  svg += "0\nEOF";

  return svg;
}

function componentSvg(c: Component, layer: number, size: Size): readonly [string, string] {
  let svg = "";
  let blocks = "";

  if (c.type === "group") {
    for (const child of c.children) {
      const [newSvg, newBlocks] = componentSvg(child, layer, size);
      svg += newSvg;
      blocks += newBlocks;
    }
    return [svg, blocks];
  }

  if (c.type == "binaryimage") {
    if (c.format !== "dxf" || c.data.type !== "url" || !c.data.url.startsWith(DXF_DATA_URL)) {
      return [svg, blocks];
    }

    const dxf = c.data.url.split(DXF_DATA_URL)[1];
    if (!dxf) {
      return [svg, blocks];
    }

    const extents = extractExtents(c.data.url);
    const entities = extractEntities(c.data.url);
    if (!extents || !entities) {
      return [svg, blocks];
    }
    const srcW = extents.maxX - extents.minX;
    const srcH = extents.maxY - extents.minY;

    const targetW = c.bottomRight.x - c.topLeft.x;
    const targetH = c.bottomRight.y - c.topLeft.y;

    const sx = targetW / srcW;
    const sy = targetH / srcH;

    svg += "0\nINSERT\n";
    svg += "8\nImages\n";
    svg += "2\n" + c.id + "\n";
    svg += "10\n" + (c.topLeft.x - extents.minX * sx) + "\n";
    svg += "20\n" + (invert(c.topLeft.y, size.height) - extents.minY * sy) + "\n";
    svg += "30\n0\n";
    svg += "41\n" + sx + "\n";
    svg += "42\n" + -sy + "\n";

    blocks +=
      "0\nBLOCK\n" +
      "2\n" +
      c.id +
      "\n" +
      "70\n0\n" +
      "10\n0\n20\n0\n30\n0\n" +
      "3\n" +
      c.id +
      "\n" +
      "1\n\n" +
      extractEntities(c.data.url) +
      "\n" +
      "0\nENDBLK\n";

    return [svg, blocks];
  }

  if (c.type === "line") {
    svg += "0\nLINE\n";
    svg += "8\nLines\n";
    svg += "10\n" + c.start.x.toString() + "\n";
    svg += "20\n" + invert(c.start.y, size.height).toString() + "\n";
    svg += "30\n0.0\n";
    svg += "11\n" + c.end.x.toString() + "\n";
    svg += "21\n" + invert(c.end.y, size.height).toString() + "\n";
    svg += "31\n0.0\n";
    return [svg, blocks];
  }

  if (c.type === "polyline") {
    svg += "0\nPOLYLINE\n";
    svg += "8\n" + layer + "\n";
    svg += "66\n1\n";
    for (const point of c.points) {
      svg += "0\nVERTEX\n";
      svg += "8\n" + layer.toString() + "\n";
      svg += "10\n" + point.x.toString() + "\n";
      svg += "20\n" + invert(point.y, size.height).toString() + "\n";
      svg += "30\n0.0\n";
    }
    svg += "0\nSEQEND\n";
    svg += "8\n" + layer + "\n";
    return [svg, blocks];
  }

  if (c.type === "text") {
    const horizontalAlignment =
      c.horizontalGrowthDirection === "left" ? 2 : c.horizontalGrowthDirection === "uniform" ? 1 : 0;

    const verticalAlignment = c.verticalGrowthDirection === "up" ? 0 : c.verticalGrowthDirection === "uniform" ? 2 : 3;

    const fontSize = c.fontSize - 2;

    svg += "0\nTEXT\n";
    svg += "8\nText\n";
    svg += "10\n" + c.position.x.toString() + "\n";
    svg += "20\n" + invert(c.position.y, size.height) + "\n";
    svg += "30\n0.0\n";
    svg += "11\n" + c.position.x.toString() + "\n";
    svg += "21\n" + invert(c.position.y, size.height) + "\n";
    svg += "31\n0.0\n";
    svg += "40\n" + fontSize.toString() + "\n";
    svg += "1\n" + c.text + "\n";
    svg += "72\n" + horizontalAlignment.toString() + "\n";
    svg += "73\n" + verticalAlignment.toString() + "\n";
    return [svg, blocks];
  }

  if (c.type === "ellipse") {
    layer++;

    svg += "0\nPOLYLINE\n";
    svg += "8\n" + layer.toString() + "\n";
    svg += "66\n1\n";

    const r1 = Math.abs(c.bottomRight.x - c.topLeft.x) / 2.0;
    const r2 = Math.abs(c.topLeft.y - c.bottomRight.y) / 2.0;
    const numPoints = 32;

    for (let i = 0; i <= numPoints; i++) {
      const t = (2 * Math.PI * i) / numPoints;
      const x = c.topLeft.x + r1 + r1 * Math.cos(t);
      const y = c.topLeft.y + r2 + r2 * Math.sin(t);
      svg += "0\nVERTEX\n";
      svg += "8\n" + layer.toString() + "\n";
      svg += "10\n" + x.toString() + "\n";
      svg += "20\n" + invert(y, size.height).toString() + "\n";
      svg += "30\n0.0\n";
    }

    svg += "0\nSEQEND\n";
    svg += "8\n" + layer.toString() + "\n";
    return [svg, blocks];
  }

  if (c.type === "polygon") {
    svg += "0\nPOLYLINE\n";
    svg += "8\n" + layer + "\n";
    svg += "66\n1\n";

    for (const point of c.points.concat(c.points[0])) {
      svg += "0\nVERTEX\n";
      svg += "8\n" + layer.toString() + "\n";
      svg += "10\n" + point.x.toString() + "\n";
      svg += "20\n" + invert(point.y, size.height).toString() + "\n";
      svg += "30\n0.0\n";
    }

    svg += "0\nSEQEND\n";
    svg += "8\n" + layer.toString() + "\n";
    return [svg, blocks];
  }

  if (c.type === "rectangle") {
    const cors = corners(c);

    svg += "0\nPOLYLINE\n";
    svg += "8\n" + layer.toString() + "\n";
    svg += "66\n1\n";

    for (const point of cors.concat(cors[0])) {
      svg += "0\nVERTEX\n";
      svg += "8\n" + layer.toString() + "\n";
      svg += "10\n" + point.x.toString() + "\n";
      svg += "20\n" + invert(point.y, size.height).toString() + "\n";
      svg += "30\n0.0\n";
    }

    svg += "0\nSEQEND\n";
    svg += "8\n" + layer.toString() + "\n";
    return [svg, blocks];
  }

  return [svg, blocks];
}

function invert(d: number, height: number): number {
  return height - d;
}

function extractEntities(dxf: string): string | undefined {
  const startToken = "0\nSECTION\n2\nENTITIES\n";
  const endToken = "0\nENDSEC";

  const start = dxf.indexOf(startToken);
  if (start === -1) {
    return undefined;
  }

  const from = start + startToken.length;
  const end = dxf.indexOf(endToken, from);
  if (end === -1) {
    return undefined;
  }

  return dxf.slice(from, end).trim();
}

function extractExtents(
  dxf: string
):
  | { readonly minX: number; readonly maxX: number; readonly minY: number; readonly maxY: number }
  | undefined
  | undefined {
  const min = /\$EXTMIN\s+10\s+([-\d.]+)\s+20\s+([-\d.]+)/.exec(dxf);
  const max = /\$EXTMAX\s+10\s+([-\d.]+)\s+20\s+([-\d.]+)/.exec(dxf);

  if (!min || !max) {
    return undefined;
  }

  return { minX: Number(min[1]), minY: Number(min[2]), maxX: Number(max[1]), maxY: Number(max[2]) };
}
