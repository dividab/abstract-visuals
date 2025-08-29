// import { ImageResource } from "./primitives/image-resource.js";
// import { Numbering } from "./numberings/numbering.js";
import { NumberingDefinition } from "./numberings/numbering-definition.js";
import { create } from "./styles/style-key.js";
import { Style, overrideWith } from "./styles/style.js";
import { Font } from "./primitives/font.js";
import { Indexer } from "./types.js";
import { defaultAndStandardStyles } from "./default-styles.js";

export interface Resources {
  readonly fonts?: Indexer<Font>;
  readonly styles?: Indexer<Style>;
  readonly imageDataByUrl?: Record<string, Uint8Array | string>;
  readonly numberingDefinitions?: Indexer<NumberingDefinition>;
  // These are not used???

  // readonly imageResources?: Indexer<ImageResource>;
  // readonly numberings?: Indexer<Numbering>;
}

export function mergeResources(resources: Array<Resources>): Resources {
  let styles: Indexer<Style> = {};
  let fonts: Indexer<Font> = {};
  let imageDataByUrl: Record<string, Uint8Array | string> = {};
  let numberingDefinitions: Indexer<NumberingDefinition> = {};

  // let numberings: Indexer<Numbering> = {};
  // let imageResources: Indexer<ImageResource> = {};
  for (const r of resources) {
    styles = { ...styles, ...r.styles };
    imageDataByUrl = { ...imageDataByUrl, ...r.imageDataByUrl };
    fonts = { ...fonts, ...r.fonts };
    numberingDefinitions = { ...numberingDefinitions, ...r.numberingDefinitions };

    // numberings = { ...numberings, ...r.numberings };
    // imageResources = { ...imageResources, ...r.imageResources };
  }
  return {
    fonts,
    imageDataByUrl,
    styles,
    // imageResources,
    // numberingDefinitions,
    // numberings,
  };
}

export function hasResources(resources: Resources): boolean {
  return (
    !!resources.fonts || !!resources.styles || !!resources.imageDataByUrl || !!resources.numberingDefinitions
    // || !!resources.imageResources ||
    // !!resources.numberings ||
  );
}

export function extractResources(resources: Resources): Resources {
  return {
    ...(resources.fonts ? { fonts: resources.fonts } : {}),
    ...(resources.imageDataByUrl ? { imageDataByUrl: resources.imageDataByUrl } : {}),
    ...(resources.styles ? { styles: resources.styles } : {}),
    ...(resources.numberingDefinitions ? { numberingDefinitions: resources.numberingDefinitions } : {}),
    // ...(resources.imageResources ? { imageResources: resources.imageResources } : {}),
    // ...(resources.numberings ? { numberings: resources.numberings } : {}),
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
