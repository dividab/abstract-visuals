import * as AbstractImage from "abstract-image";
import svgToPdfKit from "svg-to-pdfkit";
import * as AD from "../../abstract-document/index.js";
import { getFontNameStyle, getFontName, isFontAvailable } from "./font.js";
import { rawSvgPrefix, toBase64 } from "../shared/base-64.js";

export function renderImage(
  resources: AD.Resources.Resources,
  pdf: PDFKit.PDFDocument,
  finalRect: AD.Rect.Rect,
  textStyle: AD.TextStyle.TextStyle,
  image: AD.Image.Image
): void {
  const ai = image.imageResource.abstractImage;
  const position = AD.Point.create(finalRect.x, finalRect.y);
  const hasIntrinsicSize = ai.size.width && ai.size.height;
  const rect = resourceRect(image.imageResource, finalRect);
  const outerScale = hasIntrinsicSize ? Math.min(rect.width / ai.size.width, rect.height / ai.size.height) : 1;

  pdf.save();
  pdf.translate(position.x, position.y).scale(outerScale);
  ai.components.forEach((c) =>
    abstractComponentToPdf(resources, pdf, c, textStyle, 0, hasIntrinsicSize ? undefined : rect)
  );
  pdf.restore();
}

function abstractComponentToPdf(
  resources: AD.Resources.Resources,
  pdf: PDFKit.PDFDocument,
  component: AbstractImage.Component,
  textStyle: AD.TextStyle.TextStyle,
  circuitBreaker: number,
  outerSize: AbstractImage.Size | undefined
): void {
  if (++circuitBreaker > 20) {
    return;
  }
  switch (component.type) {
    case "group":
      component.children.forEach((c) =>
        abstractComponentToPdf(resources, pdf, c, textStyle, circuitBreaker, outerSize)
      );
      break;
    case "binaryimage":
      const format = component.format.toLowerCase();
      const w = component.bottomRight.x - component.topLeft.x;
      const h = component.bottomRight.y - component.topLeft.y;
      if (component.data.type === "url") {
        const imageResource = resources.imageResources?.[component.data.url];
        if (imageResource) {
          const rect = resourceRect(imageResource, {
            width: (outerSize?.width || 1) * (w || 1),
            height: (outerSize?.height || 1) * (h || 1),
          });
          const scale = Math.min(
            rect.width / (imageResource.abstractImage.size.width || 1),
            rect.height / (imageResource.abstractImage.size.height || 1)
          );
          pdf.save();
          pdf.translate(component.topLeft.x, component.topLeft.y).scale(scale);
          imageResource.abstractImage.components.forEach((c) =>
            abstractComponentToPdf(resources, pdf, c, textStyle, circuitBreaker, undefined)
          );
          pdf.restore();
        } else if (component.data.url.startsWith(rawSvgPrefix)) {
          addWithSvgToPdfKit(component.data.url.slice(rawSvgPrefix.length), component, pdf, resources, textStyle);
        } else {
          pdf.image(component.data.url, component.topLeft.x, component.topLeft.y, { fit: [w, h] });
        }
      } else if (format === "png") {
        // pdfkit uses cache if using datauri, if buffer is used its not cached
        pdf.image(toBase64(component.data.bytes), component.topLeft.x, component.topLeft.y, { fit: [w, h] });
      } else if (format === "jpg") {
        // pdfkit uses cache if using datauri, if buffer is used its not cached
        pdf.image(toBase64(component.data.bytes), component.topLeft.x, component.topLeft.y, { fit: [w, h] });
      } else if (format === "svg") {
        addWithSvgToPdfKit(new TextDecoder().decode(component.data.bytes), component, pdf, resources, textStyle);
      }
      break;
    case "subimage":
      break;
    case "line":
      pdf
        .lineWidth(component.strokeThickness)
        .moveTo(component.start.x, component.start.y)
        .lineTo(component.end.x, component.end.y)
        .strokeOpacity(colorToOpacity(component.strokeColor));
      applyStrokeDashStyle(pdf, component.strokeDashStyle);
      pdf.stroke(colorToRgb(component.strokeColor));
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
      pdf.lineWidth(component.strokeThickness).strokeOpacity(colorToOpacity(component.strokeColor));
      applyStrokeDashStyle(pdf, component.strokeDashStyle);
      pdf.stroke(colorToRgb(component.strokeColor));
      break;
    case "text":
      const font = getFontName(component.fontFamily, component.fontWeight, component.italic);
      if (component.clockwiseRotationDegrees !== 0) {
        pdf.save();
        pdf.rotate(component.clockwiseRotationDegrees, {
          origin: [component.position.x, component.position.y],
        });
      }
      pdf.font(font).fontSize(component.fontSize);
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
        .font(font)
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
        .fillOpacity(colorToOpacity(component.fillColor));
      applyStrokeDashStyle(pdf, component.strokeDashStyle);
      pdf.fillAndStroke(colorToRgb(component.fillColor), colorToRgb(component.strokeColor));
      break;
    case "polygon":
      pdf
        .lineWidth(component.strokeThickness)
        .strokeOpacity(colorToOpacity(component.strokeColor))
        .fillOpacity(colorToOpacity(component.fillColor))
        .polygon(...component.points.map((p) => [p.x, p.y]));
      applyStrokeDashStyle(pdf, component.strokeDashStyle);
      pdf.fillAndStroke(colorToRgb(component.fillColor), colorToRgb(component.strokeColor));
      break;
    case "rectangle":
      const rWidth = component.bottomRight.x - component.topLeft.x;
      const rHeight = component.bottomRight.y - component.topLeft.y;
      pdf
        .lineWidth(component.strokeThickness)
        .strokeOpacity(colorToOpacity(component.strokeColor))
        .fillOpacity(colorToOpacity(component.fillColor))
        .rect(component.topLeft.x, component.topLeft.y, rWidth, rHeight);
      applyStrokeDashStyle(pdf, component.strokeDashStyle);
      pdf.fillAndStroke(colorToRgb(component.fillColor), colorToRgb(component.strokeColor));
      break;
    default:
      break;
  }
}

function addWithSvgToPdfKit(
  svg: string,
  component: AbstractImage.BinaryImage,
  pdf: PDFKit.PDFDocument,
  resources: AD.Resources.Resources,
  textStyle: AD.TextStyle.TextStyle
): void {
  // Special to compensate for pdfKit demanding lower case
  // Remove when Svg-To-PdfKit has fixed "toLowerCase"
  // https://github.com/alafr/SVG-to-PDFKit/issues/152
  let svgUpdated = svg;
  ["fill=", "stroke=", "color="].forEach((t) => {
    let index = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      index = svgUpdated.indexOf(t, index);
      if (index === -1) break;
      let indexStart = svgUpdated.indexOf('"', index);
      let indexEnd = svgUpdated.indexOf('"', indexStart + 1);
      index = indexEnd;

      const color = svgUpdated.substring(indexStart, indexEnd);
      if (color !== color.toLowerCase() && color.toLowerCase().indexOf("url(") === -1)
        svgUpdated =
          svgUpdated.substring(0, indexStart) + color.toLowerCase() + svgUpdated.substring(indexEnd, svgUpdated.length);
    }
  });

  ["stroke-dasharray="].forEach((t) => {
    let index = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      index = svgUpdated.indexOf(t, index);
      if (index === -1) break;
      let indexStart = svgUpdated.indexOf('"', index) + 1;
      let indexEnd = svgUpdated.indexOf('"', indexStart);
      index = indexEnd;

      let dasharray = svgUpdated.substring(indexStart, indexEnd);

      dasharray = dasharray
        .split(" ")
        .map((x) => parseFloat(x))
        .filter((x) => x !== 0)
        .join(" ");

      svgUpdated = svgUpdated.substring(0, indexStart) + dasharray + svgUpdated.substring(indexEnd, svgUpdated.length);
    }
  });

  const imageWidth = component.bottomRight.x - component.topLeft.x;
  const imageHeight = component.bottomRight.y - component.topLeft.y;
  svgToPdfKit(pdf, svgUpdated, component.topLeft.x, component.topLeft.y, {
    width: imageWidth,
    height: imageHeight,
    preserveAspectRatio: "xMinYMin",
    fontCallback: (family: string, _bold: boolean, _italic: boolean) => {
      if (isFontAvailable(family, resources)) {
        return family;
      } else {
        return getFontNameStyle(textStyle);
      }
    },
  });
}

function resourceRect(imageResource: AD.ImageResource.ImageResource, rect: AbstractImage.Size): AbstractImage.Size {
  const ai = imageResource.abstractImage;
  if (!imageResource.scaleMaxHeight || !imageResource.scaleMaxWidth) {
    return rect;
  }
  const [factorX, factorY] = [
    rect.width / (imageResource.scaleMaxWidth || 1),
    rect.height / (imageResource.scaleMaxHeight || 1),
  ];
  const factor = factorX < factorY ? factorX : factorY;
  return { width: ai.size.width * factor, height: ai.size.height * factor };
}

function colorToOpacity(color: AbstractImage.Color): number {
  return color.a / 255;
}

function colorToRgb(color: AbstractImage.Color): [number, number, number] {
  return [color.r, color.g, color.b];
}

// Implements the SVG behavior of stroke-dasharray and stroke-dashoffset
// Code originally from: https://github.com/alafr/SVG-to-PDFKit/blob/ecd4b52120de34fc11169023546f171ea453ca21/source.js#L235
function applyStrokeDashStyle(pdf: PDFKit.PDFDocument, dashStyle: AbstractImage.DashStyle): void {
  if (dashStyle.dashes.length === 0) {
    pdf.undash();
    return;
  }

  let dashes = [...dashStyle.dashes];
  let phase = dashStyle.offset;

  // Anytime there's a 0 that isn't the first or last element of the array,
  // we can remove it by combining the previous or next value. If it's a
  // dash, then it's a zero-length dash between two spaces, so the dash can
  // be eliminated and spaces combined by summing them, replacing all three
  // values with the sum of the two spaces. If the 0 value is a space, then
  // it's a zero-length space between two dashes, and the dashes can be
  // similarly combined. So first we run that logic iteratively to remove
  // all the 0s from the dash array that aren't the first or last element.
  // Note that because we replace 3 values with one value, this doesn't
  // change the even-ness of the length of dashArray.
  for (;;) {
    const index = dashes.slice(1, -1).indexOf(0);
    if (index === -1) {
      break;
    }
    const actualIndex = index + 1;
    const replacementValue = dashes[actualIndex - 1] + dashes[actualIndex + 1];
    dashes = dashes
      .slice(0, actualIndex - 1)
      .concat([replacementValue])
      .concat(dashes.slice(actualIndex + 2));
  }

  // The stroke array only having two elements (a dash value and space
  // value) is a special case.
  if (dashes.length === 1) {
    dashes = [dashes[0], dashes[0]];
    if (dashes[0] === 0) {
      pdf.strokeOpacity(0);
    }
  } else if (dashes.length === 2) {
    if (dashes[0] === 0) {
      // Regardless of the space value, the dash length is zero, so we're
      // not actually drawing a stroke. We can't describe that in a
      // doc.dash() call in a way that PDFKit will accept, so we set the
      // stroke opacity to zero as our best approximation.
      pdf.strokeOpacity(0);
      return;
    } else if (dashes[1] === 0) {
      // Regardless of the dash value, the space value is zero, meaning
      // we're actually drawing a solid stroke, not a dashed one. We can
      // make this happen by just emptying out the dash array.
      dashes = [];
    }
  } else {
    if (dashes[0] === 0) {
      // The first dash is zero-length. We fix this by combining the first
      // space (just after the first dash) with the last space and updating
      // the dash offset accordingly. For example, if we had
      //
      // [ 0 4 3 2 5 1 ] (dash offset 0)
      //
      // ␣␣␣␣---␣␣-----␣
      // ⎸
      //
      // we'd end up with
      //
      // [ 3 2 5 5 ] (dash offset -4)
      //
      // ---␣␣-----␣␣␣␣␣
      //            ⎸
      //
      // Another example where the dash array also ends with a 0:
      //
      // [ 0 4 3 2 5 0 ] (dash offset 0)
      //
      // ␣␣␣␣---␣␣-----
      // ⎸
      //
      // we'd end up with
      //
      // [ 3 2 5 4 ] (dash offset -4)
      //
      // ---␣␣-----␣␣␣␣
      //           ⎸
      phase -= dashes[1];
      dashes[dashes.length - 1] += dashes[1];
      dashes = dashes.slice(2);
    }
    if (dashes[dashes.length - 1] === 0) {
      // The last space is zero-length. We fix this by combining the last dash
      // (just before the last space) with the first dash and updating the
      // dash offset accordingly. For example, if we had
      //
      // [ 1 4 3 2 5 0 ] (dash offset 0)
      //
      // -␣␣␣␣---␣␣-----
      // ⎸
      //
      // we'd end up with
      //
      // [ 6 4 3 2 ] (dash offset 5)
      //
      // ------␣␣␣␣---␣␣
      //      ⎸
      //
      phase += dashes[dashes.length - 2];
      dashes[0] += dashes[dashes.length - 2];
      dashes = dashes.slice(0, -2);
    }
  }

  // Ensure the dash offset is non-negative (because of crbug.com/660850).
  // First compute the total length of the dash array so we can add it to
  // dash offset until dash offset is non-negative.
  let length = 0;
  for (const dash of dashes) {
    length += dash;
  }
  if (length > 0) {
    while (phase < 0) {
      phase += length;
    }
  }

  (pdf as { dash: (length: number | ReadonlyArray<number>, option: any) => any }).dash(dashes, { phase: phase });
}
