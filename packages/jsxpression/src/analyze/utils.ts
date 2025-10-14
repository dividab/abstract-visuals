export interface RangePosition {
  line: number;
  column: number;
}

export interface Range {
  start: RangePosition;
  end: RangePosition;
}

export function getNodeRange(node: any): Range {
  if (node.loc) {
    return {
      start: {
        line: node.loc.start.line - 1,
        column: node.loc.start.column,
      },
      end: {
        line: node.loc.end.line - 1,
        column: node.loc.end.column,
      },
    };
  }

  return {
    start: {
      line: 0,
      column: 0,
    },
    end: {
      line: 0,
      column: 0,
    },
  };
}

export function getElementSimilarityMatchers(invalid: string, available: string[]): SimilarityMatcher[] {
  return getSimilarityMatchers(invalid, available, "element");
}

export function getAttributeSimilarityMatchers(invalid: string, available: string[]): SimilarityMatcher[] {
  return getSimilarityMatchers(invalid, available, "attribute");
}

export function getBestSimilarityMatcherSuggestion(invalid: string, available: string[]): string | null {
  const similarityMatchers = getElementSimilarityMatchers(invalid, available);

  if (similarityMatchers.length === 0) {
    return null;
  }

  const best = similarityMatchers[0];

  if (best.confidence > 0.6) {
    return best.suggestion;
  }

  return null;
}

type SimilarityMatcherType = "element" | "attribute" | "property" | "method";

interface SimilarityMatcher {
  suggestion: string;
  confidence: number;
  type: SimilarityMatcherType;
}

function getSimilarityMatchers(invalid: string, available: string[], type: SimilarityMatcherType): SimilarityMatcher[] {
  if (available.length === 0) {
    return [];
  }

  return available
    .map((suggestion) => ({
      suggestion,
      distance: levenshteinDistance(invalid.toLowerCase(), suggestion.toLowerCase()),
      type,
    }))
    .filter((similarityMatcher) => similarityMatcher.distance <= Math.max(2, Math.floor(invalid.length * 0.4)))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 3)
    .map((similarityMatcher) => ({
      ...similarityMatcher,
      confidence: 1 - similarityMatcher.distance / Math.max(invalid.length, similarityMatcher.suggestion.length),
    }));
}

function levenshteinDistance(x: string, y: string): number {
  if (x.length === 0) {
    return y.length;
  }
  if (y.length === 0) {
    return x.length;
  }

  const matrix: number[][] = [];

  for (let i = 0; i <= y.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= x.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= y.length; i++) {
    for (let j = 1; j <= x.length; j++) {
      if (y.charAt(i - 1) === x.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
      }
    }
  }

  return matrix[y.length][x.length];
}
