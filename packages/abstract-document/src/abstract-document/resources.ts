import { ImageResource } from "./primitives/image-resource.js";
import { NumberingDefinition } from "./numberings/numbering-definition.js";
import { Numbering } from "./numberings/numbering.js";
import * as StyleKey from "./styles/style-key.js";
import { Style, overrideWith } from "./styles/style.js";
import { Font } from "./primitives/font.js";
import { Indexer } from "./types.js";
import { defaultAndStandardStyles } from "./default-styles.js";

export interface Resources {
  readonly fonts?: Indexer<Font>;
  readonly imageResources?: Indexer<ImageResource>;
  readonly styles?: Indexer<Style>;
  readonly numberings?: Indexer<Numbering>;
  readonly numberingDefinitions?: Indexer<NumberingDefinition>;
}

export function mergeResources(resources: Array<Resources>): Resources {
  let styles: Indexer<Style> = {};
  let numberings: Indexer<Numbering> = {};
  let imageResources: Indexer<ImageResource> = {};
  let fonts: Indexer<Font> = {};
  let numberingDefinitions: Indexer<NumberingDefinition> = {};
  for (const r of resources) {
    styles = { ...styles, ...r.styles };
    numberings = { ...numberings, ...r.numberings };
    imageResources = { ...imageResources, ...r.imageResources };
    fonts = { ...fonts, ...r.fonts };
    numberingDefinitions = { ...numberingDefinitions, ...r.numberingDefinitions };
  }
  return { fonts, imageResources, numberingDefinitions, numberings, styles };
}

export function hasResources(resources: Resources): boolean {
  return (
    !!resources.fonts ||
    !!resources.imageResources ||
    !!resources.styles ||
    !!resources.numberings ||
    !!resources.numberingDefinitions
  );
}

export function extractResources(resources: Resources): Resources {
  return {
    ...(resources.fonts ? { fonts: resources.fonts } : {}),
    ...(resources.imageResources ? { imageResources: resources.imageResources } : {}),
    ...(resources.styles ? { styles: resources.styles } : {}),
    ...(resources.numberings ? { numberings: resources.numberings } : {}),
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
  const factoryDefault = defaultAndStandardStyles[StyleKey.create(type, "Default")];
  const documentDefault = resources.styles && resources.styles[StyleKey.create(type, "Default")];
  const namedStyle = resources.styles && resources.styles[StyleKey.create(type, name)];
  const nestedStyle = nestedStyleNames
    ? nestedStyleNames.reduce(
        (sofar, name) => overrideWith(sofar, resources.styles && resources.styles[StyleKey.create(type, name)]),
        namedStyle
      )
    : namedStyle;
  return overrideWith(
    elementStyle,
    overrideWith(nestedStyle, overrideWith(parentStyle, overrideWith(documentDefault, factoryDefault)))
  );
}
