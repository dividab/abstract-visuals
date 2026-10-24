import { DirectionalLight, Group, Sphere, Vector3 } from "three";
import type { BuiltScene } from "../build/build.js";
import { getShadowCasters } from "./shadow.js";

/**
 * A key light from the upper left front, on top of the studio's soft light, that casts the solids' shadows on themselves, e.g. under a roof or behind
 * a profile. Its shadow map is rendered once per build, as the scene doesn't move, so a frame only samples it; the casters are the ground shadow's
 */

const direction = new Vector3(-1, 2, 1.2).normalize();
const intensity = 3.5;
const mapSize = 2048;

/** The light and its target, to add to the scene, with or without shadows; undefined for a scene without solids */
export function createKeyLight(built: BuiltScene, shadows: boolean): Group | undefined {
  const { bounds } = getShadowCasters(built);
  if (bounds.isEmpty()) {
    return undefined;
  }
  const { center, radius } = bounds.getBoundingSphere(new Sphere());
  const light = new DirectionalLight(0xffffff, intensity);
  light.position.copy(center).addScaledVector(direction, radius * 2);
  light.target.position.copy(center);
  light.castShadow = shadows;
  // The shadow camera just encloses the scene, so the map's texels are as small as they can be
  Object.assign(light.shadow.camera, { left: -radius, right: radius, top: radius, bottom: -radius, near: radius, far: radius * 3 });
  light.shadow.camera.updateProjectionMatrix();
  light.shadow.mapSize.set(mapSize, mapSize);
  // Offsets along the normal by three texels, against shadow acne on the lit faces
  Object.assign(light.shadow, { bias: -0.0005, normalBias: (radius * 6) / mapSize, radius: 3 });
  return new Group().add(light, light.target);
}

export function disposeKeyLight(key: Group): void {
  key.removeFromParent();
  key.children.forEach((child) => {
    if (child instanceof DirectionalLight) {
      child.shadow.dispose();
    }
  });
}
