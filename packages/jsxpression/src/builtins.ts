interface BuiltinMethod {
  params: BuiltinParam[];
  returns: string;
  callback?: {
    params: string[];
    returns: string;
  };
}

interface BuiltinParam {
  name: string;
  type: string;
  required?: boolean;
  variadic?: boolean;
}

interface BuiltinProperty {
  type: string;
  readonly?: boolean;
}

interface BuiltinSchema {
  methods?: Record<string, BuiltinMethod>;
  properties?: Record<string, BuiltinProperty>;
  global: boolean;
}

const MATH = "Math";
const ARRAY_PROTOTYPE = "Array.prototype";
const STRING_PROTOTYPE = "String.prototype";

const BUILTINS: Record<string, BuiltinSchema> = {
  [MATH]: {
    global: true,
    methods: {
      max: {
        params: [
          {
            name: "values",
            type: "number",
            variadic: true,
          },
        ],
        returns: "number",
      },
      min: {
        params: [
          {
            name: "values",
            type: "number",
            variadic: true,
          },
        ],
        returns: "number",
      },
      floor: {
        params: [
          {
            name: "value",
            type: "number",
            required: true,
          },
        ],
        returns: "number",
      },
      ceil: {
        params: [
          {
            name: "value",
            type: "number",
            required: true,
          },
        ],
        returns: "number",
      },
      round: {
        params: [
          {
            name: "value",
            type: "number",
            required: true,
          },
        ],
        returns: "number",
      },
      abs: {
        params: [
          {
            name: "value",
            type: "number",
            required: true,
          },
        ],
        returns: "number",
      },
    },
  },

  [ARRAY_PROTOTYPE]: {
    global: false,
    methods: {
      map: {
        params: [
          {
            name: "callback",
            type: "function",
            required: true,
          },
          {
            name: "thisArg",
            type: "any",
            required: false,
          },
        ],
        callback: {
          params: ["T", "number", "T[]"],
          returns: "U",
        },
        returns: "U[]",
      },
      filter: {
        params: [
          {
            name: "callback",
            type: "function",
            required: true,
          },
          {
            name: "thisArg",
            type: "any",
            required: false,
          },
        ],
        callback: {
          params: ["T", "number", "T[]"],
          returns: "boolean",
        },
        returns: "T[]",
      },
      reduce: {
        params: [
          {
            name: "callback",
            type: "function",
            required: true,
          },
          {
            name: "initialValue",
            type: "any",
            required: false,
          },
        ],
        callback: {
          params: ["U", "T", "number", "T[]"],
          returns: "U",
        },
        returns: "U",
      },
      find: {
        params: [
          {
            name: "callback",
            type: "function",
            required: true,
          },
          {
            name: "thisArg",
            type: "any",
            required: false,
          },
        ],
        callback: {
          params: ["T", "number", "T[]"],
          returns: "boolean",
        },
        returns: "T | undefined",
      },
      some: {
        params: [
          {
            name: "callback",
            type: "function",
            required: true,
          },
          {
            name: "thisArg",
            type: "any",
            required: false,
          },
        ],
        callback: {
          params: ["T", "number", "T[]"],
          returns: "boolean",
        },
        returns: "boolean",
      },
      every: {
        params: [
          {
            name: "callback",
            type: "function",
            required: true,
          },
          {
            name: "thisArg",
            type: "any",
            required: false,
          },
        ],
        callback: {
          params: ["T", "number", "T[]"],
          returns: "boolean",
        },
        returns: "boolean",
      },
      slice: {
        params: [
          {
            name: "start",
            type: "number",
            required: false,
          },
          {
            name: "end",
            type: "number",
            required: false,
          },
        ],
        returns: "T[]",
      },
      includes: {
        params: [
          {
            name: "searchElement",
            type: "T",
            required: true,
          },
          {
            name: "fromIndex",
            type: "number",
            required: false,
          },
        ],
        returns: "boolean",
      },
      indexOf: {
        params: [
          {
            name: "searchElement",
            type: "T",
            required: true,
          },
          {
            name: "fromIndex",
            type: "number",
            required: false,
          },
        ],
        returns: "number",
      },
      join: {
        params: [
          {
            name: "separator",
            type: "string",
            required: false,
          },
        ],
        returns: "string",
      },
      at: {
        params: [
          {
            name: "index",
            type: "number",
            required: true,
          },
        ],
        returns: "T | undefined",
      },
    },
    properties: {
      length: {
        type: "number",
        readonly: true,
      },
    },
  },

  [STRING_PROTOTYPE]: {
    global: false,
    methods: {
      charAt: {
        params: [
          {
            name: "index",
            type: "number",
            required: true,
          },
        ],
        returns: "string",
      },
      charCodeAt: {
        params: [
          {
            name: "index",
            type: "number",
            required: true,
          },
        ],
        returns: "number",
      },
      concat: {
        params: [
          {
            name: "strings",
            type: "string",
            variadic: true,
          },
        ],
        returns: "string",
      },
      endsWith: {
        params: [
          {
            name: "searchString",
            type: "string",
            required: true,
          },
          {
            name: "length",
            type: "number",
            required: false,
          },
        ],
        returns: "boolean",
      },
      includes: {
        params: [
          {
            name: "searchString",
            type: "string",
            required: true,
          },
          {
            name: "position",
            type: "number",
            required: false,
          },
        ],
        returns: "boolean",
      },
      indexOf: {
        params: [
          {
            name: "searchString",
            type: "string",
            required: true,
          },
          {
            name: "position",
            type: "number",
            required: false,
          },
        ],
        returns: "number",
      },
      lastIndexOf: {
        params: [
          {
            name: "searchString",
            type: "string",
            required: true,
          },
          {
            name: "position",
            type: "number",
            required: false,
          },
        ],
        returns: "number",
      },
      slice: {
        params: [
          {
            name: "start",
            type: "number",
            required: false,
          },
          {
            name: "end",
            type: "number",
            required: false,
          },
        ],
        returns: "string",
      },
      split: {
        params: [
          {
            name: "separator",
            type: "string | RegExp",
            required: false,
          },
          {
            name: "limit",
            type: "number",
            required: false,
          },
        ],
        returns: "string[]",
      },
      startsWith: {
        params: [
          {
            name: "searchString",
            type: "string",
            required: true,
          },
          {
            name: "position",
            type: "number",
            required: false,
          },
        ],
        returns: "boolean",
      },
      substring: {
        params: [
          {
            name: "start",
            type: "number",
            required: true,
          },
          {
            name: "end",
            type: "number",
            required: false,
          },
        ],
        returns: "string",
      },
      toLowerCase: {
        params: [],
        returns: "string",
      },
      toUpperCase: {
        params: [],
        returns: "string",
      },
      trim: {
        params: [],
        returns: "string",
      },
      trimStart: {
        params: [],
        returns: "string",
      },
      trimEnd: {
        params: [],
        returns: "string",
      },
    },
    properties: {
      length: {
        type: "number",
        readonly: true,
      },
    },
  },
} as const;

export function getBuiltins(): Record<string, BuiltinSchema> {
  // *Very* important to return a clone here to avoid mutations to the original object.
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

export function getMethodDefinition(methodName: string): BuiltinMethod | null {
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
