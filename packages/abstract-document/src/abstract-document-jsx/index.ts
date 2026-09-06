import type React from "react";
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
import type { SectionElement as SectionElement1, Atom as Atom1 } from "../abstract-document/index.js";

export interface ChildrenProp {
  readonly children?: Child;
}
export type Child = React.JSX.Element | Children;
export type Children = ReadonlyArray<Child>;

// These factories build a real AD tree, structurally incompatible with React.JSX.Element (the fake
// type this JSX pragma requires). Every cast below just bridges the two via `unknown`; there's no real type fix.
export const AbstractDoc = (props?: AbstractDoc1.AbstractDocProps & ChildrenProp): React.JSX.Element =>
  AbstractDoc1.create(props, props && (props.children as unknown as ReadonlyArray<Section1.Section>)) as unknown as React.JSX.Element;
export const Section = (props?: Section1.SectionProps & ChildrenProp): React.JSX.Element =>
  Section1.create(props, props && (props.children as unknown as ReadonlyArray<SectionElement1.SectionElement>)) as unknown as React.JSX.Element;
export const Group = (props: Group1.GroupProps & ChildrenProp): React.JSX.Element =>
  Group1.create(props, props && (props.children as unknown as ReadonlyArray<SectionElement1.SectionElement>)) as unknown as React.JSX.Element;
export const Paragraph = (props: Paragraph1.ParagraphProps & ChildrenProp): React.JSX.Element =>
  Paragraph1.create(props, props && (props.children as unknown as ReadonlyArray<Atom1.Atom>)) as unknown as React.JSX.Element;
export const Table = (props: Table1.TableProps & ChildrenProp): React.JSX.Element =>
  Table1.create(props, props && (props.children as unknown as ReadonlyArray<TableRow1.TableRow>)) as unknown as React.JSX.Element;
export const TableRow = (props: TableRow1.TableRowProps & ChildrenProp): React.JSX.Element =>
  TableRow1.create(props, props && (props.children as unknown as ReadonlyArray<TableCell1.TableCell>)) as unknown as React.JSX.Element;
export const TableCell = (props: TableCell1.TableCellProps & ChildrenProp): React.JSX.Element =>
  TableCell1.create(props, props && (props.children as unknown as ReadonlyArray<SectionElement1.SectionElement>)) as unknown as React.JSX.Element;
export const HyperLink = (props: HyperLink1.HyperLinkProps): React.JSX.Element => HyperLink1.create(props) as unknown as React.JSX.Element;
export const LinkTarget = (props: LinkTarget1.LinkTargetProps): React.JSX.Element => LinkTarget1.create(props) as unknown as React.JSX.Element;
export const Image = (props: Image1.ImageProps): React.JSX.Element => Image1.create(props) as unknown as React.JSX.Element;
export const TocSeparator = (props: TocSeparator1.TocSeparatorProps): React.JSX.Element =>
  TocSeparator1.create(props) as unknown as React.JSX.Element;
export const Markdown = (props: Markdown1.MarkdownProps): React.JSX.Element => Markdown1.create(props) as unknown as React.JSX.Element;
export const TextField = (props: TextField1.TextFieldProps): React.JSX.Element => TextField1.create(props) as unknown as React.JSX.Element;
export const TextRun = (props: TextRun1.TextRunProps): React.JSX.Element => TextRun1.create(props) as unknown as React.JSX.Element;
export const PageBreak = (props: PageBreak1.PageBreakProps): React.JSX.Element => PageBreak1.create(props) as unknown as React.JSX.Element;
export const LineBreak = (props: LineBreak1.LineBreakProps): React.JSX.Element => LineBreak1.create(props) as unknown as React.JSX.Element;

// Shape actually accessed when walking the fake element tree at runtime; `type`'s props param and
// `props` itself are a genuinely arbitrary bag of component props, not a fixed structural type.
interface FakeElement {
  readonly type: string | ((props: Record<string, unknown>) => unknown);
  readonly props?: { readonly children?: unknown; readonly [key: string]: unknown };
}

// oxlint-disable-next-line typescript/no-explicit-any -- callers assign the result to whichever AD model type they expect at that call site; narrowing this would break every caller
export function render(element: unknown): any {
  const el = element as FakeElement;
  if (typeof el.type !== "function") {
    return el;
  }
  const props = el.props ?? {};
  const children = renderChildren(el);
  return el.type({ ...props, children });
}

function renderChildren(element: FakeElement): Array<unknown> {
  if (!element.props?.children) {
    return [];
  } else if (Array.isArray(element.props.children)) {
    return element.props.children.flatMap((c: unknown) => {
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
