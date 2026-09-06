type Loc = {
  line: number;
  column: number;
};

// oxlint-disable-next-line functional/no-classes -- extends Error, which requires a class
export class ParseError extends Error {
  readonly loc?: Loc;

  constructor(message: string, loc?: Loc) {
    super(message);
    this.name = "ParseError";
    this.loc = loc;
  }
}
