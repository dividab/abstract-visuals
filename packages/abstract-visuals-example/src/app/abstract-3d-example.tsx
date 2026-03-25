import React from "react";
import FileSaver from "file-saver";
import { React3Js, Dxf, Stl, Step, Svg } from "../../../abstract-3d/src/index.js";
import { systemair } from "./systemair.js";
import { vortice } from "./vortice.js";
import { ai } from "./double-view-ai.js";
import { createSVG } from "../../../abstract-image/src/exporters/svg-export-image.js";
import { dxf2dExportImage, DXF_DATA_URL } from "../../../abstract-image/src/exporters/dxf2d-export-image.js";
import { componentGeometries } from "./double-view-component-geometries.js";
import { templateScene } from "./template-scene.js";
import { Scene } from "../../../abstract-3d/src/abstract-3d.js";

export function Abstract3DExample(): React.ReactNode {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const [hovered, setHovered] = React.useState<string | undefined>(undefined);
  const group = systemair.groups.find((g) => g.data?.id === hovered);
  const popover: React3Js.ReactPopover | undefined = group
    ? { id: "popover", pos: { ...group.pos, y: group.pos.y - 300 }, content: "Hej" }
    : undefined;
  console.log(hovered, group, popover);

  const imageDataByUrlSvg: Record<string, any> = {};
  const imageDataByUrlDxf: Record<string, any> = {};
  const imageDataByUrlDxf2: Record<string, any> = {};

  const svgs = Array<string>();

  for (const geo of Object.values(componentGeometries)) {
    for (const s of geo.scenes as any) {
      svgs.push(`data:image/svg+xml,${encodeURIComponent(Svg.render(s.scene, s.options).image)}`);
    }
    imageDataByUrlSvg[geo.image.url] = `data:image/svg+xml,${encodeURIComponent(
      Svg.renderScenes(geo.scenes as any).image
    )}`;
  }

  for (const geo of Object.values(componentGeometries)) {
    imageDataByUrlDxf[geo.image.url] = `${DXF_DATA_URL}${Dxf.renderScenes(geo.scenes as any)}`;
    //imageDataByUrlDxf2[geo.image.url] = `${DXF_DATA_URL}${Dxf.renderOld((geo.scenes[0] as any)!.scene)}`;
    imageDataByUrlDxf2[geo.image.url] = `${DXF_DATA_URL}${Dxf.renderScenes(geo.scenes.slice(0, 1) as any)}`;
  }

  const templateImage = Svg.render(templateScene as Scene, { stroke_thickness: 3, only_stroke: true }).image;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", background: "rgb(230,  230, 230)" }}>
      <style>
        {`
       .wrapper > svg {
        width: 100%;
        height: 100%;
      }
    `}
      </style>
      <div style={{ display: "flex", height: "20px", background: "rgb(251,  251, 251)" }}>
        <button
          onClick={() =>
            FileSaver.saveAs(
              new Blob([dxf2dExportImage(ai, { imageDataByUrl: imageDataByUrlDxf, useColor: true })], {
                type: "text/plain",
              }),
              `a3d.dxf`
            )
          }
        >
          DXF double
        </button>
        <button
          onClick={() =>
            FileSaver.saveAs(
              new Blob([dxf2dExportImage(ai, { imageDataByUrl: imageDataByUrlDxf2, useColor: true })], {
                type: "text/plain",
              }),
              `a3d.dxf`
            )
          }
        >
          DXF single
        </button>
        <button
          onClick={() =>
            FileSaver.saveAs(
              new Blob([Dxf.renderScenes([(Object.values(componentGeometries)[0]!.scenes[0] as any)])], {
                type: "text/plain",
              }),
              `a3d.dxf`
            )
          }
        >
          DXF single raw
        </button>
        <button
          onClick={() =>
            FileSaver.saveAs(new Blob([Dxf.renderOld(systemair, { view: "front", origin: "Center" })], { type: "text/plain" }), `a3d.dxf`)
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
              new Blob([Svg.render(systemair, { view: "top", stroke_thickness: 2 }).image], { type: "text/plain" }),
              `a3d.svg`
            )
          }
        >
          SVG
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "row", height: "100%" }}>
        <img
          width="1000px"
          style={{ height: "max-content" }}
          src={`data:image/svg+xml,${encodeURIComponent(
            Svg.render(systemair, { view: "front", stroke_thickness: 1, rotation: 0, only_stroke: false }).image
          )}`}
        />
        <div
          className="wrapper"
          style={{ width: "200px", height: "200px", minWidth: "200px" }}
          dangerouslySetInnerHTML={{ __html: templateImage }}
        />
        <div dangerouslySetInnerHTML={{ __html: createSVG(ai, { imageDataByUrl: imageDataByUrlSvg }) }} />
        {svgs.map((svg, i) => (
          <img key={i} src={svg} width="200px" style={{ height: "max-content" }} />
        ))}
        <div style={{ height: "calc(100% - 20px)", width: "100%", display: "flex" }}>
          <div style={{ height: "100%", width: "50%", display: "flex", flexDirection: "column" }}>
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
          </div>
        </div>
      </div>
    </div>
  );
}

const camera: React3Js.Camera = { type: "Perspective", near: 100, far: 19000, fov: 60 };
