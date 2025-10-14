type Loc = {
  start: {
    line: number;
    column: number;
  };
  end: {
    line: number;
    column: number;
  };
};

export class CompilationError extends Error {
  static fromNode(message: string, node: any): CompilationError {
    const loc = node.loc
      ? {
          start: {
            line: node.loc.start.line,
            column: node.loc.start.column,
          },
          end: {
            line: node.loc.end.line,
            column: node.loc.end.column,
          },
        }
      : undefined;

    return new CompilationError(message, loc);
  }

  readonly loc?: Loc;

  constructor(message: string, loc?: Loc) {
    super(message);
    this.name = "CompilationError";
    this.loc = loc;
  }
}
