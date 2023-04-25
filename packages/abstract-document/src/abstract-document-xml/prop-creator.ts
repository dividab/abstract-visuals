import { DefaultStyles } from "../abstract-document/index.js";
import { ADCreatorFn, ADObject } from "./abstract-doc-of-xml.js";

export const propsCreators: Record<string, ADCreatorFn> = {
  styles: styles,
  columnWidths: columnWidths,
  borders: borders,
  padding: padding,
  margins: margins,
  borderColors: borderColors,
};

function styles(props: {
  readonly styles: Record<string, Record<string, string | number> & { readonly type: string }>;
}): ADObject {
  const fixedStyles: Record<string, Record<string, string | number>> = {};
  if (props.styles) {
    Object.keys(props.styles).forEach((key: string) => {
      const styleObj = props.styles[key];
      fixedStyles[((styleObj ? styleObj.type : "") + "_" + key) as string] = { ...props.styles[key] };
    });
  }

  return { ...fixedStyles, ...DefaultStyles.createStandardStyles() };
}

function columnWidths(props: { readonly columnWidths: string; readonly columnMultiplier: string }): ADObject {
  const columnWidths = props.columnWidths
    .toString()
    .split(",")
    .map((item: string) => {
      const number = Number(item);
      return number === 0 || Number.isNaN(number) ? Infinity : number;
    });
  if (props.columnMultiplier) {
    return columnWidths.map((l) => l * Number(props.columnMultiplier));
  }
  return columnWidths;
}

function borders(props: { readonly borders: string }): ADObject {
  const borders: { [k: string]: number } = { top: 0, right: 0, bottom: 0, left: 0 };
  const propBorders = props.borders.toString().split(" ");
  if (!propBorders) {
    return borders;
  }

  if (propBorders.length === 1) {
    borders.top = Number(propBorders[0]);
    borders.right = Number(propBorders[0]);
    borders.bottom = Number(propBorders[0]);
    borders.left = Number(propBorders[0]);
    return borders;
  }

  propBorders.forEach((item: string, index) => {
    switch (index) {
      case 1:
        borders.top = Number(propBorders[0]);
        borders.right = Number(item);
        borders.bottom = Number(propBorders[0]);
        borders.left = Number(item);
        break;
      case 2:
        borders.top = Number(propBorders[0]);
        borders.right = Number(propBorders[1]);
        borders.bottom = Number(item);
        borders.left = Number(propBorders[1]);
        break;
      case 3:
        borders.top = Number(propBorders[0]);
        borders.right = Number(propBorders[1]);
        borders.bottom = Number(propBorders[2]);
        borders.left = Number(item);
        break;
      default:
        break;
    }
  });
  return borders;
}

function padding(props: { readonly padding: string }): ADObject {
  const padding: { [k: string]: number } = { top: 0, right: 0, bottom: 0, left: 0 };

  const paddings = props.padding.toString().split(" ");
  if (!paddings) {
    return padding;
  }

  if (paddings.length === 1) {
    padding.top = Number(paddings[0]);
    padding.right = Number(paddings[0]);
    padding.bottom = Number(paddings[0]);
    padding.left = Number(paddings[0]);
    return padding;
  }

  paddings.forEach((item: string, index) => {
    switch (index) {
      case 1:
        padding.top = Number(paddings[0]);
        padding.right = Number(item);
        padding.bottom = Number(paddings[0]);
        padding.left = Number(item);
        break;
      case 2:
        padding.top = Number(paddings[0]);
        padding.right = Number(paddings[1]);
        padding.bottom = Number(item);
        padding.left = Number(paddings[1]);
        break;
      case 3:
        padding.top = Number(paddings[0]);
        padding.right = Number(paddings[1]);
        padding.bottom = Number(paddings[2]);
        padding.left = Number(item);
        break;
      default:
        break;
    }
  });
  return padding;
}
function margins(props: { readonly margins: string }): ADObject {
  const margins: { [k: string]: number } = { top: 0, right: 0, bottom: 0, left: 0 };
  const propMargins = props.margins.toString().split(" ");
  if (!propMargins) {
    return margins;
  }

  if (propMargins.length === 1) {
    margins.top = Number(propMargins[0]);
    margins.right = Number(propMargins[0]);
    margins.bottom = Number(propMargins[0]);
    margins.left = Number(propMargins[0]);
    return margins;
  }
  propMargins.forEach((item: string, index) => {
    switch (index) {
      case 1:
        margins.top = Number(propMargins[0]);
        margins.right = Number(item);
        margins.bottom = Number(propMargins[0]);
        margins.left = Number(item);
        break;
      case 2:
        margins.top = Number(propMargins[0]);
        margins.right = Number(propMargins[1]);
        margins.bottom = Number(item);
        margins.left = Number(propMargins[1]);
        break;
      case 3:
        margins.top = Number(propMargins[0]);
        margins.right = Number(propMargins[1]);
        margins.bottom = Number(propMargins[2]);
        margins.left = Number(item);
        break;
      default:
        break;
    }
  });
  return margins;
}
function borderColors(props: { readonly borderColors: string }): ADObject {
  const borderColors: { [k: string]: string } = { top: "", right: "", bottom: "", left: "" };
  props.borderColors.split(" ").forEach((item: string, index) => {
    switch (index) {
      case 0:
        borderColors.top = item;
        break;
      case 1:
        borderColors.right = item;
        break;
      case 2:
        borderColors.bottom = item;
        break;
      case 3:
        borderColors.left = item;
        break;
      default:
        break;
    }
  });
  return borderColors;
}
