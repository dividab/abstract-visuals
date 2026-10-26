import { Mesh, MeshStandardMaterial, PMREMGenerator, type WebGLRenderer, type WebGLRenderTarget } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * The viewer's default environment: three.js's RoomEnvironment, a room with soft area lights, prefiltered for reflections. Its walls and the boxes in
 * it glow a light gray, so their sides away from the lights aren't dark and a flat metal face never mirrors black, while the room's falloff and
 * highlights stay. A module of its own, imported dynamically, so it's a chunk loaded only when the default environment is used
 */

/** The glow of the room's walls and boxes, the least they mirror */
const lift = 0.35;

export function createStudio(renderer: WebGLRenderer): WebGLRenderTarget {
  const room = new RoomEnvironment();
  room.traverse((o) => {
    if (o instanceof Mesh && o.material instanceof MeshStandardMaterial) {
      o.material.emissive.setScalar(lift);
    }
  });
  const pmrem = new PMREMGenerator(renderer);
  const target = pmrem.fromScene(room, 0.04);
  pmrem.dispose();
  room.dispose();
  return target;
}
