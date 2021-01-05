import { Image } from "./image";
import { TextField } from "./text-field";
import { TextRun } from "./text-run";
import { HyperLink } from "./hyper-link";
import { TocSeparator } from "./toc-separator";

export type Atom = Image | TextField | TextRun | HyperLink | TocSeparator;
