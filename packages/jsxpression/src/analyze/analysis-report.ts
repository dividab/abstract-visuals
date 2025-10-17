import { Range } from "./utils";
import { ValidationContextSnapshot } from "./validation-context";

type IssueSeverity = 1 | 2 | 3;

interface Issue {
  code: IssueCode;
  message: string;
  severity: IssueSeverity;
  runtimeOnly: boolean;
  range: Range;
  suggestions: string[];
  snapshot: ValidationContextSnapshot;
}

interface IssueDefinition {
  severity: IssueSeverity;
  runtimeOnly: boolean;
}

const ISSUES_DEFINITIONS: Record<string, IssueDefinition> = {
  VARIABLE_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  IDENTIFIER_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  IMPORT_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  EXPORT_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  ASSIGNMENT_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  UPDATE_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  DELETE_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  NEW_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  THIS_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  SUPER_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  YIELD_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  AWAIT_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  ARROW_FUNCTION_BLOCK_BODY_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  FUNCTION_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  CLASS_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  TRY_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  THROW_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  WITH_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  DEBUGGER_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  COMPUTED_ACCESS_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  COMPUTED_PROPERTY_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  DIRECT_CALL_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  DYNAMIC_METHOD_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  JSX_SPREAD_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: true,
  },
  METHOD_NOT_ALLOWED: {
    severity: 3,
    runtimeOnly: false,
  },
  INVALID_DATA_ACCESS: {
    severity: 3,
    runtimeOnly: false,
  },
  INVALID_PARAMETER_ACCESS: {
    severity: 3,
    runtimeOnly: false,
  },
  INVALID_ELEMENT: {
    severity: 3,
    runtimeOnly: false,
  },
  INVALID_ATTRIBUTE: {
    severity: 3,
    runtimeOnly: false,
  },
  MISSING_REQUIRED_ATTRIBUTE: {
    severity: 3,
    runtimeOnly: false,
  },
  INVALID_CHILD_ELEMENT: {
    severity: 3,
    runtimeOnly: true,
  },
  MEMBER_CHAIN_TOO_DEEP: {
    severity: 2,
    runtimeOnly: true,
  },
  TOO_MANY_PARAMETERS: {
    severity: 2,
    runtimeOnly: false,
  },
  INSUFFICIENT_PARAMETERS: {
    severity: 2,
    runtimeOnly: false,
  },
  INVALID_ATTRIBUTE_VALUE: {
    severity: 3,
    runtimeOnly: false,
  },
  SELF_CLOSING_WITH_CHILDREN: {
    severity: 1,
    runtimeOnly: true,
  },
} as const;

export type IssueCode = keyof typeof ISSUES_DEFINITIONS;

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

  get runtimeOnlyIssues(): Issue[] {
    return this.#issues.filter((issue) => issue.runtimeOnly);
  }

  addIssue(
    code: IssueCode,
    message: string,
    range: Range,
    snapshot: ValidationContextSnapshot,
    suggestions: string[] = []
  ): void {
    const { severity, runtimeOnly } = ISSUES_DEFINITIONS[code];
    this.#issues.push({
      code,
      message,
      range,
      snapshot,
      suggestions,
      severity,
      runtimeOnly,
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
