import { Scene, type Vector3 } from "three";
import { CSS2DObject, CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";

/**
 * HTML elements over the canvas at 3D anchors, e.g. popovers and tooltips, placed by three.js's CSS2DRenderer; their content is mounted by the app,
 * or directly
 */

export type Overlay<Content> = {
  readonly key: string;
  /** In world space */
  readonly position: Vector3;
  readonly content: Content;
};

export type MountedOverlay<Content> = { readonly key: string; readonly element: HTMLElement; readonly content: Content };

/** Mounts the overlays' content into their elements, called when the set of overlays or their content changes */
export type MountOverlays<Content> = (overlays: ReadonlyArray<MountedOverlay<Content>>) => void;

export type OverlayLayer<Content> = {
  readonly renderer: CSS2DRenderer;
  readonly scene: Scene;
  readonly mounted: Map<string, { readonly object: CSS2DObject; overlay: Overlay<Content> }>;
};

export function createOverlayLayer<Content>(container: HTMLElement): OverlayLayer<Content> {
  const renderer = new CSS2DRenderer();
  renderer.domElement.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none";
  container.append(renderer.domElement);
  return { renderer, scene: new Scene(), mounted: new Map() };
}

/** Without `mount`, strings and DOM nodes are mounted as they are */
export function setOverlays<Content>(
  layer: OverlayLayer<Content>,
  overlays: ReadonlyArray<Overlay<Content>>,
  mount: MountOverlays<Content> | undefined
): void {
  const keys = new Set<string>();
  const changed = { current: false };
  overlays.forEach((overlay) => {
    keys.add(overlay.key);
    const existing = layer.mounted.get(overlay.key);
    changed.current ||= existing?.overlay.content !== overlay.content;
    const object = existing?.object ?? new CSS2DObject(document.createElement("div"));
    object.position.copy(overlay.position);
    if (existing) {
      existing.overlay = overlay;
    } else {
      object.element.style.pointerEvents = "none";
      layer.scene.add(object);
      layer.mounted.set(overlay.key, { object, overlay });
    }
  });
  layer.mounted.forEach(({ object }, key) => {
    if (!keys.has(key)) {
      // Its element is removed with it
      layer.scene.remove(object);
      layer.mounted.delete(key);
      changed.current = true;
    }
  });
  if (changed.current && mount) {
    mount(Array.from(layer.mounted, ([key, { object, overlay }]) => ({ key, element: object.element, content: overlay.content })));
  } else if (changed.current) {
    layer.mounted.forEach(({ object, overlay: { content } }) =>
      object.element.replaceChildren(content instanceof Node ? content : String(content ?? ""))
    );
  }
}
