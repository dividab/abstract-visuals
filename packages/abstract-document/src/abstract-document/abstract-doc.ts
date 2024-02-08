import { Section } from "./page/section";
import { Resources } from "./resources";
import { NumberingDefinition } from "./numberings/numbering-definition";
import { Numbering } from "./numberings/numbering";
import { ImageResource } from "./primitives/image-resource";
import { Indexer } from "./types";
import { Font } from "./primitives/font";
import { Style } from "./styles/style";

export type AbstractDoc = Resources & {
  readonly children: ReadonlyArray<Section>;
};

export type AbstractDocProps = Resources & {};

export function create(props?: AbstractDocProps, children?: ReadonlyArray<Section>): AbstractDoc {
  const { ...rest } = props || {};
  return {
    children: children || [],
    ...rest,
  };
}

export function merge(...docs: ReadonlyArray<AbstractDoc>): AbstractDoc {
  const children = Array<Section>();
  let styles: Indexer<Style> = {};
  let numberings: Indexer<Numbering> = {};
  let imageResources: Indexer<ImageResource> = {};
  let fonts: Indexer<Font> = {};
  let numberingDefinitions: Indexer<NumberingDefinition> = {};
  for (const d of docs) {
    children.push(...d.children);
    styles = { ...styles, ...d.styles };
    numberings = { ...numberings, ...d.numberings };
    imageResources = { ...imageResources, ...d.imageResources };
    fonts = { ...fonts, ...d.fonts };
    numberingDefinitions = { ...numberingDefinitions, ...d.numberingDefinitions };
  }
  return create({ fonts, imageResources, styles, numberings, numberingDefinitions }, children);
}
