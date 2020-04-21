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
  TextRun as TextRun1,
  Resources,
  MasterPage,
  ParagraphStyle,
  ParagraphNumbering,
  TableStyle
} from "../abstract-document/index";

// tslint:disable:variable-name no-any

export interface ChildrenProp {
  readonly children?: Child;
}
export type Child = JSX.Element | Children;
export interface Children extends ReadonlyArray<Child> {}

export const AbstractDoc = (
  props?: AbstractDoc1.AbstractDocProps & ChildrenProp
) => AbstractDoc1.create(props, props && (props.children as any)) as any;
export const Section = (props?: Section1.SectionProps & ChildrenProp) =>
  Section1.create(props, props && (props.children as any)) as any;
export const Group = (props: Group1.GroupProps & ChildrenProp) =>
  Group1.create(props, props && (props.children as any)) as any;
export const Paragraph = (props: Paragraph1.ParagraphProps & ChildrenProp) =>
  Paragraph1.create(props, props && (props.children as any)) as any;
export const Table = (props: Table1.TableProps & ChildrenProp) =>
  Table1.create(props, props && (props.children as any)) as any;
export const TableRow = (props: TableRow1.TableRowProps & ChildrenProp) =>
  TableRow1.create(props, props && (props.children as any)) as any;
export const TableCell = (props: TableCell1.TableCellProps & ChildrenProp) =>
  TableCell1.create(props, props && (props.children as any)) as any;
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
