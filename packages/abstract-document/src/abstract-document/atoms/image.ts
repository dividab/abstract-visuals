import { ImageResource } from "../primitives/image-resource.js";

export interface Image {
  readonly type: "Image";
  readonly imageResource: ImageResource;
  readonly width: number;
  readonly height: number;
  readonly verticalAlignment?: "Top" | "Center" | "Bottom";
  readonly horizontalAlignment?: "Left" | "Center" | "Right";
}

export interface ImageProps {
  readonly imageResource: ImageResource;
  readonly width: number;
  readonly height: number;
  readonly verticalAlignment?: "Top" | "Center" | "Bottom";
  readonly horizontalAlignment?: "Left" | "Center" | "Right";
}

export function create(props: ImageProps): Image {
  return { type: "Image", ...props };
}
