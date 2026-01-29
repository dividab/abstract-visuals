import type { JSONSchema7 } from "json-schema";

export type HelperFunc = {
  readonly name: string;
  readonly description: string;
  readonly args: ReadonlyArray<HelperArg>;
  readonly returnType: JSONSchema7 | ((...args: ReadonlyArray<JSONSchema7>) => JSONSchema7);
  readonly func: Function;
};

type HelperArg = {
  readonly name: string;
  readonly description: string;
  readonly type: JSONSchema7;
};

//reusable schemas
const num: JSONSchema7 = { type: "number" };
const bool: JSONSchema7 = { type: "boolean" };
const string: JSONSchema7 = { type: "string" };
const stringOrNum: JSONSchema7 = { type: ["string", "number"] };
const nullSchema: JSONSchema7 = { type: "null" };
const arraySchema: JSONSchema7 = { type: "array", items: {} };
const anySchema: JSONSchema7 = {}; // accepts any JSON value

const and: HelperFunc = {
  name: "and",
  description: "Logical AND",
  args: [
    { name: "a", description: "Any value", type: anySchema },
    { name: "b", description: "Any value", type: anySchema },
  ],
  returnType: bool,
  func: (a: any, b: any): boolean => a && b,
};

const or: HelperFunc = {
  name: "or",
  description: "Logical OR",
  args: [
    { name: "a", description: "Any value", type: anySchema },
    { name: "b", description: "Any value", type: anySchema },
  ],
  returnType: bool,
  func: (a: any, b: any): boolean => a || b,
};

const not: HelperFunc = {
  name: "not",
  description: "Logical NOT",
  args: [{ name: "v", description: "Any value", type: anySchema }],
  returnType: bool,
  func: (v: any): boolean => !v,
};

const add: HelperFunc = {
  name: "add",
  description: "Adds two numbers",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: num,
  func: (a: number, b: number) => a + b,
};

const subtract: HelperFunc = {
  name: "subtract",
  description: "Subtracts b from a",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: num,
  func: (a: number, b: number) => a - b,
};

const multiply: HelperFunc = {
  name: "multiply",
  description: "Multiplies two numbers",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: num,
  func: (a: number, b: number) => a * b,
};

const divide: HelperFunc = {
  name: "divide",
  description: "Divides a by b",
  args: [
    { name: "a", description: "Dividend", type: num },
    { name: "b", description: "Divisor", type: num },
  ],
  returnType: num,
  func: (a: number, b: number) => a / b,
};

const equal: HelperFunc = {
  name: "equal",
  description: "Checks if two values are strictly equal",
  args: [
    { name: "a", description: "First value", type: anySchema },
    { name: "b", description: "Second value", type: anySchema },
  ],
  returnType: bool,
  func: (a: unknown, b: unknown) => a === b,
};

const lessThan: HelperFunc = {
  name: "lessThan",
  description: "Checks if a < b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  func: (a: number, b: number) => a < b,
};

const greaterThan: HelperFunc = {
  name: "greaterThan",
  description: "Checks if a > b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  func: (a: number, b: number) => a > b,
};

const lessThanEqual: HelperFunc = {
  name: "lessThanEqual",
  description: "Checks if a <= b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  func: (a: number, b: number) => a <= b,
};

const greaterThanEqual: HelperFunc = {
  name: "greaterThanEqual",
  description: "Checks if a >= b",
  args: [
    { name: "a", description: "First number", type: num },
    { name: "b", description: "Second number", type: num },
  ],
  returnType: bool,
  func: (a: number, b: number) => a >= b,
};

const lookup: HelperFunc = {
  name: "lookup",
  description: "Picks out a value from a map",
  args: [
    { name: "map", description: "Map", type: { type: "object", additionalProperties: {} } },
    { name: "key", description: "Key", type: string },
  ],
  returnType: (...argSchemas) => {
    const map = argSchemas[0];
    const additionalProperties = map?.additionalProperties ?? nullSchema;
    return typeof additionalProperties === "object" ? additionalProperties : nullSchema;
  },
  func: (obj: Record<string, JSONSchema7>, key: string) => obj[key],
};

const groupByKey: HelperFunc = {
  name: "groupByKey",
  description: "Groups an array of objects or arrays by a specified key or index (can be a path)",
  args: [
    {
      name: "items",
      description: "Array of items to be grouped",
      type: arraySchema,
    },
    { name: "key", description: "Key or index to group by (can be a path)", type: stringOrNum },
  ],
  returnType: (...argSchemas) => ({
    type: "object",
    additionalProperties: {
      type: "array",
      items: argSchemas[0]?.type === "array" ? argSchemas[0].items ?? {} : {},
    },
  }),
  func: (items: ReadonlyArray<any>, key: string | number) =>
    items.reduce((result: Record<string, Array<any>>, item) => {
      const groupKey = (typeof key === "number" ? item[key] : extractStringPath(item, key))?.toString();
      if (groupKey === undefined) {
        return result;
      }
      if (result[groupKey]) {
        result[groupKey].push(item);
      } else {
        result[groupKey] = [item];
      }
      return result;
    }, {}),
};

const sortBy: HelperFunc = {
  name: "sortBy",
  description: "Sorts an array of objects by the value at the specifed JSON path",
  args: [
    {
      name: "items",
      description: "Array of items to be sorted",
      type: arraySchema,
    },
    {
      name: "path",
      description: 'JSON path where the value is located, example: "data.value.name"',
      type: string,
    },
    {
      name: "order",
      description: "Sort order",
      type: {
        enum: ["asc", "desc"],
      },
    },
  ],
  returnType: (...argSchemas) => (argSchemas[0]?.type === "array" ? argSchemas[0] : arraySchema),
  func: (items: ReadonlyArray<any>, path: string, order: "asc" | "desc") => {
    const compare = (a: any, b: any): number => {
      if (a === null || b === null || a === undefined || b === undefined) {
        if ((a === null || a === undefined) && (b === null || b === undefined)) {
          return 0;
        } else {
          return a === null || a === undefined ? -1 : 1;
        }
      } else if (typeof a === "number" && typeof b === "number") {
        return a - b;
      } else if (typeof a === "string" && typeof b === "string") {
        return a.localeCompare(b);
      } else {
        return 0;
      }
    };
    return [...items].sort((a, b) =>
      order === "desc"
        ? compare(extractStringPath(b, path), extractStringPath(a, path))
        : compare(extractStringPath(a, path), extractStringPath(b, path))
    );
  },
};

const arrayLength: HelperFunc = {
  name: "arrayLength",
  description: "Returns the item count of an array",
  args: [
    {
      name: "array",
      type: arraySchema,
      description: "The array to get the length from",
    },
  ],
  returnType: num,
  func: (arr: ReadonlyArray<unknown>) => (Array.isArray(arr.length) ? arr.length : 0),
};

const round: HelperFunc = {
  name: "round",
  description: "Rounds a number to the desired decimal points",
  args: [
    {
      name: "number",
      type: num,
      description: "The number to round",
    },
    {
      name: "decimals",
      type: num,
      description: "The decimal count to round to",
    },
  ],
  returnType: num,
  func: (n: number, d: number) => Math.round(n * 10 ** d) / 10 ** d,
};

export const helpers: ReadonlyArray<HelperFunc> = [
  and,
  or,
  not,
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
  groupByKey,
  sortBy,
  arrayLength,
  round,
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

function extractStringPath(obj: Record<string, any>, path: string): any {
  return extractArrayPath(obj, path.split("."));
}

function extractArrayPath(obj: Record<string, any>, path: ReadonlyArray<string>): any {
  const [first, ...rest] = path;
  if (first === undefined) {
    return obj;
  } else if (typeof obj !== "object" || obj == null) {
    return undefined;
  } else {
    return extractArrayPath(obj[first], rest);
  }
}
