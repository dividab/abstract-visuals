import * as AI from "../model/index";
import * as R from "ramda";

export function epsExportImage(root: AI.AbstractImage): string {
  return [
    "%!PS-Adobe-3.0 EPSF-3.0",
    `%%BoundingBox: 0 0 ${root.size.width} ${root.size.height}`,
    "/ellipse {7 dict begin",
    "/endangle exch def",
    "/startangle exch def",
    "/yradius exch def",
    "/xradius exch def",
    "/yC exch def",
    "/xC exch def",
    "/savematrix matrix currentmatrix def",
    "xC yC translate",
    "xradius yradius scale",
    "0 0 1 startangle endangle arc",
    "savematrix setmatrix",
    "end",
    "} def",
    ...R.unnest<string>(
      root.components.map(c => epsExportComponent(c, root.size.height))
    )
  ].join("\n");
}

function epsExportComponent(c: AI.Component, height: number): Array<string> {
  switch (c.type) {
    case "ellipse": {
      const cx = (c.topLeft.x + c.bottomRight.x) * 0.5;
      const cy = height - (c.topLeft.y + c.bottomRight.y) * 0.5;
      const rx = 0.5 * (c.bottomRight.x - c.topLeft.x);
      const ry = 0.5 * (c.bottomRight.y - c.topLeft.y);
      return [
        ...getColored(c.fillColor, [
          `${cx} ${cy} ${rx} ${ry} 0 360 ellipse`,
          "closepath",
          "fill"
        ]),
        ...getColored(c.strokeColor, [
          `${cx} ${cy} ${rx} ${ry} 0 360 ellipse`,
          "closepath",
          `${c.strokeThickness} setlinewidth`,
          "stroke"
        ])
      ];
    }
    case "group": {
      return R.unnest<string>(
        c.children.map(cc => epsExportComponent(cc, height))
      );
    }
    case "line": {
      return getColored(c.strokeColor, [
        `${c.start.x} ${height - c.start.y} moveto`,
        `${c.end.x} ${height - c.end.y} lineto`,
        `${c.strokeThickness} setlinewidth`,
        "stroke"
      ]);
    }
    case "polygon": {
      return [
        ...getColored(c.fillColor, [
          `${c.points[0].x} ${height - c.points[0].y} moveto`,
          ...c.points.map(p => `${p.x} ${height - p.y} lineto`),
          "closepath",
          `${c.strokeThickness} setlinewidth`,
          "fill"
        ]),
        ...getColored(c.strokeColor, [
          `${c.points[0].x} ${height - c.points[0].y} moveto`,
          ...c.points.map(p => `${p.x} ${height - p.y} lineto`),
          "closepath",
          "stroke"
        ])
      ];
    }
    case "polyline": {
      return getColored(c.strokeColor, [
        `${c.points[0].x} ${height - c.points[0].y} moveto`,
        ...c.points.map(p => `${p.x} ${height - p.y} lineto`),
        "closepath",
        `${c.strokeThickness} setlinewidth`,
        "stroke"
      ]);
    }
    case "rectangle": {
      const w = c.bottomRight.x - c.topLeft.x;
      const h = c.bottomRight.y - c.topLeft.y;
      return [
        ...getColored(c.fillColor, [
          `${c.topLeft.x} ${height - c.bottomRight.y} ${w} ${h} rectfill`
        ]),
        ...getColored(c.strokeColor, [
          `${c.strokeThickness} setlinewidth`,
          `${c.topLeft.x} ${height - c.bottomRight.y} ${w} ${h} rectstroke`
        ])
      ];
    }
    case "text": {
      return getColored(c.textColor, [
        `gsave`,
        `/${c.fontFamily} findfont`,
        `${c.fontSize} scalefont setfont`,
        `${c.position.x} ${height - c.position.y} moveto`,
        getTextXOffset(c),
        getTextYOffset(c),
        `rmoveto`,
        `${-c.clockwiseRotationDegrees} rotate`,
        `(${c.text}) show`,
        `grestore`
      ]);
    }
    default:
      return [];
  }
}

function getTextXOffset(c: AI.Text): string {
  if (c.horizontalGrowthDirection === "left") {
    return `(${c.text}) stringwidth pop neg`;
  } else if (c.horizontalGrowthDirection === "uniform") {
    return `(${c.text}) stringwidth pop neg 0.5 mul`;
  } else {
    return `0`;
  }
}

function getTextYOffset(c: AI.Text): string {
  if (c.verticalGrowthDirection === "down") {
    return `gsave (${
      c.text
    }) true charpath pathbbox exch pop 3 -1 roll pop sub grestore`;
  } else if (c.verticalGrowthDirection === "uniform") {
    return `gsave (${
      c.text
    }) true charpath pathbbox exch pop 3 -1 roll pop sub 0.5 mul grestore`;
  } else {
    return `0`;
  }
}

function getColored(
  color: AI.Color,
  instructions: Array<string>
): Array<string> {
  if (color.a === 0) {
    return [];
  }
  return [
    `${color.r / 255} ${color.g / 255} ${color.b / 255} setrgbcolor`,
    ...instructions
  ];
}
