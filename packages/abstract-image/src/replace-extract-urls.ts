import { AbstractImage, Component } from "./model";

export function replaceUrls(abstractImage: AbstractImage, blobs: Record<string, Uint8Array>): AbstractImage {
  return { ...abstractImage, components: abstractImage.components.map((c) => componentReplaceUrl(c, blobs)) };
}

function componentReplaceUrl(c: Component, blobs: Record<string, Uint8Array>): any {
  switch (c.type) {
    case "binaryimage": {
      const bytes = c.data.type === "url" ? blobs[c.data.url] : undefined;
      if (bytes) {
        return { ...c, data: { type: "bytes", bytes } };
      }
      return c;
    }
    case "group":
      return { ...c, children: c.children.map((child) => componentReplaceUrl(child, blobs)) };
    case "subimage":
      return { ...c, image: componentReplaceUrl(c.image, blobs) };
    default:
      return c;
  }
}

export function extractUrls(abstractImage: AbstractImage): ReadonlyArray<string> {
  const urls = Array<string>();
  const stack = abstractImage.components.slice();

  while (stack.length > 0) {
    const c = stack.pop()!;
    switch (c.type) {
      case "binaryimage": {
        if (c.data.type === "url") {
          urls.push(c.data.url);
        }
        break;
      }
      case "group": {
        for (const child of c.children) {
          stack.push(child);
        }
        break;
      }
      case "subimage":
        stack.push(c.image);
        break;
      default:
        break;
    }
  }

  return urls;
}
