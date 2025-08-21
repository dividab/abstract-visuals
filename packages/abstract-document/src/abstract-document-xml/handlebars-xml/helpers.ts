import Handlebars from "handlebars";
// import moment from "moment";

export function registerHelpers(): void {
  // sortOnPathHelper();
  equalHelper();
  lessThanHelper();
  greaterThanHelper();
  lessThanOrEqualHelper();
  greaterThanEqualHelper();
  add();
  subtract();
  multiply();
  divide();
  // formatDateHelper();
  // currentDateHelper();
}

type Func = {
  readonly name: string;
  readonly description: string;
  readonly args: ReadonlyArray<Arg>;
  readonly returnType: string; // JSONSchema;
};

type Arg = {
  readonly name: string;
  readonly description: string;
  readonly type: string; // JSONSchema;
};

// function sortOnPathHelper(): void {
//   Handlebars.registerHelper("sortOnPath", function (array, key) {
//     const path = key.split(".");

//     const extractPath = (obj: Record<string, any>, path: ReadonlyArray<string>): any => {
//       const [first, ...rest] = path;
//       if (first === undefined) {
//         return obj;
//       }
//       return extractPath(obj[first], rest);
//     };

//     return array.toSorted(
//       (a: Record<string, any>, b: Record<string, any>) => extractPath(a, path) - extractPath(b, path)
//     );
//   });
// }

function add(): void {
  Handlebars.registerHelper("add", function (a, b) {
    return a + b;
  });
}

function subtract(): void {
  Handlebars.registerHelper("subtract", function (a, b) {
    return a - b;
  });
}

function multiply(): void {
  Handlebars.registerHelper("multiply", function (a, b) {
    return a * b;
  });
}

function divide(): void {
  Handlebars.registerHelper("divide", function (a, b) {
    return a / b;
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

// function formatDateHelper(): void {
//   Handlebars.registerHelper("formatDate", function (date, format) {
//     return moment(date).format(format);
//   });
// }

// function currentDateHelper(): void {
//   Handlebars.registerHelper("currentDate", function (format) {
//     return moment().format(format);
//   });
// }
