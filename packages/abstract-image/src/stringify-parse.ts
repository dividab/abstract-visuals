import { AbstractImage } from "./model/abstract-image";
import { BinaryImage, Component, Group, SubImage } from "./model/component";

export function stringifyBase64(abstractImage: AbstractImage): string {
  const safe = { ...abstractImage, components: abstractImage.components.map(componentToJsonSafe) };
  return JSON.stringify(safe);
}

export function encodeBase64(abstractImage: AbstractImage): AbstractImage {
  return { ...abstractImage, components: abstractImage.components.map(componentToJsonSafe) };
}

export function parseBase64(stringifiedImage: string): AbstractImage {
  const obj = JSON.parse(stringifiedImage);
  return { ...obj, components: (obj.components ?? []).map(componentFromJsonSafe) } as AbstractImage;
}

export function decodeBase64(safeAbstractImage: AbstractImage): AbstractImage {
  return { ...safeAbstractImage, components: (safeAbstractImage.components ?? []).map(componentFromJsonSafe) } as AbstractImage;
}

function componentToJsonSafe(c: Component): any {
  switch (c.type) {
    case "binaryimage": {
      const bi = c as BinaryImage;
      if (bi.data.type === "bytes") {
        return { ...bi, data: { type: "bytes", bytes: toBase64(bi.data.bytes) } };
      }
      return bi;
    }
    case "group":
      return { ...c, children: c.children.map(componentToJsonSafe) };
    case "subimage":
      return { ...c, image: componentToJsonSafe(c.image) };
    default:
      return c;
  }
}

type BufferFromUint8ArrayStringified = { data: Uint8Array; type: "Buffer" };

function componentFromJsonSafe(c: any): Component {
  if (c?.type === "binaryimage") {
    if (c.data?.type === "bytes") {
      if (typeof c.data.bytes === "string") {
        return { ...c, data: { type: "bytes", bytes: fromBase64(c.data.bytes) } } as BinaryImage;
      }
      // legacy fallback, will remove
      if ((c.data.bytes as unknown as BufferFromUint8ArrayStringified)?.data) {
        return {
          ...c,
          data: { ...c.data, bytes: new Uint8Array((c.data.bytes as unknown as BufferFromUint8ArrayStringified).data) },
        };
      }
      if (!Array.isArray(c.data?.bytes)) {
        return { ...c, data: { ...c.data, bytes: new Uint8Array(Object.values(c.data.bytes)) } }; // Somtimes Uint8Array is an object instead of an array
      }
      return { ...c, data: { ...c.data, bytes: new Uint8Array(c.data.bytes) } };
    }
    return c as BinaryImage;
  }
  if (c?.type === "group") {
    return { ...c, children: Array.isArray(c.children) ? c.children.map(componentFromJsonSafe) : [] } as Group;
  }
  if (c?.type === "subimage") {
    return { ...c, image: componentFromJsonSafe(c.image) } as SubImage;
  }
  return c as Component;
}

function toBase64(u8: Uint8Array): string {
  // Node
  if (typeof Buffer !== "undefined") {
    return Buffer.from(u8).toString("base64");
  }
  // Browser
  let bin = "";
  for (const e of u8) {
    bin += String.fromCharCode(e);
  }
  return btoa(bin);
}

function fromBase64(b64: string): Uint8Array {
  // Node
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(b64, "base64"));
  }
  // Browser
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}
