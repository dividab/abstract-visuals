import * as R from "ramda";
import * as React from "react";
import {
  AbstractDoc as AbstractDoc1,
  Section as Section1,
  Group as Group1,
  Paragraph as Paragraph1,
  Table as Table1,
  TableRow as TableRow1,
  TableCell as TableCell1,
  HyperLink as HyperLink1,
  Image as Image1,
  Markdown as Markdown1,
  TextField as TextField1,
  TextRun as TextRun1
} from "../abstract-document";

// tslint:disable:variable-name no-any

export const AbstractDoc = (props: AbstractDoc1.AbstractDocProps) =>
  AbstractDoc1.create(props) as any;
export const Section = (props: Section1.SectionProps) =>
  Section1.create(props) as any;
export const Group = (props: Group1.GroupProps) => Group1.create(props) as any;
export const Paragraph = (props: Paragraph1.ParagraphProps) =>
  Paragraph1.create(props) as any;
export const Table = (props: Table1.TableProps) => Table1.create(props) as any;
export const TableRow = (props: TableRow1.TableRowProps) =>
  TableRow1.create(props) as any;
export const TableCell = (props: TableCell1.TableCellProps) =>
  TableCell1.create(props) as any;
export const HyperLink = (props: HyperLink1.HyperLinkProps) =>
  HyperLink1.create(props) as any;
export const Image = (props: Image1.ImageProps) => Image1.create(props) as any;
export const Markdown = (props: Markdown1.MarkdownProps) =>
  Markdown1.create(props) as any;
export const TextField = (props: TextField1.TextFieldProps) =>
  TextField1.create(props) as any;
export const TextRun = (props: TextRun1.TextRunProps) =>
  TextRun1.create(props) as any;

export function render(element: any): any {
  if (typeof element.type !== "function") {
    return element;
  }
  const props = element.props || {};
  const children = renderChildren(element);
  return (element.type as any)({ ...props, children });
}

function renderChildren(element: React.ReactElement<any>): any {
  if (!element.props || !element.props.children) {
    return [];
  } else if (Array.isArray(element.props.children)) {
    return R.unnest(
      element.props.children.map((c: any) => {
        if (!c) {
          return [];
        }
        if (Array.isArray(c)) {
          return c.map(render);
        }
        return render(c);
      })
    );
  } else {
    const elements = render(element.props.children); // Markdown returns an array of elements already
    return Array.isArray(elements) ? elements : [elements]; // so we need to test for that before we return.
  }
}
