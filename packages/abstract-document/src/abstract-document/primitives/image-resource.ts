import { AbstractImage } from "abstract-image";

export type Guid = string;

export type ImageResource = {
  readonly id: Guid;
  readonly abstractImage: AbstractImage;
  readonly renderScale: number; // Unused
  readonly scale?: number; // Explicitly scale image
};

export type ImageResourceProps = {
  readonly id: Guid;
  readonly abstractImage: AbstractImage;
  readonly renderScale?: number;
};

export function create({ id, abstractImage, renderScale = 1.0 }: ImageResourceProps): ImageResource {
  return { id, abstractImage, renderScale };
}
