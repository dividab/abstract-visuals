import type { JSONSchema7 } from "json-schema";

type Func = {
  readonly name: string;
  readonly description: string;
  readonly args: ReadonlyArray<Arg>;
  readonly returnType: JSONSchema7;
  readonly function: Function;
};

type Arg = {
  readonly name: string;
  readonly description: string;
  readonly type: JSONSchema7;
};

// Reusable schemas
const num: JSONSchema7 = { type: "number" };
const bool: JSONSchema7 = { type: "boolean" };
const anySchema: JSONSchema7 = {}; // accepts any JSON value

const add: Func = {
  name: "add",
  description: "Adds two numbers",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: num,
  function: (a: number, b: number) => a + b,
};

const subtract: Func = {
  name: "subtract",
  description: "Subtracts b from a",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: num,
  function: (a: number, b: number) => a - b,
};

const multiply: Func = {
  name: "multiply",
  description: "Multiplies two numbers",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: num,
  function: (a: number, b: number) => a * b,
};

const divide: Func = {
  name: "divide",
  description: "Divides a by b",
  args: [
    { name: "a", description: "Dividend", type: num },
    { name: "b", description: "Divisor", type: num },
  ],
  returnType: num,
  function: (a: number, b: number) => a / b,
};

const equal: Func = {
  name: "equal",
  description: "Checks if two values are strictly equal",
  args: [
    { name: "a", description: "First value", type: anySchema },
    { name: "b", description: "Second value", type: anySchema },
  ],
  returnType: bool,
  function: (a: unknown, b: unknown) => a === b,
};

const lessThan: Func = {
  name: "lessThan",
  description: "Checks if a < b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  function: (a: number, b: number) => a < b,
};

const greaterThan: Func = {
  name: "greaterThan",
  description: "Checks if a > b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  function: (a: number, b: number) => a > b,
};

const lessThanEqual: Func = {
  name: "lessThanEqual",
  description: "Checks if a <= b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  function: (a: number, b: number) => a <= b,
};

const greaterThanEqual: Func = {
  name: "greaterThanEqual",
  description: "Checks if a >= b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  function: (a: number, b: number) => a >= b,
};

export const helpers: ReadonlyArray<Func> = [
  add,
  subtract,
  multiply,
  divide,
  equal,
  lessThan,
  greaterThan,
  lessThanEqual,
  greaterThanEqual,
];

// -- Diffucult to validate and give completion

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

// -- Should date functions be included?

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
