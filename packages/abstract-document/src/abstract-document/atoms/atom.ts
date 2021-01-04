import { Image } from "./image";
import { TextField } from "./text-field";
import { TextRun } from "./text-run";
import { HyperLink } from "./hyper-link";
import { WhiteSpace } from "./white-space";

export type Atom = Image | TextField | TextRun | HyperLink | WhiteSpace;
