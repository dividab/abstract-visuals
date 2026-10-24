declare module "n8ao" {
  import type { Camera, Scene, WebGLRenderTarget } from "three";
  import type { Pass } from "three/addons/postprocessing/Pass.js";

  type AOPass = Pass & {
    readonly configuration: Record<string, unknown> & { intensity: number };
    readonly beautyRenderTarget: WebGLRenderTarget;
  };

  export const N8AOPass: new (scene: Scene, camera: Camera, width?: number, height?: number) => AOPass;
}
