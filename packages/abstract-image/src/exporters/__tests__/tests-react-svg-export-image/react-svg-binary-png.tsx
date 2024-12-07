import React from "react";
import { ExportTestDef } from "./_export-test-def.js";
import * as AbstractImage from "../../../index.js";

const pngEncoded =
  "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";

const binaryImage = AbstractImage.createBinaryImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createPoint(400, 400),
  "png",
  { type: "bytes", bytes: Buffer.from(pngEncoded, "base64") }
);
const abstractImage = AbstractImage.createAbstractImage(
  AbstractImage.createPoint(0, 0),
  AbstractImage.createSize(400, 400),
  AbstractImage.white,
  [binaryImage]
);

const svg = <AbstractImage.ReactSvg image={abstractImage} />;

export const testReactSvgBinaryPng: ExportTestDef = {
  name: "react svg binary png",
  abstractImage: svg,
  expectedSerializedJsx:
    '{"key":null,"props":{"image":{"topLeft":{"x":0,"y":0},"size":{"width":400,"height":400},"backgroundColor":{"a":255,"r":255,"g":255,"b":255},"components":[{"type":"binaryimage","topLeft":{"x":0,"y":0},"bottomRight":{"x":400,"y":400},"format":"png","data":{"type":"bytes","bytes":{"type":"Buffer","data":[137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,200,0,0,0,150,8,2,0,0,0,20,190,80,78,0,0,0,1,115,82,71,66,0,174,206,28,233,0,0,0,4,103,65,77,65,0,0,177,143,11,252,97,5,0,0,0,9,112,72,89,115,0,0,14,195,0,0,14,195,1,199,111,168,100,0,0,12,26,73,68,65,84,120,94,237,157,63,79,219,92,27,135,121,95,197,150,91,67,148,208,200,5,41,18,138,26,117,232,140,191,1,82,17,83,55,198,172,48,188,11,98,99,102,171,88,58,148,149,145,173,83,69,165,124,131,100,238,80,165,138,144,34,65,163,244,73,148,39,110,45,219,195,107,39,46,141,227,219,177,143,237,67,156,240,187,20,233,113,120,168,9,246,197,125,223,231,143,207,249,207,207,114,117,13,128,180,249,175,251,95,0,82,5,98,1,46,64,44,192,5,136,5,184,0,177,0,23,32,22,224,2,196,2,92,128,88,128,11,16,11,112,1,98,1,46,64,44,192,5,136,5,184,0,177,0,23,32,22,224,2,196,2,92,128,88,128,11,16,11,112,1,98,1,46,64,44,192,5,136,5,184,0,177,0,23,32,22,224,2,196,2,92,128,88,128,11,16,11,112,1,79,66,135,97,153,117,93,251,108,142,190,154,107,13,67,119,191,56,70,21,165,181,53,241,205,115,241,64,146,247,114,130,251,85,48,38,53,177,234,253,206,161,230,185,238,4,162,164,218,119,66,16,15,54,34,221,137,246,168,123,60,24,54,220,119,127,16,165,90,254,229,133,20,225,70,234,221,253,222,212,63,23,243,231,155,202,81,206,125,23,134,89,31,245,223,251,127,122,48,170,152,63,221,44,194,176,9,41,137,165,119,95,244,134,238,113,84,36,85,46,126,44,202,21,247,173,15,107,176,127,223,11,186,175,106,97,231,102,61,228,22,214,251,173,67,205,61,158,80,43,85,47,236,40,19,70,91,239,30,79,27,201,130,42,151,62,22,11,129,191,212,147,97,129,53,150,222,208,238,118,59,157,75,203,125,63,139,101,204,185,181,141,193,143,192,127,152,8,243,178,219,218,141,107,149,77,67,235,29,143,76,247,205,19,102,225,197,187,126,118,223,57,9,75,161,20,250,217,191,222,112,148,28,75,59,233,220,158,25,238,187,216,52,204,196,167,88,126,178,208,42,212,175,122,221,186,123,204,130,214,79,53,104,105,39,247,119,87,238,177,15,187,62,43,109,55,183,170,118,229,240,240,106,110,237,92,151,74,53,167,132,7,179,112,20,203,46,131,166,111,195,79,251,54,20,242,170,251,63,103,24,30,246,99,132,159,20,131,150,157,1,3,172,18,243,215,182,79,138,114,36,201,21,111,225,95,201,9,123,82,225,66,41,255,44,239,52,75,121,85,116,191,14,108,30,49,98,217,183,97,93,185,41,111,215,220,247,94,52,45,60,104,57,141,74,47,218,93,172,52,58,75,123,244,131,206,128,242,118,83,81,246,194,27,146,66,69,82,110,148,170,163,151,253,23,37,64,177,5,164,66,249,98,171,68,197,45,163,21,154,215,132,245,119,190,91,118,53,28,180,221,195,216,104,31,6,148,158,98,169,57,167,209,74,225,232,85,174,134,54,87,159,2,139,168,177,114,178,223,15,59,175,125,11,47,152,132,163,124,222,61,124,192,232,125,72,22,180,218,163,62,149,4,243,215,10,122,13,226,179,144,226,93,168,82,127,210,95,173,8,173,116,169,120,158,114,208,50,191,252,34,196,84,11,197,61,247,16,196,97,33,98,37,129,14,90,241,187,142,44,237,19,81,93,229,79,145,206,146,177,16,177,204,22,165,193,155,208,193,16,211,116,34,147,36,251,203,255,198,160,31,167,195,194,233,100,31,17,125,161,178,140,112,149,144,133,136,101,124,35,130,132,244,58,234,40,158,252,191,130,191,235,104,248,62,86,208,250,110,18,121,176,246,76,118,143,64,92,22,32,86,64,177,44,86,163,138,181,86,89,127,233,175,180,98,13,242,144,177,51,186,226,32,144,71,23,203,26,28,147,109,123,182,236,67,85,90,113,250,75,201,216,25,160,184,222,125,209,105,133,191,186,177,70,17,86,142,199,19,171,109,153,245,126,231,5,61,97,65,58,223,96,204,62,84,243,48,237,65,30,15,109,43,218,8,160,17,51,41,175,24,28,197,106,12,110,167,255,148,119,239,111,131,38,108,169,133,151,145,167,73,61,144,70,208,178,204,175,238,209,20,162,248,202,61,242,64,86,99,36,24,132,182,89,72,241,238,65,149,183,99,118,85,211,65,43,241,32,143,97,124,119,143,60,188,18,48,216,204,192,130,197,114,230,235,21,99,55,193,200,160,197,210,95,154,19,222,184,71,225,84,114,196,112,1,8,98,97,98,169,114,233,122,43,241,176,26,25,180,146,14,242,4,140,90,74,138,103,178,198,228,69,143,123,130,71,21,75,82,69,169,38,151,206,75,59,205,114,245,166,88,136,48,107,32,148,132,65,75,124,77,132,161,40,163,150,32,4,142,98,205,206,199,42,151,111,148,242,69,177,112,36,9,105,14,238,74,202,181,63,151,70,13,90,9,70,45,193,92,22,95,188,39,103,111,131,200,71,118,208,90,139,80,110,239,61,35,2,94,227,151,150,120,42,206,83,103,21,196,90,203,21,78,137,160,53,250,28,37,238,228,68,162,72,74,60,21,7,172,132,88,116,208,210,175,66,159,115,180,161,39,135,165,50,127,240,73,179,34,98,209,65,43,18,116,249,159,104,42,14,88,29,177,2,42,173,72,144,125,22,227,145,131,125,184,21,151,213,17,43,81,208,218,164,165,116,220,234,15,234,232,125,96,103,133,196,74,18,180,114,133,155,18,149,16,109,183,180,222,225,125,107,191,219,189,212,205,246,148,97,109,75,187,236,119,230,44,2,240,196,89,41,177,18,4,45,167,63,172,73,204,31,116,105,24,195,179,222,237,238,253,244,152,250,221,153,166,195,170,32,86,75,44,59,104,21,3,158,91,140,64,101,189,60,121,48,48,33,120,174,208,102,213,196,114,158,91,12,72,106,81,112,30,12,220,218,174,37,18,67,122,23,101,137,165,85,39,37,177,114,242,204,18,6,170,152,79,122,125,37,251,156,238,225,24,169,246,60,218,227,163,118,82,179,3,207,172,28,82,173,176,19,101,13,35,251,119,185,80,170,77,71,47,182,121,50,246,175,60,30,6,45,179,207,45,91,65,176,162,95,8,109,93,251,242,91,251,228,204,221,211,27,158,9,124,146,227,174,32,190,19,228,170,36,98,189,181,25,32,22,224,194,234,213,88,32,19,64,44,192,5,136,5,184,0,177,0,23,32,22,224,2,196,2,92,128,88,128,11,16,11,112,1,98,1,46,64,44,192,5,136,5,184,0,177,0,23,32,22,224,2,196,2,92,128,88,128,11,16,11,112,1,98,1,46,64,44,192,5,136,5,184,0,177,0,23,32,22,224,2,196,2,92,128,88,128,11,16,11,112,1,98,1,46,64,44,192,5,136,5,184,0,177,0,23,176,40,200,130,176,204,186,174,125,54,71,95,205,181,134,225,89,54,92,117,150,79,18,223,60,23,15,36,121,121,23,177,73,73,44,75,59,249,167,127,53,117,129,156,245,177,54,21,114,165,168,246,168,123,60,24,18,139,44,138,146,42,20,63,22,163,45,130,229,165,173,15,142,135,61,239,50,67,46,206,6,99,76,91,65,89,131,147,127,122,87,254,83,137,249,243,128,223,136,5,179,62,234,191,39,127,253,0,236,43,121,186,89,156,99,88,189,223,9,218,8,114,46,210,249,22,199,165,188,82,18,75,239,190,232,13,221,227,63,208,119,212,26,132,44,8,43,150,154,74,129,205,45,234,167,79,83,43,85,35,45,185,54,166,222,111,29,6,109,166,25,227,179,77,209,214,187,199,61,6,165,166,81,229,210,199,34,245,163,67,175,103,48,76,151,133,149,71,175,177,44,35,228,42,48,175,220,111,94,14,231,89,101,195,178,233,146,246,121,206,22,173,198,232,75,204,165,185,205,203,110,107,55,174,85,54,13,45,224,178,132,94,207,5,145,197,226,157,109,143,36,189,127,150,226,78,185,186,70,237,176,255,128,254,73,103,223,82,192,174,19,58,183,201,63,228,114,237,8,156,201,86,33,75,96,168,255,14,9,87,76,132,158,141,125,99,48,237,228,254,46,80,86,103,217,210,237,230,214,244,230,123,213,230,214,206,117,169,196,186,2,42,59,210,107,158,107,165,102,65,172,124,109,118,113,246,232,129,193,151,185,236,22,128,123,20,131,185,121,112,2,91,54,180,51,96,128,85,98,254,218,246,73,81,142,36,185,226,189,193,149,156,176,39,21,46,148,242,207,242,14,181,74,111,56,190,157,34,201,23,223,69,120,51,17,177,14,124,155,6,54,6,253,186,123,56,143,246,168,63,115,219,212,231,235,209,183,121,158,129,56,155,236,95,246,157,33,27,182,71,63,232,12,40,111,55,21,37,194,6,179,130,179,60,184,82,157,172,62,191,92,203,199,103,35,21,74,178,111,213,255,225,231,240,22,180,249,229,215,204,55,229,79,227,111,50,237,63,155,244,110,163,232,223,116,46,162,244,118,252,251,48,160,126,7,187,105,201,216,165,226,232,85,78,188,127,246,227,146,145,26,75,62,240,109,85,114,245,59,44,45,89,218,167,153,120,32,203,123,238,17,59,254,179,137,235,111,115,194,219,231,254,90,39,138,244,68,252,27,147,191,78,208,97,177,68,100,165,120,39,182,208,213,180,249,129,161,173,143,102,90,218,181,103,177,119,210,33,206,166,142,247,43,168,72,235,254,162,45,92,122,34,254,57,168,133,98,124,245,151,138,172,136,197,158,13,253,137,38,127,16,191,33,69,229,193,201,206,26,228,22,172,97,210,19,241,207,33,73,166,94,50,50,35,22,107,54,244,119,56,165,159,7,39,71,113,178,161,63,254,57,36,249,132,203,70,118,196,34,179,97,255,50,160,109,239,239,112,226,145,7,39,196,200,134,223,77,194,187,36,159,112,233,200,144,88,84,54,12,106,219,251,59,156,146,228,65,127,86,245,238,224,197,156,13,205,22,241,169,249,118,72,78,211,24,220,62,236,171,72,190,78,230,134,219,84,200,146,88,84,54,36,123,186,137,14,167,36,69,177,63,171,254,205,131,19,232,108,248,62,112,76,211,248,70,20,88,98,149,20,75,239,206,220,117,250,213,237,70,235,227,136,4,203,224,105,76,50,37,22,181,247,46,209,211,29,92,104,199,194,159,85,167,243,224,4,50,27,178,15,239,16,180,45,194,65,2,99,142,199,89,36,91,98,81,73,199,151,13,231,21,218,49,240,103,85,74,83,50,27,6,13,239,88,230,87,247,104,10,81,124,229,30,121,32,171,49,18,12,66,39,129,72,58,51,61,221,243,11,109,102,194,243,224,4,50,27,178,76,118,48,140,239,238,145,135,87,66,252,218,48,54,111,248,79,76,205,154,88,100,210,153,110,219,135,21,218,140,68,201,131,19,24,178,97,78,136,62,94,89,201,249,35,97,82,66,7,161,249,205,239,123,32,115,98,145,73,231,111,219,62,106,128,137,72,180,60,56,129,41,27,18,24,45,242,59,37,101,230,174,59,175,45,95,173,185,108,100,79,44,50,233,252,105,219,71,15,48,81,32,134,243,230,105,26,61,27,138,175,137,48,164,127,139,170,224,42,144,65,177,130,179,161,53,120,31,61,192,132,67,13,231,25,189,221,153,118,254,212,107,151,154,173,64,77,118,16,170,212,135,122,132,70,126,118,200,162,88,116,54,28,14,234,254,113,18,185,24,127,182,26,61,156,23,3,98,120,135,24,69,72,169,123,98,89,200,164,88,100,210,49,122,135,190,128,145,238,48,78,108,136,225,157,156,72,20,73,70,239,3,17,242,86,147,108,138,69,55,193,124,164,59,157,33,1,254,225,29,178,210,31,199,221,39,18,180,50,42,86,208,141,241,144,238,116,134,68,248,179,161,112,148,39,178,33,251,195,109,203,74,86,197,162,155,96,30,210,206,131,249,235,153,54,127,192,171,89,32,62,24,145,13,165,226,57,245,183,209,24,220,238,63,1,183,50,43,86,104,54,76,59,15,70,142,127,244,7,35,38,59,8,71,155,116,119,148,227,86,127,80,95,233,222,135,236,138,21,146,13,147,228,65,234,25,87,134,103,96,232,15,70,13,18,231,10,55,37,42,33,218,110,105,189,195,251,214,126,183,123,169,155,237,41,195,218,150,118,217,239,196,126,106,126,66,232,180,153,241,171,19,52,215,45,21,50,44,86,80,153,226,32,157,111,196,207,131,212,83,169,76,253,97,116,154,166,123,19,36,133,76,157,19,26,198,240,172,119,187,123,255,247,126,239,222,223,157,105,122,90,205,213,185,176,12,116,178,147,101,177,236,187,226,159,250,55,38,229,97,28,230,19,210,217,48,96,120,167,178,94,158,60,24,152,16,60,87,152,34,196,212,63,155,148,167,51,196,56,33,157,13,3,99,128,243,96,224,214,118,45,145,24,1,49,149,236,48,203,0,41,137,149,147,103,214,26,112,214,199,10,184,16,222,239,148,84,153,158,168,52,97,111,195,119,63,196,249,207,186,216,46,122,159,178,159,249,36,190,59,161,138,37,246,135,103,132,183,121,127,16,146,230,77,71,201,201,23,74,181,233,232,197,214,232,176,175,228,121,105,167,25,244,68,124,174,112,42,179,157,240,15,137,102,133,132,130,21,253,22,67,91,215,190,252,214,62,57,115,247,116,239,122,113,146,179,88,131,32,190,19,228,170,36,62,249,21,253,0,240,146,241,26,11,44,43,16,11,112,1,98,1,46,64,44,192,5,136,5,184,0,177,0,23,32,22,224,2,196,2,92,128,88,128,11,16,11,112,1,98,1,46,64,44,192,5,136,5,184,0,177,0,23,32,22,224,2,196,2,92,128,88,128,11,16,11,112,1,98,1,46,64,44,192,5,136,5,184,0,177,0,23,32,22,224,2,196,2,28,88,91,251,63,69,12,57,131,88,144,189,44,0,0,0,0,73,69,78,68,174,66,96,130]}}}]}},"_owner":null,"_store":{}}',
};
