import { AbstractImage } from "abstract-image";

export type Guid = string;

export interface ImageResource {
  readonly id: Guid;
  readonly abstractImage: AbstractImage;
  readonly renderScale: number;
}

export interface ImageResourceProps {
  readonly id: Guid;
  readonly abstractImage: AbstractImage;
  readonly renderScale?: number;
}

export function create({
  id,
  abstractImage,
  renderScale = 1.0
}: ImageResourceProps): ImageResource {
  return {
    id,
    abstractImage,
    renderScale
  };
}
