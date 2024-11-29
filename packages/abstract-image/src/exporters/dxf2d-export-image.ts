import * as AbstractImage from "../model/index.js";

export function dxf2dExportImage(root: AbstractImage.AbstractImage): string {
  const builder: Builder = createBuilder();
  let height: number = root.size.height;
  let layer: number = 0;

  builder.append("999\nELIGO DXF GENERATOR\n");
  builder.append("0\nSECTION\n2\nHEADER\n");
  builder.append("9\n$ACADVER\n1\nAC1009\n9\n$INSBASE\n10\n0.0\n20\n0.0\n30\n0.0\n");
  builder.append("9\n$EXTMIN\n10\n0.0\n20\n0.0\n");
  builder.append("9\n$EXTMAX\n");
  builder.append("10\n" + root.size.width.toString() + "\n");
  builder.append("20\n" + root.size.height.toString() + "\n");
  builder.append("0\nENDSEC\n");
  builder.append("0\nSECTION\n2\nENTITIES\n");

  for (let component of root.components) {
    _visit(component, builder, layer, height);
  }

  builder.append("0\nENDSEC\n0\nEOF");

  return builder.build();
}

interface Builder {
  readonly append: (addedStr: string) => void;
  readonly build: () => string;
}
function createBuilder(): Builder {
  let str = "";
  return {
    append: (addedStr: string) => {
      str += addedStr;
    },
    build: () => str,
  };
}

function _visit(
  // tslint:disable-next-line:variable-name
  c_in: AbstractImage.Component,
  builder: Builder,
  layer: number,
  height: number
): void {
  /*if (c_in.type === "") {
    let c: AbstractImage.Component = c_in;
    for (let component of c.components)
      _visit(component, builder, layer, height);
  }*/

  if (c_in.type === "group") {
    let c: AbstractImage.Group = c_in;
    for (const child of c.children) {
      _visit(child, builder, layer, height);
    }
  }

  if (c_in.type === "binaryimage") {
    //let c:BitmapImageComponent = c_in;
    //let importer = imageImporterFactory(c.format);
    //if (importer == null)
    //	return;
    //let subImage = importer(c.data);
    //_visit(subImage, builder, layer, height);
    // Cannot include bitmaps in dxf output?
    return;
  }

  if (c_in.type === "subimage") {
    throw "TODO!";
  }

  if (c_in.type === "line") {
    let c: AbstractImage.Line = c_in;
    builder.append("0\nLINE\n");
    builder.append("8\nLines\n");
    builder.append("10\n" + c.start.x.toString() + "\n");
    builder.append("20\n" + _invert(c.start.y, height).toString() + "\n");
    builder.append("30\n0.0\n");
    builder.append("11\n" + c.end.x.toString() + "\n");
    builder.append("21\n" + _invert(c.end.y, height).toString() + "\n");
    builder.append("31\n0.0\n");
  }

  if (c_in.type === "polyline") {
    let c: AbstractImage.PolyLine = c_in;
    builder.append("0\nPOLYLINE\n");
    builder.append("8\n" + layer.toString() + "\n");
    builder.append("66\n" + "1" + "\n");
    for (let point of c.points) {
      builder.append("0\nVERTEX\n");
      builder.append("8\n" + layer.toString() + "\n");
      builder.append("10\n" + point.x.toString() + "\n");
      builder.append("20\n" + _invert(point.y, height).toString() + "\n");
      builder.append("30\n0.0\n");
    }
    builder.append("0\nSEQEND\n");
    builder.append("8\n" + layer.toString() + "\n");
  }

  if (c_in.type === "text") {
    let c: AbstractImage.Text = c_in;
    let horizontalAlignment: number;
    if (c.horizontalGrowthDirection === "left") {
      horizontalAlignment = 2;
    } else if (c.horizontalGrowthDirection === "uniform") {
      horizontalAlignment = 1;
    } else {
      horizontalAlignment = 0;
    }

    let verticalAlignment: number;
    if (c.verticalGrowthDirection === "up") {
      verticalAlignment = 0;
    } else if (c.verticalGrowthDirection === "uniform") {
      verticalAlignment = 2;
    } else {
      verticalAlignment = 3;
    }

    let fontSize = c.fontSize - 2;

    builder.append("0\nTEXT\n");
    builder.append("8\nText\n");
    builder.append("10\n" + c.position.x.toString() + "\n");
    builder.append("20\n" + _invert(c.position.y, height).toString() + "\n");
    builder.append("30\n0.0\n");
    builder.append("11\n" + c.position.x.toString() + "\n");
    builder.append("21\n" + _invert(c.position.y, height).toString() + "\n");
    builder.append("31\n0.0\n");
    builder.append("40\n" + fontSize.toString() + "\n");
    builder.append("1\n" + c.text + "\n");
    builder.append("72\n" + horizontalAlignment.toString() + "\n");
    builder.append("73\n" + verticalAlignment.toString() + "\n");
  }

  if (c_in.type === "ellipse") {
    let c: AbstractImage.Ellipse = c_in;
    layer++;

    builder.append("0\nPOLYLINE\n");
    builder.append("8\n" + layer.toString() + "\n");
    builder.append("66\n" + "1" + "\n");

    let r1 = Math.abs(c.bottomRight.x - c.topLeft.x) / 2.0;
    let r2 = Math.abs(c.topLeft.y - c.bottomRight.y) / 2.0;
    const numPoints: number = 32;

    //      for (let t in Enumerable.Range(0, numPoints).Select(i => 2.0 * PI * i / numPoints))

    let mylist: Array<number> = [];
    for (let i: number = 0; i <= numPoints; i++) {
      mylist.push((2 * Math.PI * i) / numPoints);
    }

    for (let t of mylist) {
      let x = c.topLeft.x + r1 + r1 * Math.cos(t);
      let y = c.topLeft.y + r2 + r2 * Math.sin(t);
      builder.append("0\nVERTEX\n");
      builder.append("8\n" + layer.toString() + "\n");
      builder.append("10\n" + x.toString() + "\n");
      builder.append("20\n" + _invert(y, height).toString() + "\n");
      builder.append("30\n0.0\n");
    }
    builder.append("0\nSEQEND\n");
    builder.append("8\n" + layer.toString() + "\n");
  }

  if (c_in.type === "polygon") {
    let c: AbstractImage.Polygon = c_in;

    builder.append("0\nPOLYLINE\n");
    builder.append("8\n" + layer.toString() + "\n");
    builder.append("66\n" + "1" + "\n");
    //      for (let point in c.points.concat(c.points.take(1)))
    //      for (let point of concat([c.points, c.points.take(1)])) {
    for (let point of c.points.concat(c.points[0])) {
      builder.append("0\nVERTEX\n");
      builder.append("8\n" + layer.toString() + "\n");
      builder.append("10\n" + point.x.toString() + "\n");
      builder.append("20\n" + _invert(point.y, height).toString() + "\n");
      builder.append("30\n0.0\n");
    }
    builder.append("0\nSEQEND\n");
    builder.append("8\n" + layer.toString() + "\n");
  }

  if (c_in.type === "rectangle") {
    let c: AbstractImage.Rectangle = c_in;

    builder.append("0\nPOLYLINE\n");
    builder.append("8\n" + layer.toString() + "\n");
    builder.append("66\n" + "1" + "\n");
    let corners = AbstractImage.corners(c);
    //      for (let point in c.Corners().Concat(c.Corners().Take(1))) {
    //      for (let point of concat([corners, corners.take(1)])) {
    for (let point of corners.concat(corners[0])) {
      builder.append("0\nVERTEX\n");
      builder.append("8\n" + layer.toString() + "\n");
      builder.append("10\n" + point.x.toString() + "\n");
      builder.append("20\n" + _invert(point.y, height).toString() + "\n");
      builder.append("30\n0.0\n");
    }
    builder.append("0\nSEQEND\n");
    builder.append("8\n" + layer.toString() + "\n");
  }
}

function _invert(d: number, height: number): number {
  return height - d;
}

//}
