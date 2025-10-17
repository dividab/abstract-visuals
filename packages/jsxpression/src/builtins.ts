export interface BuiltinCallbackParamSchema {
  name: string;
  type: string;
}

interface BuiltinParamBaseSchema {
  name: string;
  description?: string;
  required?: boolean;
  variadic?: boolean;
}

export interface BuiltinPrimitiveParamSchema extends BuiltinParamBaseSchema {
  kind: "primitive";
  types: string[];
}

export interface BuiltinFunctionParamSchema extends BuiltinParamBaseSchema {
  kind: "function";
  signature: {
    params: BuiltinCallbackParamSchema[];
    returnType: string;
  };
}

export type BuiltinParamSchema = BuiltinPrimitiveParamSchema | BuiltinFunctionParamSchema;

export interface BuiltinMethodSchema {
  params: BuiltinParamSchema[];
  returnType: string;
  description?: string;
}

export interface BuiltinPropertySchema {
  type: string;
  description?: string;
  readonly?: boolean;
}

export interface BuiltinSchema {
  methods?: Record<string, BuiltinMethodSchema>;
  properties?: Record<string, BuiltinPropertySchema>;
  global: boolean;
  intrinsic?: boolean;
  generic?: string; // Generic type parameters, e.g., "<T>" or "<K, V>"
}

const MATH = "Math";
const NUMBER = "Number";
const NUMBER_PROTOTYPE = "Number.prototype";
const ARRAY = "Array";
const ARRAY_PROTOTYPE = "Array.prototype";
const STRING_PROTOTYPE = "String.prototype";

const BUILTINS: Record<string, BuiltinSchema> = {
  [MATH]: {
    global: true,
    intrinsic: false,
    properties: {
      PI: {
        type: "number",
        readonly: true,
        description: "The mathematical constant π (pi), approximately 3.14159",
      },
      E: {
        type: "number",
        readonly: true,
        description: "Euler's number, the base of natural logarithms, approximately 2.71828",
      },
    },
    methods: {
      max: {
        description: "Returns the larger of a set of supplied numeric expressions",
        params: [
          {
            kind: "primitive" as const,
            name: "values",
            types: ["number"],
            description: "Numeric expressions to be evaluated",
            variadic: true,
          },
        ],
        returnType: "number",
      },
      min: {
        description: "Returns the smaller of a set of supplied numeric expressions",
        params: [
          {
            kind: "primitive" as const,
            name: "values",
            types: ["number"],
            description: "Numeric expressions to be evaluated",
            variadic: true,
          },
        ],
        returnType: "number",
      },
      floor: {
        description: "Returns the largest integer less than or equal to a number",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["number"],
            description: "A numeric expression",
            required: true,
          },
        ],
        returnType: "number",
      },
      ceil: {
        description: "Returns the smallest integer greater than or equal to a number",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["number"],
            description: "A numeric expression",
            required: true,
          },
        ],
        returnType: "number",
      },
      round: {
        description: "Returns a supplied numeric expression rounded to the nearest integer",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["number"],
            description: "The value to be rounded to the nearest integer",
            required: true,
          },
        ],
        returnType: "number",
      },
      abs: {
        description: "Returns the absolute value of a number",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["number"],
            description: "A numeric expression for which the absolute value is needed",
            required: true,
          },
        ],
        returnType: "number",
      },
      sqrt: {
        description: "Returns the square root of a number",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["number"],
            description: "A numeric expression",
            required: true,
          },
        ],
        returnType: "number",
      },
      pow: {
        description: "Returns the value of a base expression taken to a specified power",
        params: [
          {
            kind: "primitive" as const,
            name: "base",
            types: ["number"],
            description: "The base value of the expression",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "exponent",
            types: ["number"],
            description: "The exponent value of the expression",
            required: true,
          },
        ],
        returnType: "number",
      },
      sign: {
        description: "Returns the sign of a number, indicating whether the number is positive, negative, or zero",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["number"],
            description: "A numeric expression",
            required: true,
          },
        ],
        returnType: "number",
      },
      sin: {
        description: "Returns the sine of a number",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["number"],
            description: "A numeric expression that contains an angle measured in radians",
            required: true,
          },
        ],
        returnType: "number",
      },
      cos: {
        description: "Returns the cosine of a number",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["number"],
            description: "A numeric expression that contains an angle measured in radians",
            required: true,
          },
        ],
        returnType: "number",
      },
      atan2: {
        description: "Returns the angle in radians between the positive x-axis and the point (x, y)",
        params: [
          {
            kind: "primitive" as const,
            name: "y",
            types: ["number"],
            description: "The y coordinate of the point",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "x",
            types: ["number"],
            description: "The x coordinate of the point",
            required: true,
          },
        ],
        returnType: "number",
      },
    },
  },

  [NUMBER]: {
    global: true,
    intrinsic: false,
    methods: {
      isNaN: {
        description: "Determines whether the passed value is NaN (Not-A-Number)",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["any"],
            description: "The value to be tested for NaN",
            required: true,
          },
        ],
        returnType: "boolean",
      },
      isFinite: {
        description: "Determines whether the passed value is a finite number",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["any"],
            description: "The value to be tested for finiteness",
            required: true,
          },
        ],
        returnType: "boolean",
      },
      parseInt: {
        description: "Parses a string argument and returns an integer of the specified radix",
        params: [
          {
            kind: "primitive" as const,
            name: "string",
            types: ["string"],
            description: "The value to parse",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "radix",
            types: ["number"],
            description: "An integer between 2 and 36 that represents the radix of the string. Defaults to 10",
            required: false,
          },
        ],
        returnType: "number",
      },
      parseFloat: {
        description: "Parses a string argument and returns a floating point number",
        params: [
          {
            kind: "primitive" as const,
            name: "string",
            types: ["string"],
            description: "The value to parse",
            required: true,
          },
        ],
        returnType: "number",
      },
    },
  },

  [NUMBER_PROTOTYPE]: {
    global: false,
    intrinsic: true,
    methods: {
      toFixed: {
        description: "Returns a string representation of a number in fixed-point notation",
        params: [
          {
            kind: "primitive" as const,
            name: "fractionDigits",
            types: ["number"],
            description: "Number of digits after the decimal point. Must be in the range 0 - 20",
            required: false,
          },
        ],
        returnType: "string",
      },
      toPrecision: {
        description:
          "Returns a string representation of a number in fixed-point or exponential notation with a specified number of significant digits",
        params: [
          {
            kind: "primitive" as const,
            name: "precision",
            types: ["number"],
            description: "Number of significant digits. Must be in the range 1 - 21",
            required: false,
          },
        ],
        returnType: "string",
      },
      toExponential: {
        description: "Returns a string representation of a number in exponential notation",
        params: [
          {
            kind: "primitive" as const,
            name: "fractionDigits",
            types: ["number"],
            description: "Number of digits after the decimal point. Must be in the range 0 - 20",
            required: false,
          },
        ],
        returnType: "string",
      },
    },
  },

  [ARRAY]: {
    global: true,
    intrinsic: false,
    methods: {
      isArray: {
        description: "Determines whether the passed value is an Array",
        params: [
          {
            kind: "primitive" as const,
            name: "value",
            types: ["any"],
            description: "The value to be checked",
            required: true,
          },
        ],
        returnType: "boolean",
      },
    },
  },

  [ARRAY_PROTOTYPE]: {
    global: false,
    intrinsic: true,
    generic: "<T>",
    methods: {
      map: {
        description:
          "Calls a defined callback function on each element of an array, and returns an array that contains the results",
        params: [
          {
            kind: "function" as const,
            name: "callback",
            description:
              "A function that accepts up to three arguments. The map method calls the callback function one time for each element in the array",
            required: true,
            signature: {
              params: [
                { name: "value", type: "T" },
                { name: "index", type: "number" },
                { name: "array", type: "T[]" },
              ],
              returnType: "U",
            },
          },
          {
            kind: "primitive" as const,
            name: "thisArg",
            types: ["any"],
            description: "An object to which the this keyword can refer in the callback function",
            required: false,
          },
        ],
        returnType: "U[]",
      },
      filter: {
        description: "Returns the elements of an array that meet the condition specified in a callback function",
        params: [
          {
            kind: "function" as const,
            name: "callback",
            description:
              "A function that accepts up to three arguments. The filter method calls the callback function one time for each element in the array",
            required: true,
            signature: {
              params: [
                { name: "value", type: "T" },
                { name: "index", type: "number" },
                { name: "array", type: "T[]" },
              ],
              returnType: "boolean",
            },
          },
          {
            kind: "primitive" as const,
            name: "thisArg",
            types: ["any"],
            description: "An object to which the this keyword can refer in the callback function",
            required: false,
          },
        ],
        returnType: "T[]",
      },
      reduce: {
        description:
          "Calls the specified callback function for all the elements in an array. The return value of the callback function is the accumulated result, and is provided as an argument in the next call to the callback function",
        params: [
          {
            kind: "function" as const,
            name: "callback",
            description:
              "A function that accepts up to four arguments. The reduce method calls the callback function one time for each element in the array",
            required: true,
            signature: {
              params: [
                { name: "previousValue", type: "U" },
                { name: "currentValue", type: "T" },
                { name: "currentIndex", type: "number" },
                { name: "array", type: "T[]" },
              ],
              returnType: "U",
            },
          },
          {
            kind: "primitive" as const,
            name: "initialValue",
            types: ["any"],
            description: "If initialValue is specified, it is used as the initial value to start the accumulation",
            required: false,
          },
        ],
        returnType: "U",
      },
      find: {
        description:
          "Returns the value of the first element in the array where predicate is true, and undefined otherwise",
        params: [
          {
            kind: "function" as const,
            name: "callback",
            description:
              "A function that accepts up to three arguments. The find method calls the callback function one time for each element in the array, in ascending order, until it finds one where callback returns true",
            required: true,
            signature: {
              params: [
                { name: "value", type: "T" },
                { name: "index", type: "number" },
                { name: "array", type: "T[]" },
              ],
              returnType: "boolean",
            },
          },
          {
            kind: "primitive" as const,
            name: "thisArg",
            types: ["any"],
            description: "An object to which the this keyword can refer in the callback function",
            required: false,
          },
        ],
        returnType: "T | undefined",
      },
      some: {
        description: "Determines whether the specified callback function returns true for any element of an array",
        params: [
          {
            kind: "function" as const,
            name: "callback",
            description:
              "A function that accepts up to three arguments. The some method calls the callback function for each element in the array until the callback returns true, or until the end of the array",
            required: true,
            signature: {
              params: [
                { name: "value", type: "T" },
                { name: "index", type: "number" },
                { name: "array", type: "T[]" },
              ],
              returnType: "boolean",
            },
          },
          {
            kind: "primitive" as const,
            name: "thisArg",
            types: ["any"],
            description: "An object to which the this keyword can refer in the callback function",
            required: false,
          },
        ],
        returnType: "boolean",
      },
      every: {
        description: "Determines whether all the members of an array satisfy the specified test",
        params: [
          {
            kind: "function" as const,
            name: "callback",
            description:
              "A function that accepts up to three arguments. The every method calls the callback function for each element in the array until the callback returns false, or until the end of the array",
            required: true,
            signature: {
              params: [
                { name: "value", type: "T" },
                { name: "index", type: "number" },
                { name: "array", type: "T[]" },
              ],
              returnType: "boolean",
            },
          },
          {
            kind: "primitive" as const,
            name: "thisArg",
            types: ["any"],
            description: "An object to which the this keyword can refer in the callback function",
            required: false,
          },
        ],
        returnType: "boolean",
      },
      slice: {
        description:
          "Returns a copy of a section of an array. For both start and end, a negative index can be used to indicate an offset from the end of the array",
        params: [
          {
            kind: "primitive" as const,
            name: "start",
            types: ["number"],
            description: "The beginning index of the specified portion of the array",
            required: false,
          },
          {
            kind: "primitive" as const,
            name: "end",
            types: ["number"],
            description:
              "The end index of the specified portion of the array. This is exclusive of the element at the index 'end'",
            required: false,
          },
        ],
        returnType: "T[]",
      },
      includes: {
        description: "Determines whether an array includes a certain element, returning true or false as appropriate",
        params: [
          {
            kind: "primitive" as const,
            name: "searchElement",
            types: ["T"],
            description: "The value to locate in the array",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "fromIndex",
            types: ["number"],
            description:
              "The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0",
            required: false,
          },
        ],
        returnType: "boolean",
      },
      indexOf: {
        description: "Returns the index of the first occurrence of a value in an array, or -1 if it is not present",
        params: [
          {
            kind: "primitive" as const,
            name: "searchElement",
            types: ["T"],
            description: "The value to locate in the array",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "fromIndex",
            types: ["number"],
            description:
              "The array index at which to begin the search. If fromIndex is omitted, the search starts at index 0",
            required: false,
          },
        ],
        returnType: "number",
      },
      join: {
        description: "Adds all the elements of an array into a string, separated by the specified separator string",
        params: [
          {
            kind: "primitive" as const,
            name: "separator",
            types: ["string"],
            description:
              "A string used to separate one element of the array from the next in the resulting string. If omitted, the array elements are separated with a comma",
            required: false,
          },
        ],
        returnType: "string",
      },
      at: {
        description: "Returns the item located at the specified index",
        params: [
          {
            kind: "primitive" as const,
            name: "index",
            types: ["number"],
            description:
              "The zero-based index of the desired code unit. A negative index will count back from the last item",
            required: true,
          },
        ],
        returnType: "T | undefined",
      },
      concat: {
        description: "Combines two or more arrays into a single array",
        params: [
          {
            kind: "primitive" as const,
            name: "arrays",
            types: ["T[]"],
            description: "Additional arrays to add to the end of the array",
            variadic: true,
          },
        ],
        returnType: "T[]",
      },
      findIndex: {
        description: "Returns the index of the first element in the array where predicate is true, and -1 otherwise",
        params: [
          {
            kind: "function" as const,
            name: "callback",
            description:
              "A function that accepts up to three arguments. The findIndex method calls the callback function one time for each element in the array until it finds one where callback returns true",
            required: true,
            signature: {
              params: [
                { name: "value", type: "T" },
                { name: "index", type: "number" },
                { name: "array", type: "T[]" },
              ],
              returnType: "boolean",
            },
          },
          {
            kind: "primitive" as const,
            name: "thisArg",
            types: ["any"],
            description: "An object to which the this keyword can refer in the callback function",
            required: false,
          },
        ],
        returnType: "number",
      },
      flat: {
        description:
          "Returns a new array with all sub-array elements concatenated into it recursively up to the specified depth",
        params: [
          {
            kind: "primitive" as const,
            name: "depth",
            types: ["number"],
            description: "The maximum recursion depth. Defaults to 1",
            required: false,
          },
        ],
        returnType: "T[]",
      },
      flatMap: {
        description:
          "Calls a defined callback function on each element of an array, then flattens the result into a new array",
        params: [
          {
            kind: "function" as const,
            name: "callback",
            description:
              "A function that accepts up to three arguments. The flatMap method calls the callback function one time for each element in the array",
            required: true,
            signature: {
              params: [
                { name: "value", type: "T" },
                { name: "index", type: "number" },
                { name: "array", type: "T[]" },
              ],
              returnType: "U",
            },
          },
          {
            kind: "primitive" as const,
            name: "thisArg",
            types: ["any"],
            description: "An object to which the this keyword can refer in the callback function",
            required: false,
          },
        ],
        returnType: "U[]",
      },
    },
    properties: {
      length: {
        type: "number",
        readonly: true,
        description: "Gets the length of the array. This is a number one higher than the highest index in the array",
      },
    },
  },

  [STRING_PROTOTYPE]: {
    global: false,
    intrinsic: true,
    methods: {
      charAt: {
        description: "Returns the character at the specified index",
        params: [
          {
            kind: "primitive" as const,
            name: "index",
            types: ["number"],
            description: "The zero-based index of the desired character",
            required: true,
          },
        ],
        returnType: "string",
      },
      charCodeAt: {
        description: "Returns the Unicode value of the character at the specified location",
        params: [
          {
            kind: "primitive" as const,
            name: "index",
            types: ["number"],
            description:
              "The zero-based index of the desired character. If there is no character at the specified index, NaN is returned",
            required: true,
          },
        ],
        returnType: "number",
      },
      concat: {
        description: "Returns a string that contains the concatenation of two or more strings",
        params: [
          {
            kind: "primitive" as const,
            name: "strings",
            types: ["string"],
            description: "The strings to append to the end of the string",
            variadic: true,
          },
        ],
        returnType: "string",
      },
      endsWith: {
        description:
          "Returns true if the sequence of elements of searchString converted to a String is the same as the corresponding elements of this object (converted to a String) starting at endPosition – length(this). Otherwise returns false",
        params: [
          {
            kind: "primitive" as const,
            name: "searchString",
            types: ["string"],
            description: "The characters to be searched for at the end of this string",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "length",
            types: ["number"],
            description: "If provided, it is used as the length of this string. Defaults to this string's length",
            required: false,
          },
        ],
        returnType: "boolean",
      },
      includes: {
        description:
          "Returns true if searchString appears as a substring of the result of converting this object to a String, at one or more positions that are greater than or equal to position; otherwise, returns false",
        params: [
          {
            kind: "primitive" as const,
            name: "searchString",
            types: ["string"],
            description: "The string to search for",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "position",
            types: ["number"],
            description: "The position in this string at which to begin searching for searchString. Defaults to 0",
            required: false,
          },
        ],
        returnType: "boolean",
      },
      indexOf: {
        description: "Returns the position of the first occurrence of a substring",
        params: [
          {
            kind: "primitive" as const,
            name: "searchString",
            types: ["string"],
            description: "The substring to search for in the string",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "position",
            types: ["number"],
            description:
              "The index at which to begin searching the String object. If omitted, search starts at the beginning of the string",
            required: false,
          },
        ],
        returnType: "number",
      },
      lastIndexOf: {
        description: "Returns the last occurrence of a substring in the string",
        params: [
          {
            kind: "primitive" as const,
            name: "searchString",
            types: ["string"],
            description: "The substring to search for",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "position",
            types: ["number"],
            description:
              "The index at which to begin searching. If omitted, the search begins at the end of the string",
            required: false,
          },
        ],
        returnType: "number",
      },
      slice: {
        description: "Returns a section of a string",
        params: [
          {
            kind: "primitive" as const,
            name: "start",
            types: ["number"],
            description: "The index to the beginning of the specified portion of stringObj",
            required: false,
          },
          {
            kind: "primitive" as const,
            name: "end",
            types: ["number"],
            description:
              "The index to the end of the specified portion of stringObj. The substring includes the characters up to, but not including, the character indicated by end",
            required: false,
          },
        ],
        returnType: "string",
      },
      split: {
        description: "Split a string into substrings using the specified separator and return them as an array",
        params: [
          {
            kind: "primitive" as const,
            name: "separator",
            types: ["string", "RegExp"],
            description:
              "A string or Regular Expression that identifies character or characters to use in separating the string. If omitted, a single-element array containing the entire string is returned",
            required: false,
          },
          {
            kind: "primitive" as const,
            name: "limit",
            types: ["number"],
            description: "A value used to limit the number of elements returned in the array",
            required: false,
          },
        ],
        returnType: "string[]",
      },
      startsWith: {
        description:
          "Returns true if the sequence of elements of searchString converted to a String is the same as the corresponding elements of this object (converted to a String) starting at position. Otherwise returns false",
        params: [
          {
            kind: "primitive" as const,
            name: "searchString",
            types: ["string"],
            description: "The characters to be searched for at the start of this string",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "position",
            types: ["number"],
            description: "The position in this string at which to begin searching for searchString. Defaults to 0",
            required: false,
          },
        ],
        returnType: "boolean",
      },
      substring: {
        description: "Returns the substring at the specified location within a String object",
        params: [
          {
            kind: "primitive" as const,
            name: "start",
            types: ["number"],
            description: "The zero-based index number indicating the beginning of the substring",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "end",
            types: ["number"],
            description:
              "Zero-based index number indicating the end of the substring. The substring includes the characters up to, but not including, the character indicated by end",
            required: false,
          },
        ],
        returnType: "string",
      },
      toLowerCase: {
        description: "Converts all the alphabetic characters in a string to lowercase",
        params: [],
        returnType: "string",
      },
      toUpperCase: {
        description: "Converts all the alphabetic characters in a string to uppercase",
        params: [],
        returnType: "string",
      },
      trim: {
        description: "Removes the leading and trailing white space and line terminator characters from a string",
        params: [],
        returnType: "string",
      },
      trimStart: {
        description: "Removes the leading white space and line terminator characters from a string",
        params: [],
        returnType: "string",
      },
      trimEnd: {
        description: "Removes the trailing white space and line terminator characters from a string",
        params: [],
        returnType: "string",
      },
      replace: {
        description: "Replaces text in a string, using a search string",
        params: [
          {
            kind: "primitive" as const,
            name: "searchValue",
            types: ["string"],
            description: "A string to search for",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "replaceValue",
            types: ["string"],
            description:
              "A string containing the text to replace for every successful match of searchValue in this string",
            required: true,
          },
        ],
        returnType: "string",
      },
      repeat: {
        description: "Returns a string value that is made from count copies concatenated together",
        params: [
          {
            kind: "primitive" as const,
            name: "count",
            types: ["number"],
            description: "The number of times to repeat the string",
            required: true,
          },
        ],
        returnType: "string",
      },
      padStart: {
        description:
          "Pads the current string with another string until the resulting string reaches the given length, applied from the start of the current string",
        params: [
          {
            kind: "primitive" as const,
            name: "targetLength",
            types: ["number"],
            description: "The length of the resulting string once the current string has been padded",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "padString",
            types: ["string"],
            description: "The string to pad the current string with. Defaults to space",
            required: false,
          },
        ],
        returnType: "string",
      },
      padEnd: {
        description:
          "Pads the current string with another string until the resulting string reaches the given length, applied from the end of the current string",
        params: [
          {
            kind: "primitive" as const,
            name: "targetLength",
            types: ["number"],
            description: "The length of the resulting string once the current string has been padded",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "padString",
            types: ["string"],
            description: "The string to pad the current string with. Defaults to space",
            required: false,
          },
        ],
        returnType: "string",
      },
      replaceAll: {
        description: "Replaces all occurrences of a search string with a replacement string",
        params: [
          {
            kind: "primitive" as const,
            name: "searchValue",
            types: ["string"],
            description: "The string to search for",
            required: true,
          },
          {
            kind: "primitive" as const,
            name: "replaceValue",
            types: ["string"],
            description: "The string to replace all occurrences of searchValue with",
            required: true,
          },
        ],
        returnType: "string",
      },
    },
    properties: {
      length: {
        type: "number",
        readonly: true,
        description: "Returns the length of a String object",
      },
    },
  },
} as const;

export function getBuiltins(): Record<string, BuiltinSchema> {
  return structuredClone(BUILTINS);
}

export function getBuiltinGlobals(): string[] {
  return Object.keys(BUILTINS).filter((name) => BUILTINS[name].global === true);
}

export function isAllowedOnArray(prop: string): boolean {
  const arrayMethods = BUILTINS[ARRAY_PROTOTYPE]?.methods || {};
  const arrayProperties = BUILTINS[ARRAY_PROTOTYPE]?.properties || {};
  return prop in arrayMethods || prop in arrayProperties;
}

export function isAllowedOnString(prop: string): boolean {
  const stringMethods = BUILTINS[STRING_PROTOTYPE]?.methods || {};
  const stringProperties = BUILTINS[STRING_PROTOTYPE]?.properties || {};
  return prop in stringMethods || prop in stringProperties;
}

export function isMethodAllowed(methodName: string): boolean {
  for (const schema of Object.values(BUILTINS)) {
    if (schema.methods?.[methodName]) {
      return true;
    }
  }
  return false;
}

export function getMethodDefinition(methodName: string): BuiltinMethodSchema | null {
  for (const schema of Object.values(BUILTINS)) {
    if (schema.methods?.[methodName]) {
      return schema.methods[methodName];
    }
  }
  return null;
}

export function getAvailableArrayMembers(): string[] {
  const arrayNamespace = BUILTINS[ARRAY_PROTOTYPE];
  const methods = Object.keys(arrayNamespace?.methods || {});
  const properties = Object.keys(arrayNamespace?.properties || {});
  return [...methods, ...properties];
}

export function getAvailableStringMembers(): string[] {
  const stringNamespace = BUILTINS[STRING_PROTOTYPE];
  const methods = Object.keys(stringNamespace?.methods || {});
  const properties = Object.keys(stringNamespace?.properties || {});
  return [...methods, ...properties];
}

export function getMethodDisplayName(methodName: string): string {
  for (const [namespace, schema] of Object.entries(BUILTINS)) {
    if (schema.methods?.[methodName]) {
      if (schema.global) {
        return [namespace, methodName].join(".");
      }

      return methodName;
    }
  }
  return methodName;
}
