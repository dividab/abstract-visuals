import type { Section } from "./page/section.js";
import type { Resources } from "./resources.js";
import type { NumberingDefinition } from "./numberings/numbering-definition.js";
import type { Indexer } from "./types.js";
import type { Font } from "./primitives/font.js";
import type { Style } from "./styles/style.js";
import type { ImageResource } from "./primitives/image-resource.js";

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
