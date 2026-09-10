import type { AnalysisReport } from "./analysis-report.js";

// oxlint-disable-next-line functional/no-classes -- extends Error, which requires a class
export class AnalysisError extends Error {
  static fromReport(report: AnalysisReport): AnalysisError {
    const errors = report.errors;
    const firstError = errors[0];
    const message = errors.length === 1 && firstError ? firstError.message : `Analysis failed (${errors.length} issues)`;

    return new AnalysisError(message, report);
  }

  readonly report: AnalysisReport;

  constructor(message: string, report: AnalysisReport) {
    super(message);
    this.name = "AnalysisError";
    this.report = report;

    const ErrorWithCapture = Error as typeof Error & { captureStackTrace?: (t: object, c: unknown) => void };
    ErrorWithCapture.captureStackTrace?.(this, AnalysisError);
  }
}
