// import { ImageResource } from "./primitives/image-resource.js";
// import { Numbering } from "./numberings/numbering.js";
import { NumberingDefinition } from "./numberings/numbering-definition.js";
import { create } from "./styles/style-key.js";
import { Style, overrideWith } from "./styles/style.js";
import { Font } from "./primitives/font.js";
import { Indexer } from "./types.js";
import { defaultAndStandardStyles } from "./default-styles.js";
import { ImageResource } from "./primitives/image-resource.js";

export interface Resources {
  readonly fonts?: Indexer<Font>;
  readonly styles?: Indexer<Style>;
  /**
   * Embedded image data uri are expected to have to shape: data:image/png;base64,${string}, data:image/jpeg;base64,${string} or data:image/svg+xml,${string}
   */
  readonly imageResources?: Record<string, ImageResource>;
  readonly numberingDefinitions?: Indexer<NumberingDefinition>;
}

export function mergeResources(resources: Array<Resources>): Resources {
  let styles: Indexer<Style> = {};
  let fonts: Indexer<Font> = {};
  let imageResources: Record<string, ImageResource> = {};
  let numberingDefinitions: Indexer<NumberingDefinition> = {};

  for (const r of resources) {
    styles = { ...styles, ...r.styles };
    imageResources = { ...imageResources, ...r.imageResources };
    fonts = { ...fonts, ...r.fonts };
    numberingDefinitions = { ...numberingDefinitions, ...r.numberingDefinitions };
  }
  return { fonts, imageResources, styles, numberingDefinitions };
}

export function hasResources(resources: Resources): boolean {
  return !!resources.fonts || !!resources.styles || !!resources.imageResources || !!resources.numberingDefinitions;
}

export function extractResources(resources: Resources): Resources {
  return {
    ...(resources.fonts ? { fonts: resources.fonts } : {}),
    ...(resources.imageResources ? { imageResources: resources.imageResources } : {}),
    ...(resources.styles ? { styles: resources.styles } : {}),
    ...(resources.numberingDefinitions ? { numberingDefinitions: resources.numberingDefinitions } : {}),
  };
}

export function getStyle(
  parentStyle: Style | undefined,
  elementStyle: Style | undefined,
  type: string,
  name: string,
  resources: Resources
): Style | undefined {
  return getNestedStyle(parentStyle, elementStyle, type, name, resources, []);
}

export function getNestedStyle(
  parentStyle: Style | undefined,
  elementStyle: Style | undefined,
  type: string,
  name: string,
  resources: Resources,
  nestedStyleNames: ReadonlyArray<string>
): Style | undefined {
  const factoryDefault = defaultAndStandardStyles[create(type, "Default")];
  const documentDefault = resources.styles && resources.styles[create(type, "Default")];
  const namedStyle = resources.styles && resources.styles[create(type, name)];
  const nestedStyle = nestedStyleNames
    ? nestedStyleNames.reduce(
      (sofar, name) => overrideWith(sofar, resources.styles && resources.styles[create(type, name)]),
      namedStyle
    )
    : namedStyle;
  return overrideWith(
    elementStyle,
    overrideWith(nestedStyle, overrideWith(parentStyle, overrideWith(documentDefault, factoryDefault)))
  );
}
