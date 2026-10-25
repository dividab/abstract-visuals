/**
 * The classes the svg renderer puts on what it draws, for the page's CSS: `root` on the svg, e.g. sized to fill its box, `stroke` on each stroked
 * element, e.g. as thick at any size by `vector-effect: non-scaling-stroke`, `image` on an embedded picture or svg. Colors and strokes are
 * attributes, which a class overrides
 */
export const classNames = {
  root: "a3d-root",
  stroke: "a3d-stroke",
  image: "a3d-image",
} as const;
