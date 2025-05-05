import {
  borderStyleRecord,
  Cell,
  ColInfo,
  ColInfos,
  Cells,
  RowInfo,
  RowInfos,
  Sheet,
  Style,
  Styles,
  AbstractSheet,
} from "../abstract-sheet/abstract-sheet.js";
import { xsd } from "../abstract-sheet/abstract-sheet-xsd.js";
import { parseHandlebarsXml, parseXsd, TemplateMethod, XmlElement } from "./handlebars-xml/index.js";

export const abstractSheetXml = (template: string, data: any, partials: Record<string, string>): AbstractSheet =>
  abstractSheetOfXml(parseHandlebarsXml(template, data, partials, TemplateMethod.Mustache)[0]!) as AbstractSheet;

export function abstractSheetOfXml(el: XmlElement): unknown {
  const children = Array<unknown>();
  const childElements = Array<XmlElement>();
  for (const child of el.children ?? []) {
    if (child.tagName !== undefined) {
      children.push(abstractSheetOfXml(child));
      childElements.push(child);
    }
  }

  switch (el.tagName) {
    case "AbstractSheet":
      let styles: Styles | undefined = undefined;
      const sheets: Array<Sheet> = [];
      childElements.forEach((childEl, i) => {
        if (childEl.tagName === "Sheet") {
          sheets.push(children[i] as Sheet);
        } else if (childEl.tagName === "Styles") {
          styles = children[i] as Styles;
        }
      });
      return { styles, sheets } satisfies AbstractSheet;
    case "Sheet": {
      const cells: Array<Cells> = [];
      let colInfo: ColInfos | undefined = undefined;
      let rowInfo: RowInfos | undefined = undefined;
      childElements.forEach((childEl, i) => {
        if (childEl.tagName === "ColInfos") {
          colInfo = children[i] as ColInfos;
        } else if (childEl.tagName === "RowInfos") {
          rowInfo = children[i] as RowInfos;
        } else if (childEl.tagName === "Cells") {
          cells.push(children[i] as Cells);
        }
      });
      return {
        name: ((el.attributes as Partial<Record<keyof Sheet, unknown>>)?.name ?? "") as string,
        cells,
        colInfo,
        rowInfo,
        direction: ((el.attributes as Partial<Record<keyof Sheet, unknown>>)?.direction ?? "") as Sheet["direction"],
      } satisfies Sheet;
    }
    case "ColInfos":
      return children as ColInfos;
    case "ColInfo":
      return el.attributes as ColInfo;
    case "RowInfos":
      return children as RowInfos;
    case "RowInfo":
      return el.attributes as RowInfo;
    case "Cells":
      return children as Cells;
    case "Cell": {
      const styles = el.attributes.styles?.split(",");
      if (el.attributes.number !== undefined) {
        return { ...el.attributes, type: "number", value: el.attributes.number, styles } as Cell;
      } else if (el.attributes.bool !== undefined) {
        return { ...el.attributes, type: "boolean", value: el.attributes.boolean, styles } as Cell;
      } else if (el.attributes.date !== undefined) {
        return { ...el.attributes, type: "date", value: el.attributes.date, styles } as Cell;
      } else {
        return { ...el.attributes, type: "string", value: el.attributes.text, styles } as Cell;
      }
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
