export interface LinkTarget {
  readonly type: "LinkTarget";
  readonly name: string;
}

export interface LinkTargetProps {
  readonly name: string;
}

export function create(props: LinkTargetProps): LinkTarget {
  return {
    type: "LinkTarget",
    name: props.name
  };
}
