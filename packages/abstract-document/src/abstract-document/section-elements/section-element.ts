import { Group } from "./group";
import { Paragraph } from "./paragraph";
import { Table } from "./table";
import { PageBreak } from "./page-break";

export type SectionElement = Group | Paragraph | Table | PageBreak;
