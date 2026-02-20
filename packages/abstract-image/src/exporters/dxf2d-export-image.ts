import { AbstractImage } from "../model/abstract-image.js";
import { Color } from "../model/color.js";
import { BinaryImage, Component, corners } from "../model/component.js";
import { Optional } from "../model/shared.js";
import { Size } from "../model/size.js";

export const DXF_STANDARD = "AC1015";
export const DXF_DATA_URL = "data:application/dxf,";
export const DXF_ENTITIES: string[] = [
  "3DFACE",
  "3DSOLID",
  "ACAD_PROXY_ENTITY",
  "ARC",
  "ATTDEF",
  "ATTRIB",
  "BODY",
  "CIRCLE",
  "DIMENSION",
  "ELLIPSE",
  "HATCH",
  "HELIX",
  "IMAGE",
  "INSERT",
  "LEADER",
  "LIGHT",
  "LINE",
  "LWPOLYLINE",
  "MLINE",
  "MULTILEADER",
  "MLEADERSTYLE",
  "MTEXT",
  "OLEFRAME",
  "OLE2FRAME",
  "POINT",
  "POLYLINE",
  "RAY",
  "REGION",
  "SECTION",
  "SEQEND",
  "SHAPE",
  "SOLID",
  "SPLINE",
  "SUN",
  "SURFACE",
  "TABLE",
  "TEXT",
  "TOLERANCE",
  "TRACE",
  "UNDERLAY",
  "VERTEX",
  "VIEWPORT",
  "WIPEOUT",
  "XLINE"
];

export type DxfOptions = {
  readonly imageDataByUrl: Record<string, `${typeof DXF_DATA_URL}${string}`>;
};

export type DxfSpace = "*Model_Space" | "*Paper_Space";

type DxfExtents = {
  readonly minX: number;
  readonly maxX: number;
  readonly minY: number;
  readonly maxY: number;
};

type DxfInsert = {
  readonly name: string;
  readonly blockRecordId: string;
  readonly extents: DxfExtents;
};

type BlockRecord = {
  readonly id: string;
  readonly name: string;
  readonly blockHandle: string;
};

export function dxf2dExportImage(root: AbstractImage, options?: Optional<DxfOptions>): string {

  const externalCache = new Map<string, DxfInsert>();
  const newHandle = handleGenerator();
  const modelSpaceHandle = newHandle();
  const paperSpaceHandle = newHandle();

  const opts: DxfOptions = {
    imageDataByUrl: options?.imageDataByUrl ?? {},
  };

  let dxf = "";
  let layer = 0;

  dxf += "999\nELIGO DXF GENERATOR\n";

  /* HEADER */
  dxf += "0\nSECTION\n2\nHEADER\n";
  dxf += "9\n$ACADVER\n1\n" + DXF_STANDARD + "\n";
  dxf += "9\n$DWGCODEPAGE\n3\nANSI_1252\n";
  dxf += "9\n$INSBASE\n10\n0.0\n20\n0.0\n30\n0.0\n";
  dxf += "9\n$EXTMIN\n10\n0.0\n20\n0.0\n";
  dxf += "9\n$EXTMAX\n";
  dxf += "10\n" + root.size.width.toString() + "\n";
  dxf += "20\n" + root.size.height.toString() + "\n";
  dxf += "0\nENDSEC\n";
  dxf += "0\nSECTION\n2\nCLASSES\n0\nENDSEC\n";

  let entities = "";
  let blocks = "";
  let blockRecords: Array<BlockRecord> = [];
  blocks += createSpaceBlock("*Model_Space", modelSpaceHandle, newHandle);
  blocks += createSpaceBlock("*Paper_Space", paperSpaceHandle, newHandle);
  for (const component of root.components) {
    const [newEntities, newBlocks, newBlockRecords] = componentDxf(component, layer, root.size, modelSpaceHandle, externalCache, opts, newHandle);
    entities += newEntities;
    blocks += newBlocks;
    blockRecords.push(...newBlockRecords);
  }

  /* TABLES */
  dxf += "0\nSECTION\n2\nTABLES\n";
  dxf += createBlockRecordsTable(modelSpaceHandle, paperSpaceHandle, blockRecords, newHandle);
  dxf += createAppIdTable(newHandle);
  dxf += createVPortTable(newHandle);
  dxf += createLTypeTable(newHandle);
  dxf += createLayerTable(newHandle);
  dxf += createStyleTable(newHandle);
  dxf += createDimStyleTable(newHandle);
  dxf += "0\nENDSEC\n";

  /* BLOCKS */
  dxf += "0\nSECTION\n2\nBLOCKS\n";
  dxf += blocks;
  dxf += "0\nENDSEC\n";

  /* ENTITIES */
  dxf += "0\nSECTION\n2\nENTITIES\n";
  dxf += entities;
  dxf += "0\nENDSEC\n";

  /* OBJECTS */
  const dict1Id = newHandle();
  const dict2Id = newHandle();
  dxf += "0\nSECTION\n";
  dxf += "2\nOBJECTS\n";
  dxf += "0\nDICTIONARY\n";
  dxf += "5\n" + dict1Id + "\n";
  dxf += "330\n0\n";
  dxf += "100\nAcDbDictionary\n";
  dxf += "281\n1\n";
  dxf += "3\nACAD_GROUP\n";
  dxf += "350\n" + dict2Id + "\n";
  dxf += "0\nDICTIONARY\n";
  dxf += "5\n" + dict2Id + "\n";
  dxf += "330\n" + dict1Id + "\n";
  dxf += "100\nAcDbDictionary\n";
  dxf += "281\n1\n";
  dxf += "0\nENDSEC\n";

  /* END */
  dxf += "0\nEOF";
  return dxf;
}

function componentDxf(c: Component, layer: number, size: Size, modelSpaceHandle: string, externalCache: Map<string, DxfInsert>, options: DxfOptions, newHandle: () => string): readonly [string, string, ReadonlyArray<BlockRecord>] {
  let entities = "";
  let blocks = "";
  let blockRecords: Array<BlockRecord> = [];

  if (c.type === "group") {
    for (const child of c.children) {
      const [newEntities, newBlocks, newBlockRecords] = componentDxf(child, layer, size, modelSpaceHandle, externalCache, options, newHandle);
      entities += newEntities;
      blocks += newBlocks;
      blockRecords.push(...newBlockRecords);
    }
    return [entities, blocks, blockRecords];
  }

  if (c.type == "binaryimage") {
    if (c.data.type !== "url") {
      return [entities, blocks, blockRecords];
    }
    const url = options.imageDataByUrl[c.data.url] ?? c.data.url;
    if (!url.startsWith(DXF_DATA_URL)) {
      return [entities, blocks, blockRecords];
    }

    const dxfString = url.split(DXF_DATA_URL)[1];
    if (!dxfString) {
      return [entities, blocks, blockRecords];
    }

    const version = extractStandard(dxfString);
    if (version !== DXF_STANDARD) {
      return [entities, blocks, blockRecords];
    }

    const extents = extractExtents(dxfString);
    if (!extents) {
      return [entities, blocks, blockRecords];
    }

    const scale = getScale(extents, c);
    const cachKey = `${scale.x}_${scale.y}_${dxfString}`;
    const cachedInsert = externalCache.get(cachKey);
    if (cachedInsert) {
      entities += createExternalInsert(cachedInsert, c, size, modelSpaceHandle, newHandle);
      return [entities, blocks, blockRecords];
    }

    const externalBlockRecords = extractBlockRecords(dxfString);

    // The new handle that will own the embedded block (replaces external's *Model_Space record)
    const newBlockRecordHandle = newHandle();
    const newName = `EMBEDED_IMAGE_${randomID()}_${scale.x.toString().replace(".", "_")}X${scale.y.toString().replace(".", "_")}`;

    const initOldHandlesMap = new Map<string, string>();

    for (const br of externalBlockRecords) {
      if (br.name === "*Model_Space") {
        // External model space entities become owned by our new block record
        initOldHandlesMap.set(br.id, newBlockRecordHandle);
      } else if (br.name === "*Paper_Space") {
        // Paper space is unused — remap to newBlockRecordHandle too so handles don't go unmapped
        initOldHandlesMap.set(br.id, newBlockRecordHandle);
      } else {
        // Any other named blocks inside the external DXF keep their own record
        const newId = newHandle();
        initOldHandlesMap.set(br.id, newId);
        blockRecords.push({ name: br.name, id: newId, blockHandle: "0" });
      }
    }

    // Remap all handles in both the blocks and entities sections
    const [newEntities, newBlocks] = remapHandleIds(
      scaleDxf(extractEntities(dxfString), scale.x, scale.y),
      scaleDxf(extractBlocks(dxfString, newName, `*EXT_PS_${newName}`), scale.y, scale.y),
      initOldHandlesMap,
      newHandle
    );

    if (!newEntities) {
      return [entities, blocks, blockRecords];
    }

    // Include any named sub-blocks from the external DXF (e.g. nested embedded images)
    // extractBlocks gives us all blocks; we only want the non-Model_Space/Paper_Space ones
    // plus our renamed model space block. newBlocks already has them all renamed correctly.
    blocks += stripBlocks(newBlocks, [newName, `*EXT_PS_${newName}`]);

    // Register our new block record
    const blockId = newHandle();
    blockRecords.push({
      id: newBlockRecordHandle,
      name: newName,
      blockHandle: blockId,
    });

    const newBlock =
      "0\nBLOCK\n" +
      "5\n" + blockId + "\n" +
      "330\n" + newBlockRecordHandle + "\n" +
      "100\nAcDbEntity\n" +
      "8\n0\n" +
      "100\nAcDbBlockBegin\n" +
      "2\n" + newName + "\n" +
      "70\n0\n" +
      "10\n0\n" +
      "20\n0\n" + 
      "30\n0\n" +
      "3\n" + newName + "\n" +
      "1\n\n" +
      newEntities +
      "\n" +
      "0\nENDBLK\n" +
      "5\n" + newHandle() + "\n" +
      "330\n" + newBlockRecordHandle + "\n" +
      "100\nAcDbEntity\n" +
      "8\n0\n" +
      "100\nAcDbBlockEnd\n";

    blocks += newBlock;

    // Cache and emit the INSERT
    const insert: DxfInsert = {
      blockRecordId: newBlockRecordHandle,
      name: newName,
      extents
    };
    externalCache.set(cachKey, insert);
    entities += createExternalInsert(insert, c, size, modelSpaceHandle, newHandle);

    return [entities, blocks, blockRecords];
  }

  if (c.type === "line") {
    entities += "0\nLINE\n";
    entities += "5\n" + newHandle() + "\n";
    entities += "330\n" + modelSpaceHandle + "\n";
    entities += "100\nAcDbEntity\n";
    entities += "8\nLines\n";
    entities += "60\n0\n";
    entities += "420\n" + colorToInteger(c.strokeColor) + "\n";
    entities += "100\nAcDbLine\n";
    entities += "10\n" + c.start.x.toString() + "\n";
    entities += "20\n" + invert(c.start.y, size.height).toString() + "\n";
    entities += "30\n0.0\n";
    entities += "11\n" + c.end.x.toString() + "\n";
    entities += "21\n" + invert(c.end.y, size.height).toString() + "\n";
    entities += "31\n0.0\n";
    return [entities, blocks, blockRecords];
  }

  if (c.type === "polyline") {
    const handle = newHandle();
    entities += "0\nPOLYLINE\n";
    entities += "5\n" + handle + "\n";
    entities += "330\n" + modelSpaceHandle + "\n";
    entities += "100\nAcDbEntity\n";
    entities += "8\n" + layer + "\n";
    entities += "60\n0\n";
    entities += "420\n" + colorToInteger(c.strokeColor) + "\n";
    entities += "100\nAcDb2dPolyline\n";
    entities += "66\n1\n";
    entities += "70\n0\n";
    entities += "10\n0.0\n20\n0.0\n30\n0.0\n";
    for (const point of c.points) {
      entities += "0\nVERTEX\n";
      entities += "5\n" + newHandle() + "\n";
      entities += "330\n" + handle + "\n";
      entities += "100\nAcDbEntity\n";
      entities += "8\n" + layer.toString() + "\n";
      entities += "100\nAcDb2dVertex\n";
      entities += "70\n0\n";
      entities += "10\n" + point.x.toString() + "\n";
      entities += "20\n" + invert(point.y, size.height).toString() + "\n";
      entities += "30\n0.0\n";
    }
    entities += "0\nSEQEND\n";
    entities += "5\n" + newHandle() + "\n";
    entities += "330\n" + handle + "\n";
    entities += "100\nAcDbEntity\n";
    entities += "8\n" + layer + "\n";
    return [entities, blocks, blockRecords];
  }

  if (c.type === "text") {
    const horizontalAlignment =
      c.horizontalGrowthDirection === "left" ? 2 : c.horizontalGrowthDirection === "uniform" ? 1 : 0;
    const verticalAlignment = c.verticalGrowthDirection === "up" ? 0 : c.verticalGrowthDirection === "uniform" ? 2 : 3;
    const fontSize = c.fontSize - 2;

    entities += "0\nTEXT\n";
    entities += "5\n" + newHandle() + "\n";
    entities += "330\n" + modelSpaceHandle + "\n";
    entities += "100\nAcDbEntity\n";
    entities += "8\nText\n";
    entities += "60\n0\n";
    entities += "420\n" + colorToInteger(c.textColor) + "\n";
    entities += "100\nAcDbText\n";
    entities += "10\n" + c.position.x.toString() + "\n";
    entities += "20\n" + invert(c.position.y, size.height) + "\n";
    entities += "30\n0.0\n";
    entities += "40\n" + fontSize.toString() + "\n";
    entities += "1\n" + c.text + "\n";
    entities += "7\nSTANDARD\n";
    entities += "50\n0.0\n";
    entities += "72\n" + horizontalAlignment.toString() + "\n";
    entities += "73\n" + verticalAlignment.toString() + "\n";

    if(horizontalAlignment !== 0 || verticalAlignment !== 0) {
      entities += "11\n" + c.position.x.toString() + "\n";
      entities += "21\n" + invert(c.position.y, size.height) + "\n";
      entities += "31\n0.0\n";
    }

    return [entities, blocks, blockRecords];
  }

  if (c.type === "ellipse") {
    layer++;

    const handle = newHandle();
    
    entities += "0\nPOLYLINE\n";
    entities += "5\n" + handle + "\n";
    entities += "330\n" + modelSpaceHandle + "\n";
    entities += "100\nAcDbEntity\n";
    entities += "8\n" + layer.toString() + "\n";
    entities += "60\n0\n";
    entities += "420\n" + colorToInteger(c.fillColor) + "\n";
    entities += "100\nAcDb2dPolyline\n";
    entities += "66\n1\n";
    entities += "70\n1\n";
    entities += "10\n0.0\n20\n0.0\n30\n0.0\n";

    const r1 = Math.abs(c.bottomRight.x - c.topLeft.x) / 2.0;
    const r2 = Math.abs(c.topLeft.y - c.bottomRight.y) / 2.0;
    const numPoints = 32;

    for (let i = 0; i <= numPoints; i++) {
      const t = (2 * Math.PI * i) / numPoints;
      const x = c.topLeft.x + r1 + r1 * Math.cos(t);
      const y = c.topLeft.y + r2 + r2 * Math.sin(t);
      entities += "0\nVERTEX\n";
      entities += "5\n" + newHandle() + "\n";
      entities += "330\n" + handle + "\n";
      entities += "100\nAcDbEntity\n";
      entities += "8\n" + layer.toString() + "\n";
      entities += "100\nAcDb2dVertex\n";
      entities += "70\n0\n";
      entities += "10\n" + x.toString() + "\n";
      entities += "20\n" + invert(y, size.height).toString() + "\n";
      entities += "30\n0.0\n";
    }

    entities += "0\nSEQEND\n";
    entities += "5\n" + newHandle() + "\n";
    entities += "330\n" + handle + "\n";
    entities += "100\nAcDbEntity\n";
    entities += "8\n" + layer.toString() + "\n";
    return [entities, blocks, blockRecords];
  }

  if (c.type === "polygon") {
    const handle = newHandle();

    entities += "0\nPOLYLINE\n";
    entities += "5\n" + handle + "\n";
    entities += "330\n" + modelSpaceHandle + "\n";
    entities += "100\nAcDbEntity\n";
    entities += "8\n" + layer + "\n";
    entities += "60\n0\n";
    entities += "420\n" + colorToInteger(c.fillColor) + "\n";
    entities += "100\nAcDb2dPolyline\n";
    entities += "66\n1\n";
    entities += "70\n1\n";
    entities += "10\n0.0\n20\n0.0\n30\n0.0\n";

    for (const point of c.points.concat(c.points[0])) {
      entities += "0\nVERTEX\n";
      entities += "5\n" + newHandle() + "\n";
      entities += "330\n" + handle + "\n";
      entities += "100\nAcDbEntity\n";
      entities += "8\n" + layer.toString() + "\n";
      entities += "100\nAcDb2dVertex\n";
      entities += "70\n0\n";
      entities += "10\n" + point.x.toString() + "\n";
      entities += "20\n" + invert(point.y, size.height).toString() + "\n";
      entities += "30\n0.0\n";
    }

    entities += "0\nSEQEND\n";
    entities += "5\n" + newHandle() + "\n";
    entities += "330\n" + handle + "\n";
    entities += "100\nAcDbEntity\n";
    entities += "8\n" + layer.toString() + "\n";
    return [entities, blocks, blockRecords];
  }

  if (c.type === "rectangle") {
    const cors = corners(c);
    const handle = newHandle();

    entities += "0\nPOLYLINE\n";
    entities += "5\n" + handle + "\n";
    entities += "330\n" + modelSpaceHandle + "\n";
    entities += "100\nAcDbEntity\n";
    entities += "8\n" + layer.toString() + "\n";
    entities += "60\n0\n";
    entities += "420\n" + colorToInteger(c.fillColor) + "\n";
    entities += "100\nAcDb2dPolyline\n";
    entities += "66\n1\n";
    entities += "70\n1\n";
    entities += "10\n0.0\n20\n0.0\n30\n0.0\n";

    for (const point of cors.concat(cors[0])) {
      entities += "0\nVERTEX\n";
      entities += "5\n" + newHandle() + "\n";
      entities += "330\n" + handle + "\n";
      entities += "100\nAcDbEntity\n";
      entities += "8\n" + layer.toString() + "\n";
      entities += "100\nAcDb2dVertex\n";
      entities += "70\n0\n";
      entities += "10\n" + point.x.toString() + "\n";
      entities += "20\n" + invert(point.y, size.height).toString() + "\n";
      entities += "30\n0.0\n";
    }

    entities += "0\nSEQEND\n";
    entities += "5\n" + newHandle() + "\n";
    entities += "330\n" + handle + "\n";
    entities += "100\nAcDbEntity\n";
    entities += "8\n" + layer.toString() + "\n";
    return [entities, blocks, blockRecords];
  }

  return [entities, blocks, blockRecords];
}

function invert(d: number, height: number): number {
  return height - d;
}

function stripBlocks(blocks: string, blocksToStrip: ReadonlyArray<string>): string {
  const s = new Set(blocksToStrip);
  const b = blocks.split("\n").map((v) => v.trim());
  const validBlocks: Array<string> = [];

  let currentBlock: Array<string> = [];
  let currentBlockName = undefined;
  let i = 0;
  while(i < b.length) {
    if(b[i] === "0" && b[i+1] === "BLOCK") {

      if(i !== 0) {
        if(currentBlockName && !s.has(currentBlockName)) {
          validBlocks.push(...currentBlock);
          currentBlock = [];
          currentBlockName = undefined;
        } else {
          currentBlock = [];
          currentBlockName = undefined;
        }
      }

      currentBlock.push(b[i], b[i+1]);
      i += 2;
    } else if(b[i] === "2") {
      currentBlockName = b[i+1];
      currentBlock.push(b[i]);
      i += 1;
    } else {
      currentBlock.push(b[i]);
      i++;
    }
  }

  if(currentBlockName && !s.has(currentBlockName)) {
    validBlocks.push(...currentBlock);
  }

  return validBlocks.join("\n");
}

function extractEntities(dxf: string): string | undefined {
  const startToken = "0\nSECTION\n2\nENTITIES\n";
  const endToken = "0\nENDSEC";

  const start = dxf.indexOf(startToken);
  if (start === -1) {
    return undefined;
  }

  const from = start + startToken.length;
  const end = dxf.indexOf(endToken, from);
  if (end === -1) {
    return undefined;
  }

  return dxf.slice(from, end).trim();
}

function extractBlockRecords(dxf: string): ReadonlyArray<BlockRecord> {
  return [...dxf.matchAll(/^\s*0\s*\n\s*BLOCK_RECORD[\s\S]*?\n\s*5\s*\n\s*([0-9A-Fa-f]+)[\s\S]*?\n\s*2\s*\n\s*([^\r\n]+)/gm)].map((match) => ({
    name: match[2],
    id: match[1],
    blockHandle: "0",
  }));
}

function extractBlocks(dxf: string, newModelSpace: string, newPaperSpace: string): string {
  const blockMatch = /0\s+SECTION\s+2\s+BLOCKS\s+([\s\S]*?)0\s+ENDSEC/m.exec(dxf);
  if(blockMatch === null) {
    return "";
  }

  const blocks = blockMatch[1]
    .split("\n")
    .map((v) => v.trim())
    .join("\n")
    .replaceAll("*Model_Space", newModelSpace)
    .replaceAll("*Paper_Space", newPaperSpace);

  return blocks;
}

function extractExtents(dxf: string): DxfExtents | undefined {
  const min = /\$EXTMIN\s+10\s+([-\d.]+)\s+20\s+([-\d.]+)/.exec(dxf);
  const max = /\$EXTMAX\s+10\s+([-\d.]+)\s+20\s+([-\d.]+)/.exec(dxf);

  if (!min || !max) {
    return undefined;
  }

  return { minX: Number(min[1]), minY: Number(min[2]), maxX: Number(max[1]), maxY: Number(max[2]) };
}

function extractStandard(dxf: string): string | undefined {
  const version = /\$ACADVER[\s\r\n]+1[\s\r\n]+(AC\d+)/.exec(dxf);
  return version ? version[1] : undefined;
}

function remapHandleIds(entities: string | undefined, blocks: string | undefined, initHandleMap: Map<string, string>, newHandle: () => string): [string | undefined, string] {
  if (entities === undefined || blocks === undefined) {
    return [undefined, ""];
  }

  const handleGroupCodes = new Set(["5", "330", "340", "331", "350", "360"]);
  const ents = new Set(DXF_ENTITIES);

  function collectAndRemap(src: string): string {
    const lines = src.split("\n");
    const out: string[] = [];
    let i = 0;
    let inEntityHeader = false;
    while (i < lines.length) {
      const groupCode = lines[i].trim();
      const next = (lines[i + 1] ?? "").trim();
      
      if(groupCode === "0" && ents.has(next)) {
        inEntityHeader = true;
      }

      if(groupCode === "100" && next === "AcDbEntity") {
        inEntityHeader = false;
      }

      if (inEntityHeader && (i + 1 < lines.length && handleGroupCodes.has(groupCode))) {
        const value = lines[i + 1].trim();
        if (/^[0-9A-Fa-f]+$/.test(value)) {
          if (!initHandleMap.has(value)) {
            initHandleMap.set(value, newHandle());
          }
          out.push(lines[i]);
          out.push(initHandleMap.get(value)!);
          i += 2;
          continue;
        }
      }
      out.push(lines[i]);
      i++;
    }
    return out.join("\n");
  }

  collectAndRemap(entities);
  collectAndRemap(blocks);

  return [collectAndRemap(entities), collectAndRemap(blocks)];
}

function scaleDxf(dxfString: string | undefined, sx: number, sy: number): string | undefined {
  if(!dxfString) {
    return undefined;
  }

  const xCoordinateCodes = new Set([10, 11, 12, 13, 14, 15, 16, 17, 18]);
  const yCoordinateCodes = new Set([20, 21, 22, 23, 24, 25, 26, 27, 28]);

  const lines = dxfString.split(/\r?\n/);
  const scaledLines: string[] = [];

  for (let i = 0; i < lines.length; i+=2) {
    const codeLine = lines[i];
    const valueLine = lines[i + 1];

    scaledLines.push(codeLine);
    if (valueLine === undefined) {
      continue;
    }

    const code = parseInt(codeLine.trim(), 10);
    let value = valueLine;

    if (xCoordinateCodes.has(code)) {
      const num = parseFloat(valueLine);
      if (!isNaN(num)) {
        value = (num * sx).toString();
      }
    } else if(yCoordinateCodes.has(code)) {
      const num = parseFloat(valueLine);
      if (!isNaN(num)) {
        value = (num * sy).toString();
      }
    } else if(code === 40) { //font size
      const num = parseInt(valueLine.trim(), 10);
      if (!isNaN(num)) {
        value = Math.round((num + 2) * Math.max(sx, sy)).toString();
      }
    }

    scaledLines.push(value);
  }

  return scaledLines.join("\n");
}

function getScale(extents: DxfExtents, c: BinaryImage): { readonly x: number; readonly y: number } {
  const srcW = extents.maxX - extents.minX;
  const srcH = extents.maxY - extents.minY;
  const minX = Math.min(c.topLeft.x, c.bottomRight.x);
  const maxX = Math.max(c.topLeft.x, c.bottomRight.x);
  const minY = Math.min(c.topLeft.y, c.bottomRight.y);
  const maxY = Math.max(c.topLeft.y, c.bottomRight.y);
  const targetW = maxX - minX;
  const targetH = maxY - minY;
  const sx = targetW / srcW;
  const sy = targetH / srcH;
  return {
    x: sx,
    y: sy
  }
}

function createExternalInsert(ins: DxfInsert, c: BinaryImage, size: Size, modelSpaceHandle: string, newHandle: () => string): string {
  const srcW = ins.extents.maxX - ins.extents.minX;
  const srcH = ins.extents.maxY - ins.extents.minY;

  const minX = Math.min(c.topLeft.x, c.bottomRight.x);
  const maxX = Math.max(c.topLeft.x, c.bottomRight.x);
  const minY = Math.min(c.topLeft.y, c.bottomRight.y);
  const maxY = Math.max(c.topLeft.y, c.bottomRight.y);

  const targetW = maxX - minX;
  const targetH = maxY - minY;

  const sx = targetW / srcW;
  const sy = targetH / srcH;

  const x = minX - ins.extents.minX;
  const y = invert(maxY, size.height);

  let insert = "";
  insert += "0\nINSERT\n";
  insert += "5\n" + newHandle() + "\n";
  insert += "330\n" + modelSpaceHandle + "\n";
  insert += "100\nAcDbEntity\n";
  insert += "8\n0\n";
  insert += "100\nAcDbBlockReference\n";
  insert += "2\n" + ins.name + "\n";
  insert += "10\n" + x + "\n";
  insert += "20\n" + y + "\n";
  insert += "30\n0\n";
  insert += "41\n1\n"; //eDrawings does not like nested inserts with scales..
  insert += "42\n1\n";
  insert += "43\n1\n";
  insert += "50\n0\n";
  insert += "210\n0\n";
  insert += "220\n0\n";
  insert += "230\n1\n";
  return insert;
}

function createAppIdTable(newHandle: () => string): string {
  const newId = newHandle();
  let table = "";
  table += "0\nTABLE\n";
  table += "2\nAPPID\n";
  table += "5\n" + newId + "\n";
  table += "330\n0\n";
  table += "100\nAcDbSymbolTable\n";
  table += "70\n1\n";
  table += "0\nAPPID\n";
  table += "5\n" + newHandle() + "\n";
  table += "330\n" + newId + "\n";
  table += "100\nAcDbSymbolTableRecord\n";
  table += "100\nAcDbRegAppTableRecord\n";
  table += "2\nACAD\n";
  table += "70\n0\n";
  table += "0\nENDTAB\n";
  return table;
}

function createVPortTable(newHandle: () => string): string {
  let table = "";
  table += "0\nTABLE\n";
  table += "2\nVPORT\n";
  table += "5\n" + newHandle() + "\n";
  table += "330\n0\n";
  table += "100\nAcDbSymbolTable\n";
  table += "70\n0\n";
  table += "0\nENDTAB\n";
  return table;
}

function createLTypeTable(newHandle: () => string): string {
  const rootId = newHandle();
  let table = "";
  table += "0\nTABLE\n";
  table += "2\nLTYPE\n";
  table += "5\n" + rootId + "\n";
  table += "330\n0\n";
  table += "100\nAcDbSymbolTable\n";
  table += "70\n4\n";
  table += "0\nLTYPE\n";
  table += "5\n" + newHandle() + "\n";
  table += "330\n" + rootId + "\n";
  table += "100\nAcDbSymbolTableRecord\n";
  table += "100\nAcDbLinetypeTableRecord\n";
  table += "2\nByBlock\n";
  table += "70\n0\n";
  table += "3\n\n";
  table += "72\n65\n73\n0\n40\n0\n";
  table += "0\nLTYPE\n";
  table += "5\n" + newHandle() + "\n";
  table += "330\n" + rootId + "\n";
  table += "100\nAcDbSymbolTableRecord\n";
  table += "100\nAcDbLinetypeTableRecord\n";
  table += "2\nByLayer\n";
  table += "70\n0\n";
  table += "3\n\n";
  table += "72\n65\n73\n0\n40\n0\n";
  table += "0\nLTYPE\n";
  table += "5\n" + newHandle() + "\n";
  table += "330\n" + rootId + "\n";
  table += "100\nAcDbSymbolTableRecord\n";
  table += "100\nAcDbLinetypeTableRecord\n";
  table += "2\nContinuous\n";
  table += "70\n0\n";
  table += "3\nSolid line\n";
  table += "72\n65\n73\n0\n40\n0\n";
  table += "0\nENDTAB\n";
  return table;
}

function createLayerTable(newHandle: () => string): string {

  const layers = ["0", "1", "A3D", "Lines", "Text"];
  const layerId = newHandle();

  let table = "";
  table += "0\nTABLE\n";
  table += "2\nLAYER\n";
  table += "5\n" + layerId + "\n";
  table += "330\n0\n";
  table += "100\nAcDbSymbolTable\n";
  table += "70\n" + layers.length.toString() + "\n";

  for(const layer of layers) {
    table += "0\nLAYER\n";
    table += "5\n" + newHandle() + "\n";
    table += "330\n" + layerId + "\n";
    table += "100\nAcDbSymbolTableRecord\n";
    table += "100\nAcDbLayerTableRecord\n";
    table += "2\n" + layer + "\n";
    table += "70\n0\n62\n7\n";
    table += "6\nCONTINUOUS\n";
    table += "370\n-3\n";
    table += "390\nF\n"; //???
  }

  table += "0\nENDTAB\n";
  return table;
}

function createStyleTable(newHandle: () => string): string {
  const rootId = newHandle();
  let table = "";
  table += "0\nTABLE\n";
  table += "2\nSTYLE\n";
  table += "5\n" + rootId + "\n";
  table += "330\n0\n";
  table += "100\nAcDbSymbolTable\n";
  table += "70\n3\n";
  table += "0\nSTYLE\n";
  table += "5\n" + newHandle() + "\n";
  table += "330\n" + rootId + "\n";
  table += "100\nAcDbSymbolTableRecord\n";
  table += "100\nAcDbTextStyleTableRecord\n";
  table += "2\nStandard\n";
  table += "70\n0\n";
  table += "40\n0\n";
  table += "41\n1\n";
  table += "50\n0\n";
  table += "71\n0\n";
  table += "42\n1\n";
  table += "3\n";
  table += "txt\n";
  table += "4\n\n";
  table += "0\nENDTAB\n";
  return table;
}

function createDimStyleTable(newHandle: () => string): string {
  const rootId = newHandle();
  let table = "";
  table += "0\nTABLE\n";
  table += "2\nDIMSTYLE\n";
  table += "5\n" + rootId + "\n";
  table += "330\n0\n";
  table += "100\nAcDbSymbolTable\n";
  table += "70\n1\n";
  table += "100\nAcDbDimStyleTable\n";
  table += "71\n1\n";
  table += "0\nDIMSTYLE\n";
  table += "105\n46\n";
  table += "330\n" + rootId + "\n";
  table += "100\nAcDbSymbolTableRecord\n";
  table += "100\nAcDbDimStyleTableRecord\n";
  table += "2\nStandard\n";
  table += "70\n0\n";
  table += "40\n1\n";
  table += "41\n0.18\n";
  table += "42\n0.0625\n";
  table += "43\n0.38\n";
  table += "44\n0.18\n";
  table += "45\n0\n";
  table += "46\n0\n";
  table += "47\n0\n";
  table += "48\n0\n";
  table += "140\n0.18\n";
  table += "141\n0.09\n";
  table += "142\n0\n";
  table += "143\n25.4\n";
  table += "144\n1\n";
  table += "145\n0\n";
  table += "146\n1\n";
  table += "147\n0.09\n";
  table += "148\n0\n";
  table += "71\n0\n";
  table += "72\n0\n";
  table += "73\n0\n";
  table += "74\n1\n";
  table += "75\n0\n";
  table += "76\n0\n";
  table += "77\n0\n";
  table += "78\n0\n";
  table += "79\n0\n";
  table += "170\n0\n";
  table += "171\n2\n";
  table += "172\n0\n";
  table += "173\n0\n";
  table += "174\n0\n";
  table += "175\n0\n";
  table += "176\n0\n";
  table += "177\n0\n";
  table += "178\n0\n";
  table += "179\n0\n";
  table += "271\n4\n";
  table += "272\n4\n";
  table += "273\n2\n";
  table += "274\n2\n";
  table += "275\n0\n";
  table += "276\n0\n";
  table += "277\n2\n";
  table += "278\n46\n";
  table += "279\n0\n";
  table += "280\n0\n";
  table += "281\n0\n";
  table += "282\n0\n";
  table += "283\n1\n";
  table += "284\n0\n";
  table += "285\n0\n";
  table += "286\n0\n";
  table += "288\n0\n";
  table += "289\n3\n";
  table += "341\n\n";
  table += "371\n-2\n";
  table += "372\n-2\n";
  table += "0\nENDTAB\n";
  return table;
}

function createBlockRecordsTable(modelSpaceHandle: string, paperSpaceHandle: string, blockRecords: ReadonlyArray<BlockRecord>, newHandle: () => string): string {
  const br: ReadonlyArray<BlockRecord> = [
    { id: modelSpaceHandle, name: "*Model_Space", blockHandle: "0" },
    { id: paperSpaceHandle, name: "*Paper_Space", blockHandle: "0" },
    ...blockRecords
  ];

  const blockRecordsHandle = newHandle();

  let table = "";
  table += "0\nTABLE\n";
  table += "2\nBLOCK_RECORD\n";
  table += "5\n" + blockRecordsHandle + "\n";
  table += "330\n0\n";
  table += "100\nAcDbSymbolTable\n";
  table += "70\n" + br.length.toString() + "\n";

  for(const record of br) {
    table += "0\nBLOCK_RECORD\n";
    table += "5\n" + record.id + "\n";
    table += "330\n" + blockRecordsHandle + "\n";
    table += "100\nAcDbSymbolTableRecord\n";
    table += "100\nAcDbBlockTableRecord\n";
    table += "2\n" + record.name + "\n";
    table += "70\n0\n";
    table += "280\n1\n";
    table += "281\n0\n";
  }

  table += "0\nENDTAB\n";
  return table;
}

function createSpaceBlock(type: DxfSpace, ownerHandle: string, newHandle: () => string): string {
  let block = "";
  block += "0\nBLOCK\n";
  block += "5\n" + newHandle() + "\n";
  block += "330\n" + ownerHandle + "\n";
  block += type === "*Paper_Space" ? "67\n1\n" : "";
  block += "100\nAcDbEntity\n";
  block += "8\n0\n";
  block += "100\nAcDbBlockBegin\n";
  block += "2\n" + type + "\n";
  block += "70\n0\n";
  block += "10\n0.0\n20\n0.0\n30\n0.0\n";
  block += "3\n" + type + "\n";
  block += "1\n\n";
  block += "0\nENDBLK\n";
  block += "5\n" + newHandle() + "\n";
  block += "330\n" + ownerHandle + "\n";
  block += "100\nAcDbEntity\n";
  block += type === "*Paper_Space" ? "67\n1\n" : "";
  block += "8\n0\n";
  block += "100\nAcDbBlockEnd\n";
  return block;
}

function handleGenerator(): () => string {
  let index = 0xFF;
  return () => (index++).toString(16).toUpperCase();
}

function randomID(): string {
  return "xxxxxxxxxxxxxxx".replaceAll("x", () => (Math.round(Math.random() * 16)).toString(16)).toLocaleUpperCase();
}

function colorToInteger(color: Color): number {
  return (color.r << 16) + (color.g << 8) + color.b;
}