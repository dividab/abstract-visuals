import { render, Schema, compile, evaluate, PropertySchema } from "jsxpression";
import { AbstractImage } from "../model/abstract-image.js";
import { generateDataSchema } from "./utils.js";
import { createComponents } from "./components.js";
import { baseSchema } from "./schema.js";

export type DynamicImageResult =
  | { readonly type: "Ok"; readonly image: AbstractImage; readonly imageUrls: ReadonlyArray<string> }
  | { readonly type: "Err"; readonly error: DynamicImageError };

export type DynamicImageError = {
  type: "RENDER_ERROR";
  message: string;
  cause?: unknown;
};

export function dynamicImage(source: string, data: Record<string, unknown>): DynamicImageResult {
  try {
    const imageUrls = Array<string>();

    const schema: Schema = {
      ...baseSchema,
      data: generateDataSchema(data),
    };

    const image = render<AbstractImage>(source, schema, {
      data,
      components: createComponents(imageUrls),
    });

    return { type: "Ok", image, imageUrls };
  } catch (error) {
    return {
      type: "Err",
      error: { type: "RENDER_ERROR", message: error instanceof Error ? error.message : String(error), cause: error },
    };
  }
}

export type CompileDynamicImageResult =
  | { readonly type: "Ok"; value: string }
  | { readonly type: "Err"; readonly error: DynamicImageError };

export function compileDynamicImage(
  source: string,
  dataSchema?: Record<string, PropertySchema>
): CompileDynamicImageResult {
  try {
    return { type: "Ok", value: compile(source, dataSchema ? { ...baseSchema, data: dataSchema } : baseSchema) };
  } catch (error) {
    return {
      type: "Err",
      error: { type: "RENDER_ERROR", message: error instanceof Error ? error.message : String(error), cause: error },
    };
  }
}

export function renderDynamicImage(jsString: string, data: Record<string, unknown>): DynamicImageResult {
  const imageUrls = Array<string>();
  try {
    return {
      type: "Ok",
      image: evaluate(jsString, baseSchema, { data, components: createComponents(imageUrls) }) as AbstractImage,
      imageUrls,
    };
  } catch (error) {
    return {
      type: "Err",
      error: { type: "RENDER_ERROR", message: error instanceof Error ? error.message : String(error), cause: error },
    };
  }
}
