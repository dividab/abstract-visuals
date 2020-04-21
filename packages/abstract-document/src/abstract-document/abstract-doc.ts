import { Section } from "./page/section";
import { Resources } from "./resources";

export type AbstractDoc = Resources & {
  readonly children: ReadonlyArray<Section>;
};

export type AbstractDocProps = Resources & {};

export function create(
  props?: AbstractDocProps,
  children?: ReadonlyArray<Section>
): AbstractDoc {
  const { ...rest } = props || {};
  return {
    children: children || [],
    ...rest
  };
}
