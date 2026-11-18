import { type Box3, BoxGeometry, Color, Group, Matrix4, Mesh, MeshBasicMaterial, Quaternion, Vector3 } from "three";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { selectColor } from "../appearance/appearance.js";

/** Selected groups are boxed on their bounds, in their top-level group's axes: the box tinted, with bold edges, faint where hidden */

/** Bounds in the axes of `matrix`, the world matrix of the group's top-level group */
export type SelectionBox = { readonly bounds: Box3; readonly matrix: Matrix4 };

export type Selection = {
  readonly object: Group;
  readonly front: LineSegments2;
  readonly behind: LineSegments2;
  readonly volumes: Group;
  readonly volumeMaterial: MeshBasicMaterial;
};

const behindOpacity = 0.3;
const volumeOpacity = 0.12;
/** The corners each of a box's 12 edges joins, by the corner's binary digits: x max 1, y max 2, z max 4 */
const edges = [0, 1, 2, 3, 4, 5, 6, 7, 0, 2, 1, 3, 4, 6, 5, 7, 0, 4, 1, 5, 2, 6, 3, 7];
const unitBox = new BoxGeometry();

export function createSelection(): Selection {
  const color = new Color(selectColor);
  const geometry = new LineSegmentsGeometry();
  // Pulled towards the camera, so edges and tints on the group's own faces aren't half hidden by them
  const offset = { polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 };
  const front = new LineSegments2(geometry, new LineMaterial({ color, linewidth: 5, ...offset }));
  const behind = new LineSegments2(
    geometry,
    new LineMaterial({ color, linewidth: 3, transparent: true, opacity: behindOpacity, depthTest: false, depthWrite: false })
  );
  // Drawn after the scene, the hidden edges over what hides them
  Object.assign(front, { frustumCulled: false, renderOrder: 2 });
  Object.assign(behind, { frustumCulled: false, renderOrder: 3 });
  const volumes = new Group();
  const object = new Group();
  object.add(volumes, front, behind);
  object.visible = false;
  return {
    object,
    front,
    behind,
    volumes,
    volumeMaterial: new MeshBasicMaterial({ color, transparent: true, opacity: volumeOpacity, depthWrite: false, ...offset }),
  };
}

export function setSelection(selection: Selection, boxes: ReadonlyArray<SelectionBox>): void {
  const positions = new Float32Array(boxes.length * edges.length * 3);
  let offset = 0;
  selection.volumes.clear();
  for (const { bounds, matrix } of boxes) {
    const { min, max } = bounds;
    for (const corner of edges) {
      point.set(corner % 2 ? max.x : min.x, Math.floor(corner / 2) % 2 ? max.y : min.y, corner >= 4 ? max.z : min.z);
      positions.set(point.applyMatrix4(matrix).toArray(), offset);
      offset += 3;
    }
    const volume = new Mesh(unitBox, selection.volumeMaterial);
    volume.matrixAutoUpdate = false;
    volume.matrix.multiplyMatrices(matrix, scratch.compose(bounds.getCenter(point), identity, bounds.getSize(extent)));
    selection.volumes.add(volume);
  }
  // A new geometry, as setting positions again leaves the old buffers on the GPU
  selection.front.geometry.dispose();
  const geometry = new LineSegmentsGeometry().setPositions(positions);
  selection.front.geometry = geometry;
  selection.behind.geometry = geometry;
  selection.object.visible = boxes.length > 0;
}

export function disposeSelection(selection: Selection): void {
  selection.front.geometry.dispose();
  selection.front.material.dispose();
  selection.behind.material.dispose();
  selection.volumeMaterial.dispose();
}

const point = new Vector3();
const extent = new Vector3();
const scratch = new Matrix4();
const identity = new Quaternion();
