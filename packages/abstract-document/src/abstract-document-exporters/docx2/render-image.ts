import * as AbstractImage from "abstract-image";
import * as AD from "../../abstract-document";
import * as DOCXJS from "docx";

export function renderImage(image: AD.Image.Image, textStyle: AD.TextStyle.TextStyle): DOCXJS.ImageRun {
  const aImage = image.imageResource.abstractImage;
  const images = aImage.components.map((c: AbstractImage.Component) =>
    abstractComponentToDocX(c, image.width, image.height, textStyle)
  );
  return images[0]!;
}

function abstractComponentToDocX(
  component: AbstractImage.Component,
  width: number,
  height: number,
  _textStyle: AD.TextStyle.TextStyle
): DOCXJS.ImageRun | undefined {
  switch (component.type) {
    // case "group":
    //   component.children.forEach((c) => abstractComponentToPdf(c, textStyle));
    //   break;
    case "binaryimage":
      const format = component.format.toLowerCase();
      if (format === "png" || format === "jpg") {
        return new DOCXJS.ImageRun({
          data: Buffer.from(component.data),
          transformation: {
            width: width,
            height: height,
          },
        });
        // return DOCXJS.Media.addImage(
        //   doc,
        //   // tslint:disable-next-line:no-any
        //   (component as any).data,
        //   imageWidth,
        //   imageHeight,
        //   {}
        // );
      }
      break;
    //else if (format === "svg") {
    //   const svg = new TextDecoder().decode(component.data);
    //   const imageWidth = component.bottomRight.x - component.topLeft.x;
    //   const imageHeight = component.bottomRight.y - component.topLeft.y;
    //   svgToPdfKit(pdf, svg, component.topLeft.x, component.topLeft.y, {
    //     width: imageWidth,
    //     height: imageHeight,
    //     preserveAspectRatio: "xMinYMin",
    //     //fontCallback: component.overrideSvgFont
    //     //  ? (_family: string, _bold: boolean, _italic: boolean) => {
    //     //      return getFontNameStyle(textStyle);
    //     //    }
    //     //  : undefined,
    //     // fontCallback: (_family: string, _bold: boolean, _italic: boolean) => {
    //     //   return getFontNameStyle(textStyle);
    //     // }
    //   });
    // }
    //break;
    // case "subimage":
    //   break;
    // case "line":
    //   pdf
    //     .lineWidth(component.strokeThickness)
    //     .moveTo(component.start.x, component.start.y)
    //     .lineTo(component.end.x, component.end.y)
    //     .strokeOpacity(colorToOpacity(component.strokeColor))
    //     .stroke(colorToRgb(component.strokeColor));
    //   break;
    // case "polyline":
    //   for (let i = 0; i < component.points.length; ++i) {
    //     const p = component.points[i];
    //     if (i === 0) {
    //       pdf.moveTo(p.x, p.y);
    //     } else {
    //       pdf.lineTo(p.x, p.y);
    //     }
    //   }
    //   pdf
    //     .lineWidth(component.strokeThickness)
    //     .strokeOpacity(colorToOpacity(component.strokeColor))
    //     .stroke(colorToRgb(component.strokeColor));
    //   break;
    // case "text":
    //   if (component.clockwiseRotationDegrees !== 0) {
    //     pdf.save();
    //     pdf.rotate(component.clockwiseRotationDegrees, {
    //       origin: [component.position.x, component.position.y],
    //     });
    //   }
    //   pdf.font(component.fontFamily).fontSize(component.fontSize);
    //   const stringWidth = pdf.widthOfString(component.text);
    //   const stringHeight = pdf.currentLineHeight();
    //   const dx =
    //     component.horizontalGrowthDirection === "left"
    //       ? -stringWidth
    //       : component.horizontalGrowthDirection === "uniform"
    //       ? -stringWidth * 0.5
    //       : 0;
    //   const dy =
    //     component.verticalGrowthDirection === "up"
    //       ? -stringHeight
    //       : component.verticalGrowthDirection === "uniform"
    //       ? -stringHeight * 0.5
    //       : 0;
    //   pdf
    //     .font(component.fontFamily)
    //     .fontSize(component.fontSize)
    //     .fillColor(colorToRgb(component.textColor))
    //     .text(component.text, component.position.x + dx, component.position.y + dy, { lineBreak: false });
    //   if (component.clockwiseRotationDegrees !== 0) {
    //     pdf.restore();
    //   }
    //   break;
    // case "ellipse":
    //   const width = component.bottomRight.x - component.topLeft.x;
    //   const height = component.bottomRight.y - component.topLeft.y;
    //   const centerX = component.topLeft.x + width * 0.5;
    //   const centerY = component.topLeft.y + height * 0.5;
    //   pdf
    //     .lineWidth(component.strokeThickness)
    //     .ellipse(centerX, centerY, width * 0.5, height * 0.5)
    //     .strokeOpacity(colorToOpacity(component.strokeColor))
    //     .fillOpacity(colorToOpacity(component.fillColor))
    //     .fillAndStroke(colorToRgb(component.fillColor), colorToRgb(component.strokeColor));
    //   break;
    // case "polygon":
    //   pdf
    //     .lineWidth(component.strokeThickness)
    //     .strokeOpacity(colorToOpacity(component.strokeColor))
    //     .fillOpacity(colorToOpacity(component.fillColor))
    //     .polygon(...component.points.map((p) => [p.x, p.y]))
    //     .fillAndStroke(colorToRgb(component.fillColor), colorToRgb(component.strokeColor));
    //   break;
    // case "rectangle":
    //   const rWidth = component.bottomRight.x - component.topLeft.x;
    //   const rHeight = component.bottomRight.y - component.topLeft.y;
    //   pdf
    //     .lineWidth(component.strokeThickness)
    //     .strokeOpacity(colorToOpacity(component.strokeColor))
    //     .fillOpacity(colorToOpacity(component.fillColor))
    //     .rect(component.topLeft.x, component.topLeft.y, rWidth, rHeight)
    //     .fillAndStroke(colorToRgb(component.fillColor), colorToRgb(component.strokeColor));
    //   break;
    default:
      return undefined;
  }
  return undefined;
}

// function colorToOpacity(color: AbstractImage.Color): number {
//   return color.a / 255;
// }

// function colorToRgb(color: AbstractImage.Color): Array<number> {
//   return [color.r, color.g, color.b];
// }
