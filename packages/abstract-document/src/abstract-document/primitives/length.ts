export function fromTwips(twips: number): number {
  return twips / 20;
}

export function fromInch(inch: number): number {
  return inch * 72;
}

export function fromMillimeters(millimeters: number): number {
  return millimeters * 2.83464567;
}
