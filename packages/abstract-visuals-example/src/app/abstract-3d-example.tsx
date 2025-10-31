import React from "react";
import FileSaver from "file-saver";
import { type React3Js, Dxf, Stl, Step, Svg } from "../../../abstract-3d/src/index.js";
import { systemair } from "./systemair.js";
import { vortice } from "./vortice.js";
import { cylinderFilter } from "./cylinder-filter.js";

export function Abstract3DExample(): React.ReactNode {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const [hovered, setHovered] = React.useState<string | undefined>(undefined);
  const group = systemair.groups.find((g) => g.data?.id === hovered);
  const popover: React3Js.ReactPopover | undefined = group
    ? { id: "popover", pos: { ...group.pos, y: group.pos.y - 300 }, content: "Hej" }
    : undefined;
  console.log(hovered, group, popover);
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", height: "20px", background: "rgb(251,  251, 251)" }}>
        <button
          onClick={() =>
            FileSaver.saveAs(new Blob([Dxf.render(systemair, { view: "top" })], { type: "text/plain" }), `a3d.dxf`)
          }
        >
          DXF
        </button>
        <button onClick={() => FileSaver.saveAs(new Blob([Stl.render(systemair)], { type: "text/plain" }), `a3d.stl`)}>
          STL
        </button>
        <button onClick={() => FileSaver.saveAs(new Blob([Step.render(systemair)], { type: "text/plain" }), `a3d.stp`)}>
          STEP
        </button>
        <button
          onClick={() =>
            FileSaver.saveAs(
              new Blob(
                [Svg.render(systemair, { view: "front", stroke: 2, scale: { size: 180, scaleByWidth: true } }).image],
                {
                  type: "text/plain",
                }
              ),
              `a3d.svg`
            )
          }
        >
          SVG
        </button>
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: Svg.render(systemair, {
            view: "front",
            stroke: 1,
            scale: { size: 400, scaleByWidth: true },
            rotation: 270,
          }).image,
        }}
      />
      <div style={{ height: "calc(100% - 20px)", width: "100%", display: "flex" }}>
        {/* <div style={{ height: "100%", width: "50%", display: "flex", flexDirection: "column" }}>
          <React3Js.render
            selectedIds={selected ? { [selected]: true } : undefined}
            onClickGroup={(id) => setSelected(id)}
            createGroupId={(g) => g.data?.id ?? ""}
            scene={systemair}
            orbitContolsProps={{ enableDamping: false }}
            camera={camera}
            onHoverGroup={(id) => setHovered(id)}
            popovers={popover ? [popover] : undefined}
          />
        </div>
        <div style={{ height: "100%", width: "50%", display: "flex", flexDirection: "column" }}>
          <React3Js.render
            selectedIds={selected ? { [selected]: true } : undefined}
            onClickGroup={(id) => setSelected(id)}
            createGroupId={(g) => g.data?.id ?? ""}
            scene={vortice}
            orbitContolsProps={{ enableDamping: false }}
            camera={camera}
          />
        </div> */}
      </div>
    </div>
  );
}

const camera: React3Js.Camera = { type: "Perspective", near: 100, far: 19000, fov: 60 };
