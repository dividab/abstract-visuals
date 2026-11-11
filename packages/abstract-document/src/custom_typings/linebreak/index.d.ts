declare module "linebreak" {
  /** A break opportunity, at the position of the first character after the break */
  type LineBreak = { readonly position: number; readonly required: boolean };
  /** Finds the line break opportunities of a text, by the Unicode Line Breaking Algorithm (UAX #14) */
  const LineBreaker: new (text: string) => { readonly nextBreak: () => LineBreak | null };
  export default LineBreaker;
}
