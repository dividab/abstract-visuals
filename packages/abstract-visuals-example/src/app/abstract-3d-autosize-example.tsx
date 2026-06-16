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

  const controlsHelper: React3Js.ControlsHelper = {
    type: "Viewcube",
    props: { alignment: "top-right", margin: [63, 55] },
    viewcubeProps: {
      resetZoomAndPanOnClick: true,
      color: "#ffffff",
      font: "700 30px Inter, Arial, sans-serif",
      // onClick: (e: any): null => {
      //   // eslint-disable-next-line no-console
      //   console.log("Clicked");
      //   //e.stopPropagation();
      //   return null;
      // },
      strokeColor: "#112b31",
      textColor: "#112b31",
      hoverColor: "#558592",
      opacity: 0.8,
    },
  };

  const orbitContolProps = {
    enableDamping: true,
    zoomToCursor: false,

    dampingFactor: 0.3,
    minDistance: 100,
    maxDistance: 12000,
    zoomSpeed: 1.5,
  };

  return (
    <div style={{ height: "100%", width: "50%", display: "flex", flexDirection: "column" }}>
      <React3Js.render
        sceneFallback={<div>Loading</div>}
        useAlphaTest={false}
        selectedIds={{}}
        scene={systemair}
        showDimensions={true}
        camera={camera}
        controlsHelper={controlsHelper}
        orbitContolsProps={orbitContolProps}
        canvasProps={{}}
        useAnimations={true}
        onClickHotSpot={undefined}
        onClickGroup={undefined}
        // onHoverGroup={(id) => console.log("hovering", id)}
        onContextMenuGroup={undefined}
        createGroupKey={undefined}
        createGroupId={undefined}
        useOldMode={true} // Disables SSAO
      />
    </div>
  );
}

const camera: React3Js.Camera = { type: "Perspective", near: 100, far: 19000, fov: 60 };
