import { Section } from "./page/section";
import { Resources } from "./resources";

export type AbstractDoc = Resources & {
  readonly children: Array<Section>;
};

export type AbstractDocProps = Resources & {
  readonly children?: Array<Section>;
};

export function create(props?: AbstractDocProps): AbstractDoc {
  const { children = [], ...rest } = props || {};
  return {
    children,
    ...rest
  };
}
