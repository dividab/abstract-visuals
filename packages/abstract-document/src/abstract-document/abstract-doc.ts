import { Section } from "./page/section.js";
import { Resources } from "./resources.js";
import { NumberingDefinition } from "./numberings/numbering-definition.js";
import { Indexer } from "./types.js";
import { Font } from "./primitives/font.js";
import { Style } from "./styles/style.js";
import { ImageResource } from "./primitives/image-resource.js";

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

export const addResources = (abstractDoc: AbstractDoc, resources: Resources): AbstractDoc => ({
  ...abstractDoc,
  fonts: { ...abstractDoc.fonts, ...resources.fonts },
  styles: { ...abstractDoc.styles, ...resources.styles },
  numberingDefinitions: { ...abstractDoc.numberingDefinitions, ...resources.numberingDefinitions },
  imageResources: { ...abstractDoc.imageResources, ...resources.imageResources },
});

export function merge(...docs: ReadonlyArray<AbstractDoc>): AbstractDoc {
  const children = Array<Section>();
  let styles: Indexer<Style> = {};
  let fonts: Indexer<Font> = {};
  let numberingDefinitions: Indexer<NumberingDefinition> = {};
  let imageResources: Record<string, ImageResource> = {};

  for (const d of docs) {
    children.push(...d.children);
    styles = { ...styles, ...d.styles };
    fonts = { ...fonts, ...d.fonts };
    imageResources = { ...imageResources, ...d.imageResources };
    numberingDefinitions = { ...numberingDefinitions, ...d.numberingDefinitions };
  }
  return create(
    {
      fonts,
      styles,
      numberingDefinitions,
      imageResources,
    },
    children
  );
}
