import * as R from "ramda";
import { ImageResource } from "./primitives/image-resource";
import { NumberingDefinition } from "./numberings/numbering-definition";
import { Numbering } from "./numberings/numbering";
import * as StyleKey from "./styles/style-key";
import { Style, overrideWith } from "./styles/style";
import { Font } from "./primitives/font";
import { Indexer } from "./types";
import { defaultAndStandardStyles } from "./default-styles";

export interface Resources {
  readonly fonts?: Indexer<Font>;
  readonly imageResources?: Indexer<ImageResource>;
  readonly styles?: Indexer<Style>;
  readonly numberings?: Indexer<Numbering>;
  readonly numberingDefinitions?: Indexer<NumberingDefinition>;
}

export function mergeResources(resources: Array<Resources>): Resources {
  const fonts = R.mergeAll(resources.map(r => r.fonts)) as {};
  const imageResources = R.mergeAll(resources.map(r => r.imageResources)) as {};
  const numberingDefinitions = R.mergeAll(
    resources.map(r => r.numberingDefinitions)
  ) as {};
  const numberings = R.mergeAll(resources.map(r => r.numberings)) as {};
  const styles = R.mergeAll(resources.map(r => r.styles)) as {};
  return {
    fonts,
    imageResources,
    numberingDefinitions,
    numberings,
    styles
  };
}

export function getStyle(
  parentStyle: Style | undefined,
  elementStyle: Style | undefined,
  type: string,
  name: string,
  resources: Resources
): Style | undefined {
  const factoryDefault =
    defaultAndStandardStyles[StyleKey.create(type, "Default")];
  const documentDefault =
    resources.styles && resources.styles[StyleKey.create(type, "Default")];
  const namedStyle =
    resources.styles && resources.styles[StyleKey.create(type, name)];
  return overrideWith(
    elementStyle,
    overrideWith(
      namedStyle,
      overrideWith(parentStyle, overrideWith(documentDefault, factoryDefault))
    )
  );
}
