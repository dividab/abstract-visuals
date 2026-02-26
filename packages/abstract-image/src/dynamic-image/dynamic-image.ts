import { render, Schema, compile, evaluate, PropertySchema } from "jsxpression";
import { AbstractImage } from "../model/abstract-image.js";
import { createComponents } from "./components.js";
import { baseSchema } from "./schema.js";
import { FunctionSchema } from "../../../jsxpression/src/schema.js";

export type DynamicImageResult =
  | { readonly type: "Ok"; readonly image: AbstractImage; readonly imageUrls: ReadonlyArray<string> }
  | { readonly type: "Err"; readonly error: DynamicImageError };

export type DynamicImageError = {
  type: "RENDER_ERROR";
  message: string;
  cause?: unknown;
};

export function dynamicImage(
  source: string,
  data: Record<string, unknown>,
  dataSchema?: Record<string, PropertySchema>,
  functions?: Record<string, Function>,
  funcSchema?: Record<string, FunctionSchema>
): DynamicImageResult {
  try {
    const imageUrls = Array<string>();
    const schema: Schema = dataSchema ? { ...baseSchema, data: dataSchema, functions: funcSchema } : baseSchema;

    const image = render<AbstractImage>(source, schema, {
      data,
      functions,
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
  dataSchema?: Record<string, PropertySchema>,
  functionSchema?: Record<string, FunctionSchema>,
  tempSkipValidation?: boolean | undefined
): CompileDynamicImageResult {
  try {
    return {
      type: "Ok",
      value: compile(
        source,
        dataSchema ? { ...baseSchema, data: dataSchema, functions: functionSchema } : baseSchema,
        undefined,
        tempSkipValidation
      ),
    };
  } catch (error) {
    return {
      type: "Err",
      error: { type: "RENDER_ERROR", message: error instanceof Error ? error.message : String(error), cause: error },
    };
  }
}

export function renderDynamicImage(jsString: string, data: Record<string, unknown>, functions?: Record<string, Function>): DynamicImageResult {
  const imageUrls = Array<string>();
  try {
    return {
      type: "Ok",
      image: evaluate(jsString, baseSchema, { data, functions, components: createComponents(imageUrls) }) as AbstractImage,
      imageUrls,
    };
  } catch (error) {
    return {
      type: "Err",
      error: { type: "RENDER_ERROR", message: error instanceof Error ? error.message : String(error), cause: error },
    };
  }
}
