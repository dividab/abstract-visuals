import { AbstractImage } from "../model/abstract-image.js";

export function createPNG(image: AbstractImage): Uint8Array {
  if (image.components.length !== 1) {
    throw new Error("Not supported!");
  }
  const component = image.components[0];
  if (component.type === "binaryimage" && component.format === "png" && component.data.type === "bytes") {
    return component.data.bytes;
  }
  throw new Error("Not supported!");
}
