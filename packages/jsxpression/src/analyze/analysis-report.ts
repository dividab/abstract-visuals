import type { Range } from "./utils.js";
import type { ValidationContextSnapshot } from "./validation-context.js";

type IssueSeverity = 1 | 2 | 3;

interface Issue {
  code: IssueCode;
  message: string;
  severity: IssueSeverity;
  custom: boolean;
  range: Range;
  suggestions: Array<string>;
  snapshot: ValidationContextSnapshot;
}

interface IssueDefinition {
  severity: IssueSeverity;
  custom: boolean;
}

const ISSUES_DEFINITIONS: Record<string, IssueDefinition> = {
  VARIABLE_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  IDENTIFIER_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  IMPORT_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  EXPORT_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  ASSIGNMENT_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  UPDATE_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  DELETE_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  NEW_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  THIS_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  SUPER_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  YIELD_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  AWAIT_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  ARROW_FUNCTION_BLOCK_BODY_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  FUNCTION_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  CLASS_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  TRY_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  THROW_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  WITH_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  DEBUGGER_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  COMPUTED_ACCESS_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  COMPUTED_PROPERTY_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  DIRECT_CALL_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  DYNAMIC_METHOD_NOT_ALLOWED: {
    severity: 3,
    custom: true,
  },
  METHOD_NOT_ALLOWED: {
    severity: 3,
    custom: false,
  },
  INVALID_DATA_ACCESS: {
    severity: 3,
    custom: false,
  },
  INVALID_PARAMETER_ACCESS: {
    severity: 3,
    custom: false,
  },
  INVALID_ELEMENT: {
    severity: 3,
    custom: false,
  },
  INVALID_ATTRIBUTE: {
    severity: 3,
    custom: false,
  },
  MISSING_REQUIRED_ATTRIBUTE: {
    severity: 3,
    custom: false,
  },
  INVALID_CHILD_ELEMENT: {
    severity: 3,
    custom: true,
  },
  MEMBER_CHAIN_TOO_DEEP: {
    severity: 2,
    custom: true,
  },
  TOO_MANY_PARAMETERS: {
    severity: 2,
    custom: false,
  },
  INSUFFICIENT_PARAMETERS: {
    severity: 2,
    custom: false,
  },
  INVALID_ATTRIBUTE_VALUE: {
    severity: 3,
    custom: false,
  },
  SELF_CLOSING_WITH_CHILDREN: {
    severity: 1,
    custom: true,
  },
  RETURN_REQUIRED: {
    severity: 3,
    custom: true,
  },
} as const;

export type IssueCode = keyof typeof ISSUES_DEFINITIONS;

export interface AnalysisReport {
  readonly issues: Array<Issue>;
  readonly errors: Array<Issue>;
  readonly warnings: Array<Issue>;
  readonly infos: Array<Issue>;
  readonly hasErrors: boolean;
  readonly hasWarnings: boolean;
  readonly hasInfos: boolean;
  addIssue: (code: IssueCode, message: string, range: Range, snapshot: ValidationContextSnapshot, suggestions?: Array<string>) => void;
  hasIssues: (minSeverity?: IssueSeverity) => boolean;
  merge: (...analysisReports: Array<AnalysisReport>) => AnalysisReport;
}

export function createAnalysisReport(): AnalysisReport {
  const issues: Array<Issue> = [];

  const self: AnalysisReport = {
    get issues(): Array<Issue> {
      return issues.slice();
    },

    get errors(): Array<Issue> {
      return issues.filter((issue) => issue.severity === 3);
    },

    get warnings(): Array<Issue> {
      return issues.filter((issue) => issue.severity === 2);
    },

    get infos(): Array<Issue> {
      return issues.filter((issue) => issue.severity === 1);
    },

    get hasErrors(): boolean {
      return self.errors.length > 0;
    },

    get hasWarnings(): boolean {
      return self.warnings.length > 0;
    },

    get hasInfos(): boolean {
      return self.infos.length > 0;
    },

    addIssue(code: IssueCode, message: string, range: Range, snapshot: ValidationContextSnapshot, suggestions: Array<string> = []): void {
      const { severity, custom } = ISSUES_DEFINITIONS[code];
      issues.push({
        code,
        message,
        range,
        snapshot,
        suggestions,
        severity,
        custom,
      });
    },

    hasIssues(minSeverity: IssueSeverity = 3): boolean {
      return issues.some((issue) => issue.severity >= minSeverity);
    },

    merge(...analysisReports: Array<AnalysisReport>): AnalysisReport {
      for (const analysisReport of analysisReports) {
        for (const issue of analysisReport.issues) {
          self.addIssue(issue.code, issue.message, issue.range, issue.snapshot, issue.suggestions);
        }
      }
      return self;
    },
  };

  return self;
}
