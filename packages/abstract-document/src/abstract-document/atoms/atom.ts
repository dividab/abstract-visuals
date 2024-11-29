import { Image } from "./image.js";
import { TextField } from "./text-field.js";
import { TextRun } from "./text-run.js";
import { HyperLink } from "./hyper-link.js";
import { TocSeparator } from "./toc-separator.js";
import { LinkTarget } from "./link-target.js";
import { LineBreak } from "./line-break.js";

export type Atom = Image | TextField | TextRun | HyperLink | TocSeparator | LinkTarget | LineBreak;
