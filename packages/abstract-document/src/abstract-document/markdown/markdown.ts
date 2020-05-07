import { SectionElement } from "../section-elements/section-element";
import { parse } from "@textlint/markdown-to-ast";
import { AstElements, MarkDownProcessData } from "./types";
import * as Paragraph from "../section-elements/paragraph";
import * as Atom from "../atoms/atom";
import * as TextRun from "../atoms/text-run";
import * as Group from "../section-elements/group";

export interface MarkdownProps {
  readonly text: string;
  readonly keepTogetherSections?: boolean;
}

function preProcessMarkdownAst(
  ast: AstElements,
  styles: Array<string>,
  atoms: Array<Atom.Atom>,
  paragraphs: Array<Paragraph.Paragraph>,
  d: number
): MarkDownProcessData {
  if (ast.type === "Str") {
    return { atoms, paragraphs };
  } // Need to convice TS that we never go below this line with a Str element.

  if (ast.children) {
    ast.children.forEach(child => {
      let style = styles.slice(); // create a new copy of styles
      switch (ast.type) {
        case "Header":
          style.push("H" + ast.depth);
          break;
        case "Emphasis":
          style.push("Emphasis");
          break;
        case "Strong":
          style.push("Strong");
          break;
        default:
          break;
      }

      // Recurse down the rabbit hole until we find a Str.
      ({ atoms, paragraphs } = preProcessMarkdownAst(
        child,
        style,
        atoms,
        paragraphs,
        d + 1
      ));
      // After child, check if we should create a new paragraph.
      if (child.type === "Paragraph" || child.type === "Header") {
        const paragraphStyle =
          child.type === "Header" ? "H" + child.depth : undefined;

        paragraphs.push(
          Paragraph.create(
            {
              styleName: paragraphStyle,
              numbering: undefined //paragraph.numbering
            },
            atoms
          )
        );
        atoms = []; // Flush the Atoms-array for the next paragraph.
      } else if (child.type === "Str") {
        atoms = atoms.concat(
          child.value.split("\n").map(
            (v: string) =>
              ({
                type: "TextRun",
                text: v,
                styleName: style[style.length - 1],
                textProperties: {}
              } as TextRun.TextRun)
          )
        );
      }
    });
  }

  return { atoms, paragraphs };
}

export function create({
  text,
  keepTogetherSections
}: MarkdownProps): Array<SectionElement> {
  const ast = parse(text);
  const { paragraphs } = preProcessMarkdownAst(ast, [], [], [], 0);
  if (!keepTogetherSections) {
    return paragraphs;
  }
  const groups: Array<Array<SectionElement>> = [[]];
  let group: Array<SectionElement> = [];
  let i = 0;
  while (i < paragraphs.length) {
    while (i < paragraphs.length && paragraphs[i].styleName.startsWith("H")) {
      group.push(paragraphs[i]);
      ++i;
    }
    if (i < paragraphs.length) {
      group.push(paragraphs[i]);
    }
    if (group.length > 0) {
      groups.push(group);
      group = [];
    }
    ++i;
  }
  return groups.map(group => Group.create({ keepTogether: true }, group));
}
