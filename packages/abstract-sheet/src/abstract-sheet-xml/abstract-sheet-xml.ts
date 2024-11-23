import {
  borderStyleRecord,
  Cell,
  ColInfo,
  ColInfos,
  Row,
  RowInfo,
  RowInfos,
  Rows,
  Sheet,
  Sheets,
  Style,
  Styles,
} from "../abstract-sheet/abstract-sheet";
import { xsd } from "../abstract-sheet/abstract-sheet-xsd";
import { parseXml, parseXsd, XmlElement } from "./mustache-xml";

export function abstractSheetXml(el: XmlElement): unknown {
  const children = Array<unknown>();
  const childElements = Array<XmlElement>();
  for (const child of el.children ?? []) {
    if (child.tagName !== undefined) {
      children.push(abstractSheetXml(child));
      childElements.push(child);
    }
  }
  switch (el.tagName) {
    case "AbstractSheet":
      let styles: Styles | undefined = undefined;
      let sheets: Sheets = [];
      childElements.forEach((childEl, i) => {
        if (childEl.tagName === "Sheets") {
          sheets = children[i] as Sheets;
        } else if (childEl.tagName === "Styles") {
          styles = children[i] as Styles;
        }
      });
      return { styles, sheets };
    case "Sheets":
      return children as Sheets;
    case "Sheet": {
      let rows: Rows = [];
      let colInfo: ColInfos | undefined = undefined;
      let rowInfo: RowInfos | undefined = undefined;
      childElements.forEach((childEl, i) => {
        if (childEl.tagName === "ColInfos") {
          colInfo = children[i] as ColInfos;
        } else if (childEl.tagName === "RowInfos") {
          rowInfo = children[i] as RowInfos;
        } else if (childEl.tagName === "Rows") {
          rows = children[i] as Rows;
        }
      });
      return {
        name: ((el.attributes as Partial<Record<keyof Sheet, unknown>>)?.name ?? "") as string,
        rows,
        colInfo,
        rowInfo,
      };
    }
    case "ColInfos":
      return children as ColInfos;
    case "ColInfo":
      return el.attributes as ColInfo;
    case "RowInfos":
      return children as RowInfos;
    case "RowInfo":
      return el.attributes as RowInfo;
    case "Rows":
      return children as Rows;
    case "Row":
      return children as Row;
    case "Cell": {
      return { ...el.attributes, styles: el.attributes.styles?.split(",") } as Cell;
    }
    case "Styles":
      return children as Styles;
    case "Style": {
      const attributes: Partial<Record<keyof Style, unknown>> = { ...el.attributes };
      if (attributes.borderStyle) {
        const border = (attributes.borderStyle as string).toString().split(" ");
        const s0 = borderStyleRecord[border[0] ?? ""];
        const s1 = borderStyleRecord[border[1] ?? ""];
        const s2 = borderStyleRecord[border[2] ?? ""];
        const s3 = borderStyleRecord[border[3] ?? ""];
        switch (border.length) {
          default:
          case 1:
            attributes.borderStyle = { top: s0, right: s0, bottom: s0, left: s0 };
            break;
          case 2:
            attributes.borderStyle = { top: s0, right: s1, bottom: s0, left: s1 };
            break;
          case 3:
            attributes.borderStyle = { top: s0, right: s1, bottom: s2, left: s1 };
            break;
          case 4:
            attributes.borderStyle = { top: s0, right: s1, bottom: s2, left: s3 };
            break;
        }
      }
      if (attributes.borderColor) {
        const border = (attributes.borderColor as string).toString().split(" ");
        const [b0, b1, b2, b3] = border;
        switch (border.length) {
          default:
          case 1:
            attributes.borderColor = { top: b0, right: b0, bottom: b0, left: b0 };
            break;
          case 2:
            attributes.borderColor = { top: b0, right: b1, bottom: b0, left: b1 };
            break;
          case 3:
            attributes.borderColor = { top: b0, right: b1, bottom: b2, left: b1 };
            break;
          case 4:
            attributes.borderColor = { top: b0, right: b1, bottom: b2, left: b3 };
            break;
        }
      }
      return attributes as Style;
    }
    default:
      throw new Error(`Could not find creator for element with name ${el.tagName}`);
  }
}

export const parsedXsd = parseXsd(xsd);
