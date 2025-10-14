import { Range } from "./utils";
import { ValidationContextSnapshot } from "./validation-context";

type IssueSeverity = 1 | 2 | 3;

interface Issue {
  code: IssueCode;
  message: string;
  severity: IssueSeverity;
  range: Range;
  suggestions: string[];
  snapshot: ValidationContextSnapshot;
}

const ISSUE_CODE_TO_ISSUE_SEVERITY_MAPPING = {
  // Errors
  VARIABLE_NOT_ALLOWED: 3,
  IDENTIFIER_NOT_ALLOWED: 3,
  IMPORT_NOT_ALLOWED: 3,
  EXPORT_NOT_ALLOWED: 3,
  ASSIGNMENT_NOT_ALLOWED: 3,
  UPDATE_NOT_ALLOWED: 3,
  DELETE_NOT_ALLOWED: 3,
  NEW_NOT_ALLOWED: 3,
  THIS_NOT_ALLOWED: 3,
  SUPER_NOT_ALLOWED: 3,
  YIELD_NOT_ALLOWED: 3,
  AWAIT_NOT_ALLOWED: 3,
  ARROW_FUNCTION_BLOCK_BODY_NOT_ALLOWED: 3,
  FUNCTION_NOT_ALLOWED: 3,
  CLASS_NOT_ALLOWED: 3,
  TRY_NOT_ALLOWED: 3,
  THROW_NOT_ALLOWED: 3,
  WITH_NOT_ALLOWED: 3,
  DEBUGGER_NOT_ALLOWED: 3,
  COMPUTED_ACCESS_NOT_ALLOWED: 3,
  COMPUTED_PROPERTY_NOT_ALLOWED: 3,
  DIRECT_CALL_NOT_ALLOWED: 3,
  DYNAMIC_METHOD_NOT_ALLOWED: 3,
  METHOD_NOT_ALLOWED: 3,
  INVALID_DATA_ACCESS: 3,
  INVALID_PARAMETER_ACCESS: 3,
  INVALID_ELEMENT: 3,
  JSX_SPREAD_NOT_ALLOWED: 3,
  INVALID_ATTRIBUTE: 3,
  MISSING_REQUIRED_ATTRIBUTE: 3,
  INVALID_CHILD_ELEMENT: 3,

  // Warnings
  MEMBER_CHAIN_TOO_DEEP: 2,
  TOO_MANY_PARAMETERS: 2,
  INSUFFICIENT_PARAMETERS: 2,
  INVALID_ATTRIBUTE_VALUE: 2,

  // Infos
  SELF_CLOSING_WITH_CHILDREN: 1,
} as const;

export type IssueCode = keyof typeof ISSUE_CODE_TO_ISSUE_SEVERITY_MAPPING;

export class AnalysisReport {
  readonly #issues: Issue[] = [];

  get issues(): Issue[] {
    return this.#issues.slice();
  }

  get errors(): Issue[] {
    return this.#issues.filter((issue) => issue.severity === 3);
  }

  get warnings(): Issue[] {
    return this.#issues.filter((issue) => issue.severity === 2);
  }

  get infos(): Issue[] {
    return this.#issues.filter((issue) => issue.severity === 1);
  }

  get hasErrors(): boolean {
    return this.errors.length > 0;
  }

  get hasWarnings(): boolean {
    return this.warnings.length > 0;
  }

  get hasInfos(): boolean {
    return this.infos.length > 0;
  }

  addIssue(
    code: IssueCode,
    message: string,
    range: Range,
    snapshot: ValidationContextSnapshot,
    suggestions: string[] = []
  ): void {
    this.#issues.push({
      code,
      message,
      range,
      snapshot,
      suggestions,
      severity: ISSUE_CODE_TO_ISSUE_SEVERITY_MAPPING[code] ?? 3,
    });
  }

  hasIssues(minSeverity: IssueSeverity = 3): boolean {
    return this.#issues.some((issue) => issue.severity >= minSeverity);
  }

  merge(...analysisReports: AnalysisReport[]): this {
    for (const analysisReport of analysisReports) {
      for (const issue of analysisReport.issues) {
        this.addIssue(issue.code, issue.message, issue.range, issue.snapshot, issue.suggestions);
      }
    }
    return this;
  }
}
