import { AnalysisError, evaluate, compile, render, type FunctionSchema, type Schema } from "jsxpression";
import type { AbstractImage } from "../model/abstract-image.js";
import { createComponents } from "./components.js";
import { baseSchema } from "./schema.js";

export type DynamicImageResult =
  | {
      readonly type: "Ok";
      readonly image: AbstractImage;
      readonly imageUrls: ReadonlyArray<string>;
    }
  | { readonly type: "Err"; readonly error: DynamicImageError };

export type DynamicImageError = {
  type: "RENDER_ERROR";
  message: string;
  /** The analysis's issues, each where it is in the template, its lines and columns counted from 0 */
  issues?: ReadonlyArray<{
    code: string;
    message: string;
    range: { start: { line: number; column: number }; end: { line: number; column: number } };
  }>;
  cause?: unknown;
};

export function dynamicImage(
  source: string,
  data: Record<string, unknown>,
  dataSchema?: Schema["data"],
  functions?: Record<string, Function>,
  funcSchema?: Record<string, FunctionSchema>
): DynamicImageResult {
  try {
    const imageUrls: Array<string> = [];
    const schema: Schema = dataSchema ? { ...baseSchema, data: dataSchema, functions: funcSchema } : baseSchema;

    const image = render(source, schema, {
      data,
      functions,
      components: createComponents(imageUrls),
    });

    return { type: "Ok", image: abstractImage(image), imageUrls };
  } catch (error) {
    return {
      type: "Err",
      error: {
        type: "RENDER_ERROR",
        message: error instanceof Error ? error.message : String(error),
        issues: error instanceof AnalysisError ? error.report.issues.map((i) => ({ code: i.code, message: i.message, range: i.range })) : undefined,
        cause: error,
      },
    };
  }
}

/** What a template returned, which the analysis can't know is an image when it's a variable or a function's result, like `return image;` */
function abstractImage(value: unknown): AbstractImage {
  if (typeof value !== "object" || value === null || !("components" in value)) {
    throw new Error(`Templates must return <AbstractImage>`);
  }
  return value as AbstractImage;
}

export type CompileDynamicImageResult = { readonly type: "Ok"; value: string } | { readonly type: "Err"; readonly error: DynamicImageError };

export function compileDynamicImage(
  source: string,
  dataSchema?: Schema["data"],
  functionSchema?: Record<string, FunctionSchema>
): CompileDynamicImageResult {
  try {
    return {
      type: "Ok",
      value: compile(source, dataSchema ? { ...baseSchema, data: dataSchema, functions: functionSchema } : baseSchema),
    };
  } catch (error) {
    return {
      type: "Err",
      error: {
        type: "RENDER_ERROR",
        message: error instanceof Error ? error.message : String(error),
        issues: error instanceof AnalysisError ? error.report.issues.map((i) => ({ code: i.code, message: i.message, range: i.range })) : undefined,
        cause: error,
      },
    };
  }
}

export function renderDynamicImage(jsString: string, data: Record<string, unknown>, functions?: Record<string, Function>): DynamicImageResult {
  const imageUrls: Array<string> = [];
  try {
    return {
      type: "Ok",
      image: abstractImage(
        evaluate(jsString, baseSchema, {
          data,
          functions,
          components: createComponents(imageUrls),
        })
      ),
      imageUrls,
    };
  } catch (error) {
    return {
      type: "Err",
      error: {
        type: "RENDER_ERROR",
        message: error instanceof Error ? error.message : String(error),
        cause: error,
      },
    };
  }
}
