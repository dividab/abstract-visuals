export type PropsDict = Record<string, unknown>;

export type DataDict = Record<string, unknown>;

export type ComponentDict = Record<string, Component>;

export type CreateElement<T = any> = (type: Component, props?: PropsDict, ...children: any[]) => T;

export type Node = {
  type: string;
  props: PropsDict;
  children: Node[];
};

export type H = (type: string, props?: PropsDict, ...children: Node[]) => Node;

export type Component = (...args: any[]) => any;
