import { AbstractImage } from "abstract-image";

export type Guid = string;

export type ImageResource = {
  readonly id: Guid;
  readonly abstractImage: AbstractImage;
  readonly renderScale: number; // Unused
  readonly scaleMaxWidth?: number; // Scale resources together in a group
  readonly scaleMaxHeight?: number;
};

export type ImageResourceProps = {
  readonly id: Guid;
  readonly abstractImage: AbstractImage;
  readonly renderScale?: number;
};

export function create({ id, abstractImage, renderScale = 1.0 }: ImageResourceProps): ImageResource {
  return { id, abstractImage, renderScale };
}
