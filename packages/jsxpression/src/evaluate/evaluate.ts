import { EvaluationError } from "./evaluation-error.js";
import { Schema, isElementAllowed, canHaveChildren } from "../schema.js";

export type ComponentDict = Record<string, Component>;

export type CreateElement<T = any> = (type: Component, props?: PropsDict, ...children: any[]) => T;

export type PropsDict = Record<string, unknown>;

export type DataDict = Record<string, unknown>;

export type Node = {
  type: string;
  props: PropsDict;
  children: Node[];
};

export type H = (type: string, props?: PropsDict, ...children: Node[]) => Node;

export type Component = (...args: any[]) => any;

/**
 * Configuration options for evaluating JSX expressions.
 *
 * @template T - The return type of createElement function
 */
export interface EvaluateOptions<T = any> {
  /** Data object whose keys become top-level variables in JSX expressions */
  data?: DataDict;
  /** Map of component names to component functions used in JSX */
  components?: ComponentDict;
  /** Map of additional functions */
  functions?: Record<string, Function>;
  /** Function to create JSX elements (e.g., React.createElement, h) */
  createElement?: CreateElement<T>;
}

const RESERVED_PARAMS = new Set(["h", "Math"]);
const VALID_IDENTIFIER = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;

export function evaluate<T = any>(source: string, schema: Schema, options: EvaluateOptions<T>): T {
  const { data = {}, components = {}, functions = {}, createElement } = options;

  const dataKeys = Object.keys(data);
  const functionKeys = Object.keys(functions);
  validateParamKeys(dataKeys, functionKeys);

  const h = createH(components, createElement || defaultCreateElement, schema);
  const frozen = deepFreezeData(structuredClone(data));
  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    return new Function("h", "Math", ...dataKeys, ...functionKeys, source)(
      h,
      Math,
      ...Object.values(frozen),
      ...Object.values(functions)
    ) as T;
  } catch (error: unknown) {
    // We may have thrown an EvaluationError from createH()
    if (error instanceof EvaluationError) {
      throw error;
    }

    throw new EvaluationError(error instanceof Error ? error.message : "Evaluation failed");
  }
}

function validateParamKeys(dataKeys: string[], functionKeys: string[]): void {
  const seen = new Set<string>(RESERVED_PARAMS);
  for (const key of [...dataKeys, ...functionKeys]) {
    if (!VALID_IDENTIFIER.test(key)) {
      throw new EvaluationError(`Invalid key "${key}": must be a valid JavaScript identifier`);
    }
    if (seen.has(key)) {
      throw new EvaluationError(`Duplicate or reserved parameter name "${key}"`);
    }
    seen.add(key);
  }
}

function createH(components: ComponentDict, createElement: CreateElement, schema: Schema): H {
  return function h(type, props, ...children) {
    const Component = components[type];

    if (!Component) {
      if (isElementAllowed(schema, type)) {
        const defaultComponent = (props: PropsDict): any => (canHaveChildren(schema, type) ? props.children : null);
        return createElement(defaultComponent, props, ...children.flat().filter(Boolean));
      }

      // Component not in schema - throw error
      throw new EvaluationError(`component "${type}" is not allowed`);
    }

    return createElement(Component, props, ...children.flat().filter(Boolean));
  };
}

function deepFreezeData(obj: Record<string, unknown>): Record<string, unknown> {
  Object.freeze(obj);
  for (const value of Object.values(obj)) {
    if (typeof value === "object" && value !== null) {
      deepFreezeData(value as Record<string, unknown>);
    }
  }
  return obj;
}

function defaultCreateElement(Component: Component, props: PropsDict = {}, ...children: any[]): Node {
  return Component({ ...props, children });
}
