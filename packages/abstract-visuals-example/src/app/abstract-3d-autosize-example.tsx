import React from "react";
import * as React3Js from "../../../abstract-3d/src/renderers/react/index.js";
import { systemair } from "./systemair.js";
import { vortice } from "./vortice.js";

export function Abstract3DAutoSizeExample(): React.ReactNode {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const [hovered, setHovered] = React.useState<string | undefined>(undefined);
  const group = systemair.groups.find((g) => g.data?.id === hovered);
  const popover: React3Js.ReactPopover | undefined = group
    ? { id: "popover", pos: { ...group.pos, y: group.pos.y - 300 }, content: "Hej" }
    : undefined;
  console.log(hovered, group, popover);

  return (
    <div style={{ height: "100%", width: "50%", display: "flex", flexDirection: "column" }}>
      <React3Js.render
        selectedIds={selected ? { [selected]: true } : undefined}
        onClickGroup={(id) => setSelected(id)}
        createGroupId={(g) => g.data?.id ?? ""}
        scene={vortice}
        orbitContolsProps={{ enableDamping: false }}
        camera={camera}
      />
    </div>
  );
}

const camera: React3Js.Camera = { type: "Perspective", near: 100, far: 19000, fov: 60 };
