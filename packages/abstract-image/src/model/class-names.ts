/**
 * The classes ReactSvg puts on what it draws, for the page's CSS: `root` on the svg, not a sub image's, `image` on an embedded picture, e.g. inverted
 * in a dark theme, `part` on an element with an id, e.g. clickable; a text's `className` is added to them. Colors and strokes are attributes, which a
 * class overrides; a text's font and anchor are its inline style, which it doesn't
 */
export const classNames = {
  root: "ai-root",
  image: "ai-image",
  part: "ai-part",
} as const;
