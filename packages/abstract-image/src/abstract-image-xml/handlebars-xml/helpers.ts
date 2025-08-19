import Handlebars from "handlebars";

export function registerHelpers(): void {
  sortOnPathHelper();
  equalHelper();
  lessThanHelper();
  greaterThanHelper();
  lessThanOrEqualHelper();
  greaterThanEqualHelper();
}

function sortOnPathHelper(): void {
  Handlebars.registerHelper("sortOnPath", function (array, key) {
    const path = key.split(".");

    const extractPath = (obj: Record<string, any>, path: ReadonlyArray<string>): any => {
      const [first, ...rest] = path;
      if (first === undefined) {
        return obj;
      }
      return extractPath(obj[first], rest);
    };

    return array.toSorted(
      (a: Record<string, any>, b: Record<string, any>) => extractPath(a, path) - extractPath(b, path)
    );
  });
}

function equalHelper(): void {
  Handlebars.registerHelper("equal", function (a, b) {
    return a === b;
  });
}

function lessThanHelper(): void {
  Handlebars.registerHelper("lessThan", function (a, b) {
    return a < b;
  });
}

function greaterThanHelper(): void {
  Handlebars.registerHelper("greaterThan", function (a, b) {
    return a > b;
  });
}

function lessThanOrEqualHelper(): void {
  Handlebars.registerHelper("lessThanEqual", function (a, b) {
    return a <= b;
  });
}

function greaterThanEqualHelper(): void {
  Handlebars.registerHelper("greaterThanEqual", function (a, b) {
    return a >= b;
  });
}

