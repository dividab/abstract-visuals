import { fromByteArray } from "base64-js";
import type { BinaryFormat, GrowthDirection } from "../model/component.js";

const xmlHeader = '<?xml version="1.0" encoding="utf-8"?>';

/** A binary image's data url, an svg's without its xml header */
export function getBinaryImageHref(format: BinaryFormat, bytes: Uint8Array): string | undefined {
  if (format === "png" || format === "avif") {
    return `data:image/${format};base64,${fromByteArray(bytes)}`;
  }
  if (format !== "svg") {
    return undefined;
  }
  // Its bytes as latin1 chars, in chunks so a large svg doesn't overflow the stack
  let latin1 = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    latin1 += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  const at = latin1.indexOf(xmlHeader);
  if (at < 0) {
    return `data:image/svg+xml;base64,${fromByteArray(bytes)}`;
  }
  const stripped = new Uint8Array(bytes.length - xmlHeader.length);
  stripped.set(bytes.subarray(0, at));
  stripped.set(bytes.subarray(at + xmlHeader.length), at);
  return `data:image/svg+xml;base64,${fromByteArray(stripped)}`;
}

export function getBaselineAdjustment(d: GrowthDirection): "baseline" | "central" | "hanging" {
  if (d === "up") {
    return "baseline";
  }
  if (d === "uniform") {
    return "central";
  }
  if (d === "down") {
    return "hanging";
  }
  throw new Error("Unknown text alignment " + d);
}

export function getTextAnchor(d: GrowthDirection): "end" | "middle" | "start" {
  if (d === "left") {
    return "end";
  }
  if (d === "uniform") {
    return "middle";
  }
  if (d === "right") {
    return "start";
  }
  throw new Error("Unknown text anchor " + d);
}
