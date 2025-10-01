import type { JSONSchema7 } from "json-schema";

export type HelperFunc = {
  readonly name: string;
  readonly description: string;
  readonly args: ReadonlyArray<HelperArg>;
  readonly returnType: JSONSchema7 | ((...args: ReadonlyArray<HelperArg>) => JSONSchema7);
  readonly function: Function;
};

type HelperArg = {
  readonly name: string;
  readonly description: string;
  readonly type: JSONSchema7;
};

// Reusable schemas
const num: JSONSchema7 = { type: "number" };
const bool: JSONSchema7 = { type: "boolean" };
const string: JSONSchema7 = { type: "string" };
const anySchema: JSONSchema7 = {}; // accepts any JSON value

const add: HelperFunc = {
  name: "add",
  description: "Adds two numbers",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: num,
  function: (a: number, b: number) => a + b,
};

const subtract: HelperFunc = {
  name: "subtract",
  description: "Subtracts b from a",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: num,
  function: (a: number, b: number) => a - b,
};

const multiply: HelperFunc = {
  name: "multiply",
  description: "Multiplies two numbers",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: num,
  function: (a: number, b: number) => a * b,
};

const divide: HelperFunc = {
  name: "divide",
  description: "Divides a by b",
  args: [
    { name: "a", description: "Dividend", type: num },
    { name: "b", description: "Divisor", type: num },
  ],
  returnType: num,
  function: (a: number, b: number) => a / b,
};

const equal: HelperFunc = {
  name: "equal",
  description: "Checks if two values are strictly equal",
  args: [
    { name: "a", description: "First value", type: anySchema },
    { name: "b", description: "Second value", type: anySchema },
  ],
  returnType: bool,
  function: (a: unknown, b: unknown) => a === b,
};

const lessThan: HelperFunc = {
  name: "lessThan",
  description: "Checks if a < b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  function: (a: number, b: number) => a < b,
};

const greaterThan: HelperFunc = {
  name: "greaterThan",
  description: "Checks if a > b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  function: (a: number, b: number) => a > b,
};

const lessThanEqual: HelperFunc = {
  name: "lessThanEqual",
  description: "Checks if a <= b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  function: (a: number, b: number) => a <= b,
};

const greaterThanEqual: HelperFunc = {
  name: "greaterThanEqual",
  description: "Checks if a >= b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  function: (a: number, b: number) => a >= b,
};

const lookup: HelperFunc = {
  name: "lookup",
  description: "Picks out a value from a map",
  args: [
    { name: "map", description: "Map", type: { type: "object", additionalProperties: {} } },
    { name: "key", description: "Key", type: string },
  ],
  returnType: (...argSchemas) => {
    const map = argSchemas[0] as any;
    return map?.additionalProperties ?? { type: "null" };
  },
  function: (obj: Record<string, JSONSchema7>, key: string) => obj[key],
};

export const helpers: ReadonlyArray<HelperFunc> = [
  add,
  subtract,
  multiply,
  divide,
  equal,
  lessThan,
  greaterThan,
  lessThanEqual,
  greaterThanEqual,
  lookup,
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
