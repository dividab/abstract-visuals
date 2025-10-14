type Loc = {
  line: number;
  column: number;
};

export class ParseError extends Error {
  readonly loc?: Loc;

  constructor(message: string, loc?: Loc) {
    super(message);
    this.name = "ParseError";
    this.loc = loc;
  }
}
