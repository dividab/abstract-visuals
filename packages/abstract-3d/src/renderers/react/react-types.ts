import { Vec3 } from "../../abstract-3d.js";

export interface ReactPopover {
  readonly id: string;
  readonly pos: Vec3;
  readonly content: React.ReactNode;
}
