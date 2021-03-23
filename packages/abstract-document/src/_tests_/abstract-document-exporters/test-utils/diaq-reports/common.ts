import { ImageResource, Image } from "../../../../../src/abstract-document";
import * as AbstractImage from "abstract-image";

export type ProductCodes = Array<{
  readonly type: string;
  readonly code: string;
  readonly m3: string;
}>;

export interface BitmapImage {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly data: Uint8Array;
}

export interface CombinedImageResource {
  readonly image: Image.Image;
  readonly resource: ImageResource.ImageResource;
}

export interface CombinedImageProps {
  readonly image: BitmapImage;
  readonly width?: number | undefined;
  readonly height?: number | undefined;
}

export interface ProductDescriptionData {
  readonly productId: string;
  readonly productCodes: ProductCodes;
  readonly description: string;
  readonly productImage: BitmapImage;

  readonly reportType: string;
  readonly reportDate: string;
  readonly generatedBy: string;

  readonly logotype: BitmapImage;
  readonly language: string;
  readonly measureSystem: string;
}

// export function createImageResource({ image, width, height }: CombinedImageProps): CombinedImageResource {
//   let actualWidth = image.width;
//   let actualHeight = image.height;
//   if (width !== undefined && height !== undefined) {
//     actualWidth = width;
//     actualHeight = height;
//   } else if (width !== undefined && height === undefined) {
//     const ratio = image.width / image.height;
//     actualWidth = width;
//     actualHeight = width / ratio;
//   } else if (width === undefined && height !== undefined) {
//     const ratio = image.width / image.height;
//     actualWidth = height * ratio;
//     actualHeight = height;
//   }

//   const components = [
//     AbstractImage.createBitmapImage(
//       AbstractImage.createPoint(0, 0),
//       AbstractImage.createPoint(actualWidth, actualHeight),
//       "png",
//       image.data
//     ),
//   ];
//   const abstractImage = AbstractImage.createAbstractImage(
//     AbstractImage.createPoint(0, 0),
//     AbstractImage.createSize(actualWidth, actualHeight),
//     AbstractImage.white,
//     components
//   );
//   const imageResource = ImageResource.create({
//     id: image.name,
//     abstractImage: abstractImage,
//   });

//   const imageImage = Image.create({
//     imageResource: imageResource,
//     width: actualWidth,
//     height: actualHeight,
//   });
//   return { image: imageImage, resource: imageResource };
// }
