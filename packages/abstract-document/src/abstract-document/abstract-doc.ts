import { Section } from "./page/section.js";
import { Resources } from "./resources.js";
import { NumberingDefinition } from "./numberings/numbering-definition.js";
import { Numbering } from "./numberings/numbering.js";
import { ImageResource } from "./primitives/image-resource.js";
import { Indexer } from "./types.js";
import { Font } from "./primitives/font.js";
import { Style } from "./styles/style.js";

export type AbstractDoc = Resources & {
  readonly children: ReadonlyArray<Section>;
};

export type AbstractDocProps = Resources & {};

//dummy2

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
