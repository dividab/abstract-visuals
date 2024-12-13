import React from "react";
import {
  AbstractDoc as AbstractDoc1,
  Section as Section1,
  Group as Group1,
  Paragraph as Paragraph1,
  Table as Table1,
  TableRow as TableRow1,
  TableCell as TableCell1,
  HyperLink as HyperLink1,
  LinkTarget as LinkTarget1,
  TocSeparator as TocSeparator1,
  Image as Image1,
  Markdown as Markdown1,
  TextField as TextField1,
  TextRun as TextRun1,
  PageBreak as PageBreak1,
  LineBreak as LineBreak1,
} from "../abstract-document/index.js";

export interface ChildrenProp {
  readonly children?: Child;
}
export type Child = React.JSX.Element | Children;
export interface Children extends ReadonlyArray<Child> {}

export const AbstractDoc = (props?: AbstractDoc1.AbstractDocProps & ChildrenProp): React.JSX.Element =>
  AbstractDoc1.create(props, props && (props.children as any)) as any;
export const Section = (props?: Section1.SectionProps & ChildrenProp): React.JSX.Element =>
  Section1.create(props, props && (props.children as any)) as any;
export const Group = (props: Group1.GroupProps & ChildrenProp): React.JSX.Element =>
  Group1.create(props, props && (props.children as any)) as any;
export const Paragraph = (props: Paragraph1.ParagraphProps & ChildrenProp): React.JSX.Element =>
  Paragraph1.create(props, props && (props.children as any)) as any;
export const Table = (props: Table1.TableProps & ChildrenProp): React.JSX.Element =>
  Table1.create(props, props && (props.children as any)) as any;
export const TableRow = (props: TableRow1.TableRowProps & ChildrenProp): React.JSX.Element =>
  TableRow1.create(props, props && (props.children as any)) as any;
export const TableCell = (props: TableCell1.TableCellProps & ChildrenProp): React.JSX.Element =>
  TableCell1.create(props, props && (props.children as any)) as any;
export const HyperLink = (props: HyperLink1.HyperLinkProps): React.JSX.Element => HyperLink1.create(props) as any;
export const LinkTarget = (props: LinkTarget1.LinkTargetProps): React.JSX.Element => LinkTarget1.create(props) as any;
export const Image = (props: Image1.ImageProps): React.JSX.Element => Image1.create(props) as any;
export const TocSeparator = (props: TocSeparator1.TocSeparatorProps): React.JSX.Element =>
  TocSeparator1.create(props) as any;
export const Markdown = (props: Markdown1.MarkdownProps): React.JSX.Element => Markdown1.create(props) as any;
export const TextField = (props: TextField1.TextFieldProps): React.JSX.Element => TextField1.create(props) as any;
export const TextRun = (props: TextRun1.TextRunProps): React.JSX.Element => TextRun1.create(props) as any;
export const PageBreak = (props: PageBreak1.PageBreakProps): React.JSX.Element => PageBreak1.create(props) as any;
export const LineBreak = (props: LineBreak1.LineBreakProps): React.JSX.Element => LineBreak1.create(props) as any;

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
    return element.props.children.flatMap((c: any) => {
      if (!c) {
        return [];
      }
      if (Array.isArray(c)) {
        return c.map(render);
      }
      return render(c);
    });
  } else {
    const elements = render(element.props.children); // Markdown returns an array of elements already
    return Array.isArray(elements) ? elements : [elements]; // so we need to test for that before we return.
  }
}
