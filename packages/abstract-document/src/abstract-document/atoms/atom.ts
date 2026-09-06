import type { HyperLink } from "./hyper-link.js";
import type { Image } from "./image.js";
import type { LineBreak } from "./line-break.js";
import type { LinkTarget } from "./link-target.js";
import type { TextField } from "./text-field.js";
import type { TextRun } from "./text-run.js";
import type { TocSeparator } from "./toc-separator.js";

export type Atom = Image | TextField | TextRun | HyperLink | TocSeparator | LinkTarget | LineBreak;
