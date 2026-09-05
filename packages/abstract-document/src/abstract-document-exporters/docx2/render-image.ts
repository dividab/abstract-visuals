import type * as AbstractImage from "abstract-image";
import type { IMediaTransformation } from "docx";
import { ImageRun } from "docx";
import type { TextStyle } from "../../abstract-document/styles/text-style.js";
import type { Image } from "../../abstract-document/atoms/image.js";
import { fromBase64, rawSvgPrefix } from "../shared/base-64.js";
import type * as AD from "../../abstract-document/index.js";

const abstractDocPointsToDocxPxRatio = 1; // Set to 1 for now to minimize impact. Can be adjusted to better match PDF image dimensions

const emptyPNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6pH7sAAAAASUVORK5CYII=";

const fallbackImage = {
  type: "png" as const,
  data: fromBase64(emptyPNG),
};

export function renderImage(image: Image, textStyle: TextStyle, resources: AD.Resources.Resources): ImageRun {
  const aImage = image.imageResource.abstractImage;

  const firstComp = aImage.components[0];
  const resource =
    !aImage.size.width && !aImage.size.height && firstComp?.type === "binaryimage" && firstComp.data.type === "url"
      ? resources.imageResources?.[firstComp.data.url] ?? image.imageResource
      : image.imageResource;

  const rect = resourceRect(resource, {
    width: image.width,
    height: image.height,
  });

  const imgW = resource.abstractImage.size.width || 1;
  const imgH = resource.abstractImage.size.height || 1;

  const scaleX = rect.width / imgW;
  const scaleY = rect.height / imgH;
  const scale = Math.min(scaleX, scaleY);

  const drawnW = imgW * scale;
  const drawnH = imgH * scale;

  const transformation: IMediaTransformation = {
    width: drawnW * abstractDocPointsToDocxPxRatio,
    height: drawnH * abstractDocPointsToDocxPxRatio,
  };

  const directImage = tryCreateDirectImageRun(resource, transformation, resources);
  if (directImage) {
    return directImage;
  }

  const svg = abstractImageToSvg(resource.abstractImage, resources, textStyle);

  return new ImageRun({
    type: "svg",
    data: Buffer.from(svg, "utf8"),
    transformation,
    fallback: fallbackImage,
  });
}

function tryCreateDirectImageRun(
  resource: AD.ImageResource.ImageResource,
  transformation: IMediaTransformation,
  resources: AD.Resources.Resources
): ImageRun | undefined {
  if (resource.abstractImage.components.length !== 1) {
    return undefined;
  }

  const component = resource.abstractImage.components[0];
  if (component.type !== "binaryimage") {
    return undefined;
  }

  return binaryImageToImageRun(component, transformation, resources);
}

function binaryImageToImageRun(
  component: AbstractImage.BinaryImage,
  transformation: IMediaTransformation,
  resources: AD.Resources.Resources
): ImageRun | undefined {
  const format = component.format.toLowerCase();

  if (component.data.type === "bytes") {
    if (format === "png" || format === "jpg" || format === "jpeg") {
      return new ImageRun({
        type: format === "png" ? "png" : "jpg",
        data: Buffer.from(
          component.data.bytes.buffer,
          component.data.bytes.byteOffset,
          component.data.bytes.byteLength
        ),
        transformation,
      } as any);
    }

    if (format === "svg") {
      return new ImageRun({
        type: "svg",
        data: Buffer.from(component.data.bytes),
        transformation,
        fallback: fallbackImage,
      });
    }
  }

  if (component.data.type === "url") {
    const nestedResource = resources.imageResources?.[component.data.url];

    if (nestedResource) {
      const direct = tryCreateDirectImageRun(nestedResource, transformation, resources);
      return direct;
    }

    if (component.data.url.startsWith(rawSvgPrefix)) {
      const svg = decodeURIComponent(component.data.url.slice(rawSvgPrefix.length));

      return new ImageRun({
        type: "svg",
        data: Buffer.from(svg, "utf8"),
        transformation,
        fallback: fallbackImage,
      });
    }

    const match = /^data:(.+?);base64,(.*)$/.exec(component.data.url);
    if (match) {
      const mimeType = match[1].toLowerCase();
      const data = fromBase64(match[2]);

      if (mimeType.includes("png")) {
        return new ImageRun({ data, transformation, type: "png" } as any);
      }

      if (mimeType.includes("jpeg") || mimeType.includes("jpg")) {
        return new ImageRun({ data, transformation, type: "jpg" } as any);
      }

      if (mimeType.includes("svg")) {
        return new ImageRun({ type: "svg", data, transformation, fallback: fallbackImage });
      }
    }
  }

  return undefined;
}

function abstractImageToSvg(
  image: AbstractImage.AbstractImage,
  resources: AD.Resources.Resources,
  textStyle: TextStyle
): string {
  const width = image.size.width || 1;
  const height = image.size.height || 1;

  const children = image.components
    .map((component) => componentToSvg(component, resources, textStyle, 0))
    .filter(Boolean)
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${children}</svg>`;
}

function componentToSvg(
  component: AbstractImage.Component,
  resources: AD.Resources.Resources,
  textStyle: TextStyle,
  circuitBreaker: number
): string {
  if (++circuitBreaker > 20) {
    return "";
  }

  switch (component.type) {
    case "group":
      return component.children.map((child) => componentToSvg(child, resources, textStyle, circuitBreaker)).join("");

    case "subimage": {
      const scaleX = component.size.width / (component.image.size.width || 1);
      const scaleY = component.size.height / (component.image.size.height || 1);
      const scale = Math.min(scaleX, scaleY);

      const children = component.image.components
        .map((child) => componentToSvg(child, resources, textStyle, circuitBreaker))
        .join("");

      return `<g transform="translate(${component.topLeft.x} ${component.topLeft.y}) scale(${scale})">${children}</g>`;
    }

    case "binaryimage":
      return binaryImageToSvg(component, resources, textStyle, circuitBreaker);

    case "line":
      return `<line x1="${component.start.x}" y1="${component.start.y}" x2="${component.end.x}" y2="${
        component.end.y
      }" ${strokeAttrs(component.strokeColor, component.strokeThickness, component.strokeDashStyle)} />`;

    case "polyline":
      return `<polyline points="${component.points.map((p) => `${p.x},${p.y}`).join(" ")}" fill="none" ${strokeAttrs(
        component.strokeColor,
        component.strokeThickness,
        component.strokeDashStyle
      )} />`;

    case "polygon":
      return `<polygon points="${component.points.map((p) => `${p.x},${p.y}`).join(" ")}" ${fillAttrs(
        component.fillColor
      )} ${strokeAttrs(component.strokeColor, component.strokeThickness, component.strokeDashStyle)} />`;

    case "rectangle": {
      const width = component.bottomRight.x - component.topLeft.x;
      const height = component.bottomRight.y - component.topLeft.y;

      return `<rect x="${component.topLeft.x}" y="${
        component.topLeft.y
      }" width="${width}" height="${height}" ${fillAttrs(component.fillColor)} ${strokeAttrs(
        component.strokeColor,
        component.strokeThickness,
        component.strokeDashStyle
      )} />`;
    }

    case "ellipse": {
      const width = component.bottomRight.x - component.topLeft.x;
      const height = component.bottomRight.y - component.topLeft.y;
      const cx = component.topLeft.x + width * 0.5;
      const cy = component.topLeft.y + height * 0.5;

      return `<ellipse cx="${cx}" cy="${cy}" rx="${width * 0.5}" ry="${height * 0.5}" ${fillAttrs(
        component.fillColor
      )} ${strokeAttrs(component.strokeColor, component.strokeThickness, component.strokeDashStyle)} />`;
    }

    case "text":
      return textComponentToSvg(component);

    default:
      return "";
  }
}

function binaryImageToSvg(
  component: AbstractImage.BinaryImage,
  resources: AD.Resources.Resources,
  textStyle: TextStyle,
  circuitBreaker: number
): string {
  const width = component.bottomRight.x - component.topLeft.x;
  const height = component.bottomRight.y - component.topLeft.y;
  const format = component.format.toLowerCase();

  if (component.data.type === "url") {
    const imageResource = resources.imageResources?.[component.data.url];

    if (imageResource) {
      const scaleX = width / (imageResource.abstractImage.size.width || 1);
      const scaleY = height / (imageResource.abstractImage.size.height || 1);
      const scale = Math.min(scaleX, scaleY);

      const children = imageResource.abstractImage.components
        .map((child) => componentToSvg(child, resources, textStyle, circuitBreaker))
        .join("");

      return `<g transform="translate(${component.topLeft.x} ${component.topLeft.y}) scale(${scale})">${children}</g>`;
    }

    if (component.data.url.startsWith(rawSvgPrefix)) {
      const svg = decodeURIComponent(component.data.url.slice(rawSvgPrefix.length));
      return `<g transform="translate(${component.topLeft.x} ${component.topLeft.y})">${svg}</g>`;
    }

    return `<image x="${component.topLeft.x}" y="${
      component.topLeft.y
    }" width="${width}" height="${height}" href="${escapeXml(component.data.url)}" />`;
  }

  if (component.data.type === "bytes") {
    if (format === "png" || format === "jpg" || format === "jpeg") {
      const mime = format === "png" ? "image/png" : "image/jpeg";
      const base64 = Buffer.from(
        component.data.bytes.buffer,
        component.data.bytes.byteOffset,
        component.data.bytes.byteLength
      ).toString("base64");

      return `<image x="${component.topLeft.x}" y="${component.topLeft.y}" width="${width}" height="${height}" href="data:${mime};base64,${base64}" />`;
    }

    if (format === "svg") {
      const svg = new TextDecoder().decode(component.data.bytes);
      return `<g transform="translate(${component.topLeft.x} ${component.topLeft.y})">${svg}</g>`;
    }
  }

  return "";
}

function textComponentToSvg(component: AbstractImage.Text): string {
  const rotation =
    component.clockwiseRotationDegrees !== 0
      ? ` transform="rotate(${component.clockwiseRotationDegrees} ${component.position.x} ${component.position.y})"`
      : "";

  const anchor =
    component.horizontalGrowthDirection === "left"
      ? "end"
      : component.horizontalGrowthDirection === "uniform"
      ? "middle"
      : "start";

  const dominantBaseline =
    component.verticalGrowthDirection === "up"
      ? "text-after-edge"
      : component.verticalGrowthDirection === "uniform"
      ? "middle"
      : "text-before-edge";

  return `<text x="${component.position.x}" y="${component.position.y}" font-family="${escapeXml(
    component.fontFamily
  )}" font-size="${component.fontSize}" font-weight="${component.fontWeight}" font-style="${
    component.italic ? "italic" : "normal"
  }" fill="${colorToCss(
    component.textColor
  )}" text-anchor="${anchor}" dominant-baseline="${dominantBaseline}"${rotation}>${escapeXml(component.text)}</text>`;
}

function fillAttrs(color: AbstractImage.Color): string {
  return `fill="${colorToCss(color)}" fill-opacity="${colorToOpacity(color)}"`;
}

function strokeAttrs(color: AbstractImage.Color, thickness: number, dashStyle: AbstractImage.DashStyle): string {
  const dashArray =
    dashStyle.dashes.length > 0
      ? ` stroke-dasharray="${dashStyle.dashes.filter((dash) => dash !== 0).join(" ")}" stroke-dashoffset="${
          dashStyle.offset
        }"`
      : "";

  return `stroke="${colorToCss(color)}" stroke-opacity="${colorToOpacity(
    color
  )}" stroke-width="${thickness}"${dashArray}`;
}

function colorToOpacity(color: AbstractImage.Color): number {
  return color.a / 255;
}

function colorToCss(color: AbstractImage.Color): string {
  return `rgb(${color.r},${color.g},${color.b})`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function resourceRect(resource: AD.ImageResource.ImageResource, rect: AbstractImage.Size): AbstractImage.Size {
  const ai = resource.abstractImage;
  const rectWidth = rect.width || ai.size.width * (rect.height / (ai.size.height || 1));
  const rectHeight = rect.height || ai.size.height * (rect.width / (ai.size.width || 1));

  return { width: rectWidth, height: rectHeight };
}
