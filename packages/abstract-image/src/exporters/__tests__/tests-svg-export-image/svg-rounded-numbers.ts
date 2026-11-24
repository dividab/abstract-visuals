import * as AbstractImage from "../../../index.js";
import type { ExportTestDef } from "./_export-test-def.js";

const line = AbstractImage.createLine(AbstractImage.createPoint(10 / 3, 100 / 3), AbstractImage.createPoint(40.006, -1e-9), AbstractImage.black, 1.5);
const sub = AbstractImage.createAbstractImage(AbstractImage.createPoint(0, 0), AbstractImage.createSize(10, 10), AbstractImage.white, [line]);
const image = AbstractImage.createAbstractImage(AbstractImage.createPoint(0, 0), AbstractImage.createSize(400 / 3, 50), AbstractImage.white, [
  line,
  AbstractImage.createSubImage(AbstractImage.createPoint(1 / 3, 0), AbstractImage.createSize(0.1, 0.1), sub),
]);

export const testSvgRoundedNumbers: ExportTestDef = {
  name: "svg rounded numbers, a sub image's to as many fewer decimals as it's scaled down, inside its namespace",
  abstractImage: AbstractImage.createSVG(image, { decimals: 2 }),
  expectedImage:
    '<svg xmlns="http://www.w3.org/2000/svg" class="ai-root" width="133.33px" height="50px" viewBox="0 0 133.33 50"><line x1="3.33" y1="33.33" x2="40.01" y2="0" stroke="rgb(0, 0, 0)" stroke-opacity="1" stroke-width="1.5"/><g transform="translate(0.33, 0) scale(0.01)"><svg width="10px" height="10px" viewBox="0 0 10 10"><line x1="3" y1="33" x2="40" y2="0" stroke="rgb(0, 0, 0)" stroke-opacity="1" stroke-width="2"/></svg></g></svg>',
};

export const testSvgUnroundedNumbers: ExportTestDef = {
  name: "svg numbers as they are without decimals, and no namespace for one put inside another",
  abstractImage: AbstractImage.createSVG(
    AbstractImage.createAbstractImage(AbstractImage.createPoint(0, 0), AbstractImage.createSize(10, 10), AbstractImage.white, [line]),
    { namespace: false }
  ),
  expectedImage:
    '<svg class="ai-root" width="10px" height="10px" viewBox="0 0 10 10"><line x1="3.3333333333333335" y1="33.333333333333336" x2="40.006" y2="-1e-9" stroke="rgb(0, 0, 0)" stroke-opacity="1" stroke-width="1.5"/></svg>',
};
