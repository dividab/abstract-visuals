import { ImageResource } from "../primitives/image-resource";

export interface Image {
  readonly type: "Image";
  readonly imageResource: ImageResource;
  readonly width: number;
  readonly height: number;
}

export interface ImageProps {
  readonly imageResource: ImageResource;
  readonly width: number;
  readonly height: number;
}

export function create(props: ImageProps): Image {
  return {
    type: "Image",
    ...props
  };
}
