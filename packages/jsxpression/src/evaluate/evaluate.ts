import { EvaluationError } from "./evaluation-error.js";

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
  /** Data object available as `data.*` in JSX expressions */
  data?: DataDict;
  /** Map of component names to component functions used in JSX */
  components?: ComponentDict;
  /** Function to create JSX elements (e.g., React.createElement, h) */
  createElement?: CreateElement<T>;
}

export function evaluate<T = any>(source: string, options: EvaluateOptions<T>): T {
  const { data = {}, components = {}, createElement } = options;

  const h = createH(components, createElement || defaultCreateElement);

  try {
    // eslint-disable-next-line @typescript-eslint/no-implied-eval, no-new-func
    return new Function("h", "data", "Math", source)(h, deepFreezeData(data), Math) as T;
  } catch (error: unknown) {
    // We may have thrown an EvaluationError from createH()
    if (error instanceof EvaluationError) {
      throw error;
    }

    throw new EvaluationError(error instanceof Error ? error.message : "Evaluation failed");
  }
}

function createH(components: ComponentDict, createElement: CreateElement): H {
  return function h(type, props, ...children) {
    const Component = components[type];

    if (!Component) {
      throw new EvaluationError(`component "${type}" is not allowed`);
    }

    return createElement(Component, props, ...children.flat().filter(Boolean));
  };
}

function deepFreezeData(obj: DataDict): DataDict {
  Object.freeze(obj);
  Object.values(obj).filter(isDataDict).forEach(deepFreezeData);
  return obj;
}

function isDataDict(value: any): value is DataDict {
  return typeof value === "object" && value !== null;
}

function defaultCreateElement(Component: Component, props: PropsDict = {}, ...children: any[]): Node {
  return Component({ ...props, children });
}
