import { AnalysisReport } from "./analysis-report";

export class AnalysisError extends Error {
  static fromReport(report: AnalysisReport): AnalysisError {
    let message: string;
    if (report.errors.length === 1) {
      message = report.errors[0].message;
    } else {
      message = `Analysis failed (${report.errors.length} issues)`;
    }

    return new AnalysisError(message, report);
  }

  readonly report: AnalysisReport;

  constructor(message: string, report: AnalysisReport) {
    super(message);
    this.name = "AnalysisError";
    this.report = report;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AnalysisError);
    }
  }
}
