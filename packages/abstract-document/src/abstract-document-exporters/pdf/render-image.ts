import * as AbstractImage from "abstract-image";
import * as base64 from "base64-js";
import svgToPdfKit from "svg-to-pdfkit";
import * as AD from "../../abstract-document";
import { getFontName, isFontAvailable } from "./font";

export function renderImage(
  resources: AD.Resources.Resources,
  // tslint:disable-next-line:no-any
  pdf: any,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  image: AD.Image.Image
  // tslint:disable-next-line:no-any
): any {
  const aImage = image.imageResource.abstractImage;
  const position = AD.Point.create(finalRect.x, finalRect.y);
  const scaleX = finalRect.width / aImage.size.width;
  const scaleY = finalRect.height / aImage.size.height;
  const scale = Math.min(scaleX, scaleY);
  pdf.save();
  pdf.translate(position.x, position.y).scale(scale);
  aImage.components.forEach((c: AbstractImage.Component) => abstractComponentToPdf(resources, pdf, c, textStyle));
  pdf.restore();
}

function abstractComponentToPdf(
  resources: AD.Resources.Resources,
  // tslint:disable-next-line:no-any
  pdf: any,
  component: AbstractImage.Component,
  textStyle: AD.TextStyle.TextStyle
): void {
  switch (component.type) {
    case "group":
      component.children.forEach((c) => abstractComponentToPdf(resources, pdf, c, textStyle));
      break;
    case "binaryimage":
      const format = component.format.toLowerCase();
      const imageWidth = component.bottomRight.x - component.topLeft.x;
      const imageHeight = component.bottomRight.y - component.topLeft.y;
      if (format === "png") {
        const data = "data:image/png;base64," + base64.fromByteArray(component.data);
        pdf.image(data, component.topLeft.x, component.topLeft.y, {
          fit: [imageWidth, imageHeight],
        });
      } else if (format === "jpg") {
        const data = "data:image/jpeg;base64," + base64.fromByteArray(component.data);
        pdf.image(data, component.topLeft.x, component.topLeft.y, {
          fit: [imageWidth, imageHeight],
        });
      } else if (format === "svg") {
        const svg = new TextDecoder().decode(component.data);
        const imageWidth = component.bottomRight.x - component.topLeft.x;
        const imageHeight = component.bottomRight.y - component.topLeft.y;
        svgToPdfKit(pdf, svg, component.topLeft.x, component.topLeft.y, {
          width: imageWidth,
          height: imageHeight,
          preserveAspectRatio: "xMinYMin",
          fontCallback: (family: string, _bold: boolean, _italic: boolean) => {
            if (isFontAvailable(family, resources)) {
              return family;
            } else {
              return getFontName(textStyle);
            }
          },
        });
      }
      break;
    case "subimage":
      break;
    case "line":
      pdf
        .lineWidth(component.strokeThickness)
        .moveTo(component.start.x, component.start.y)
        .lineTo(component.end.x, component.end.y)
        .strokeOpacity(colorToOpacity(component.strokeColor))
        .stroke(colorToRgb(component.strokeColor));
      break;
    case "polyline":
      for (let i = 0; i < component.points.length; ++i) {
        const p = component.points[i];
        if (i === 0) {
          pdf.moveTo(p.x, p.y);
        } else {
          pdf.lineTo(p.x, p.y);
        }
      }
      pdf
        .lineWidth(component.strokeThickness)
        .strokeOpacity(colorToOpacity(component.strokeColor))
        .stroke(colorToRgb(component.strokeColor));
      break;
    case "text":
      if (component.clockwiseRotationDegrees !== 0) {
        pdf.save();
        pdf.rotate(component.clockwiseRotationDegrees, {
          origin: [component.position.x, component.position.y],
        });
      }
      pdf.font(component.fontFamily).fontSize(component.fontSize);
      const stringWidth = pdf.widthOfString(component.text);
      const stringHeight = pdf.currentLineHeight();
      const dx =
        component.horizontalGrowthDirection === "left"
          ? -stringWidth
          : component.horizontalGrowthDirection === "uniform"
          ? -stringWidth * 0.5
          : 0;
      const dy =
        component.verticalGrowthDirection === "up"
          ? -stringHeight
          : component.verticalGrowthDirection === "uniform"
          ? -stringHeight * 0.5
          : 0;
      pdf
        .font(component.fontFamily)
        .fontSize(component.fontSize)
        .fillColor(colorToRgb(component.textColor))
        .text(component.text, component.position.x + dx, component.position.y + dy, { lineBreak: false });
      if (component.clockwiseRotationDegrees !== 0) {
        pdf.restore();
      }
      break;
    case "ellipse":
      const width = component.bottomRight.x - component.topLeft.x;
      const height = component.bottomRight.y - component.topLeft.y;
      const centerX = component.topLeft.x + width * 0.5;
      const centerY = component.topLeft.y + height * 0.5;
      pdf
        .lineWidth(component.strokeThickness)
        .ellipse(centerX, centerY, width * 0.5, height * 0.5)
        .strokeOpacity(colorToOpacity(component.strokeColor))
        .fillOpacity(colorToOpacity(component.fillColor))
        .fillAndStroke(colorToRgb(component.fillColor), colorToRgb(component.strokeColor));
      break;
    case "polygon":
      pdf
        .lineWidth(component.strokeThickness)
        .strokeOpacity(colorToOpacity(component.strokeColor))
        .fillOpacity(colorToOpacity(component.fillColor))
        .polygon(...component.points.map((p) => [p.x, p.y]))
        .fillAndStroke(colorToRgb(component.fillColor), colorToRgb(component.strokeColor));
      break;
    case "rectangle":
      const rWidth = component.bottomRight.x - component.topLeft.x;
      const rHeight = component.bottomRight.y - component.topLeft.y;
      pdf
        .lineWidth(component.strokeThickness)
        .strokeOpacity(colorToOpacity(component.strokeColor))
        .fillOpacity(colorToOpacity(component.fillColor))
        .rect(component.topLeft.x, component.topLeft.y, rWidth, rHeight)
        .fillAndStroke(colorToRgb(component.fillColor), colorToRgb(component.strokeColor));
      break;
    default:
      break;
  }
}

function colorToOpacity(color: AbstractImage.Color): number {
  return color.a / 255;
}

function colorToRgb(color: AbstractImage.Color): Array<number> {
  return [color.r, color.g, color.b];
}
