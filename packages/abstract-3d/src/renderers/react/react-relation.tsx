import type { ThreeEvent } from "@react-three/fiber";
import React from "react";
import type { Group, Relation } from "../../abstract-3d.js";
import { vec3Scale } from "../../abstract-3d.js";
import { ReactMaterial } from "./react-material.js";
import { ReactMesh } from "./react-mesh.js";

const outlineMat = { normal: "rgb(0, 0, 0)", opacity: 1.0 };

/** The shape of each active relation, e.g. where a component can be inserted on an air relation, clickable and darker when hovered */
export const ReactRelations = React.memo(
  ({
    relations,
    activeRelations,
    onClickRelation,
  }: {
    readonly relations: ReadonlyArray<Relation> | undefined;
    readonly activeRelations: ReadonlyArray<string> | undefined;
    readonly onClickRelation?: (relation: Relation, e: ThreeEvent<MouseEvent>) => void;
  }): React.JSX.Element => (
    <>
      {relations
        ?.filter((r) => activeRelations?.includes(r.id))
        .map((r) => (
          <ReactRelation key={r.id} relation={r} onClickRelation={onClickRelation} />
        ))}
    </>
  )
);

function ReactRelation({
  relation,
  onClickRelation,
}: {
  readonly relation: Relation;
  readonly onClickRelation?: (relation: Relation, e: ThreeEvent<MouseEvent>) => void;
}): React.JSX.Element {
  const [hovered, setHovered] = React.useState<boolean>(false);
  return (
    <group
      onClick={(e) => {
        if (onClickRelation) {
          e.stopPropagation();
          onClickRelation(relation, e);
        }
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
        setHovered(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        setHovered(false);
      }}
      onContextMenu={(e) => e.stopPropagation()}
    >
      {relation.groups?.map((g, i) => (
        <ReactRelationGroup key={i} g={g} hovered={hovered} />
      ))}
    </group>
  );
}

/** A group of a relation's shape, unlit, with a black outline around its boxes */
function ReactRelationGroup({ g, hovered }: { readonly g: Group; readonly hovered: boolean }): React.JSX.Element {
  return (
    <group position={[g.pos.x, g.pos.y, g.pos.z]} rotation={[g.rot?.x ?? 0, g.rot?.y ?? 0, g.rot?.z ?? 0]}>
      {g.meshes?.map((m, i) => (
        <React.Fragment key={i}>
          <ReactMesh mesh={m}>
            <ReactMaterial isText={false} isRelation={true} material={m.material} hovered={hovered} />
          </ReactMesh>
          {m.geometry.type === "Box" && (
            <ReactMesh mesh={{ ...m, geometry: { ...m.geometry, size: vec3Scale(m.geometry.size, 1.0125) } }}>
              <ReactMaterial isText={false} isRelation={true} drawBackOnly={true} material={outlineMat} hovered={hovered} />
            </ReactMesh>
          )}
        </React.Fragment>
      ))}
      {g.groups?.map((c, i) => (
        <ReactRelationGroup key={i} g={c} hovered={hovered} />
      ))}
    </group>
  );
}
