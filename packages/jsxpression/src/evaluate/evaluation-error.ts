// oxlint-disable-next-line functional/no-classes -- extends Error, which requires a class
export class EvaluationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvaluationError";
  }
}
