import unified from "unified";
import remarkParse from "remark-parse";
import remarkSubSuper from "remark-sub-super";
import { SectionElement } from "../section-elements/section-element.js";
import * as Paragraph from "../section-elements/paragraph.js";
import * as Atom from "../atoms/atom.js";
import * as TextRun from "../atoms/text-run.js";
import * as Group from "../section-elements/group.js";
import { AstElements, MarkDownProcessData, AstRoot } from "./types.js";

export interface MarkdownProps {
  readonly text: string;
  readonly keepTogetherSections?: boolean;
}

interface ListItemParams {
  readonly ordered: boolean;
  readonly start: number;
  readonly level: number;
  readonly firstChild: AstElements;
}

function preProcessMarkdownAst(
  ast: AstElements,
  styles: Array<string>,
  atoms: Array<Atom.Atom>,
  paragraphs: Array<Paragraph.Paragraph>,
  d: number,
  listItemParams: ListItemParams | undefined = undefined
): MarkDownProcessData {
  if (ast.type === "text" || ast.type === "break") {
    return { atoms, paragraphs };
  } // Need to convice TS that we never go below this line with a Str element.

  if (ast.children) {
    ast.children.forEach((child, i) => {
      let style = styles.slice(); // create a new copy of styles
      switch (ast.type) {
        case "heading":
          style.push("H" + ast.depth);
          break;
        case "emphasis":
          style.push("Emphasis");
          break;
        case "strong":
          style.push("Strong");
          break;
        case "sub":
          style.push("Subscript");
          break;
        case "sup":
          style.push("Superscript");
          break;
        default:
          break;
      }

      const newListItemParams =
        child.type === "list"
          ? {
              ordered: child.ordered === true,
              start: child.start || 1,
              level: listItemParams ? listItemParams.level + 1 : 0,
              firstChild: child.children[0],
            }
          : listItemParams;

      // Recurse down the rabbit hole until we find a Str.
      ({ atoms, paragraphs } = preProcessMarkdownAst(child, style, atoms, paragraphs, d + 1, newListItemParams));

      // After child, check if we should create a new paragraph.
      if (child.type === "paragraph" || child.type === "heading") {
        const paragraphStyle = child.type === "heading" ? "H" + child.depth : undefined;

        const paragraphNumbering = listItemParams
          ? {
              level: listItemParams.level,
              numberingId: listItemParams.ordered ? "Ordered" : "Unordered",
              numberOverride: ast === listItemParams.firstChild ? listItemParams.start : undefined,
              append: ast.type === "listItem" && child !== ast.children[0],
            }
          : undefined;

        paragraphs.push(
          Paragraph.create(
            {
              styleName: paragraphStyle,
              numbering: paragraphNumbering,
            },
            atoms
          )
        );
        atoms = []; // Flush the Atoms-array for the next paragraph.
      } else if (child.type === "break") {
        atoms.push({ type: "LineBreak" });
      } else if (child.type === "text") {
        atoms = atoms.concat(
          child.value.split("\n").map(
            (v: string) =>
              ({
                type: "TextRun",
                text: v,
                styleName: style[style.length - 1],
                nestedStyleNames: style,
                textProperties: {},
              } as TextRun.TextRun)
          )
        );
      }
    });
  }

  return { atoms, paragraphs };
}

export function create({ text, keepTogetherSections }: MarkdownProps): SectionElement {
  //markdown require newlines to have two spaces before them (this fixex alignment issues)
  const newlineReplacedText = text.replaceAll(/\n/g, "  \n\r").replaceAll(/<br>/g, "  \n\r");

  const ast = unified().use(remarkParse, { commonmark: true }).use(remarkSubSuper).parse(newlineReplacedText);
  const { paragraphs } = preProcessMarkdownAst(ast as AstRoot, [], [], [], 0);
  if (!keepTogetherSections) {
    return Group.create({ keepTogether: false }, paragraphs);
  }
  const groups: Array<Array<SectionElement>> = [];
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
  return Group.create(
    { keepTogether: true },
    groups.map((group) => Group.create({ keepTogether: true }, group))
  );
}
