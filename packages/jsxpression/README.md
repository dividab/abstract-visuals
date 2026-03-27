# JSXpression

**Sandboxed JSX components with full TypeScript support**

JSXpression is a secure runtime for user-authored JSX. Think of it as a mini component system: users write functions, define interfaces, compose components — all inside a validated sandbox. The syntax is familiar TypeScript/JSX, but the execution environment is locked down by your schema.

Under the hood it parses TSX into an AST, validates it against a schema, compiles it to safe JavaScript, and runs it in isolation — with only your data, components, and allowed builtins available.

## What's it for?

Let users build components — safely. You define a schema describing which elements and data are available, and JSXpression takes care of the rest: parsing, validation, and execution. No risk, no globals, no surprises.

Use cases: configurable document templates, dynamic diagram layouts, low-code UI builders, user-defined report generators — anywhere you need end-user flexibility without giving up control.

**Bonus:** You can generate `.d.ts` files straight from your schema for full editor support — autocomplete, error highlighting, inline docs — all the TypeScript DX, none of the compilation overhead. Your schema stays the single source of truth.

## Features

- 🛡️ **Secure by design** — Static analysis blocks everything unsafe. No `eval`, no `window`, no `document`, only pure, allowed operations
- 📋 **Schema-driven** — Explicitly define what data and elements exist. Anything not in the schema simply doesn't exist
- ⚡ **Fast** — Parse and validate once, then run freely. No runtime compilation required
- 🧩 **Composable** — Define local functions, extract reusable components, use `const` bindings — just like real components
- 🎯 **Familiar** — It's TypeScript + JSX. The same syntax developers already know, now with guardrails

## Installation

```bash
npm install jsxpression
```

## Quick Start

```typescript
import { render } from "jsxpression";

const schema = {
  data: {
    user: { type: "object", shape: { name: { type: "string" } } },
    items: { type: "array", shape: { type: "string" } },
  },
  elements: {
    Text: { props: { size: { type: "number" } } },
  },
};

const result = render("<Text size={16}>Hello {user.name}!</Text>", schema, {
  data: { user: { name: "Peter" }, items: ["apple", "banana"] },
  components: { Text: ({ size, children }) => `<span style="font-size: ${size}px">${children}</span>` },
});
```

## Writing Templates

Templates are mini TypeScript/JSX programs. You can use `const` bindings, `function` declarations, `interface` types, and compose them freely — just like a React component body. The only rule: the last statement must be a `return` with your JSX.

### Simple expression

```tsx
return <Text size={16}>Hello {user.name}!</Text>;
```

### With local variables

```tsx
const greeting = user.isAdmin ? "Welcome back" : "Hello";
const itemCount = items.length;

return (
  <Card title={greeting}>
    <Text>{itemCount} items</Text>
  </Card>
);
```

### With reusable functions

```tsx
interface BadgeProps {
  label: string;
  color: string;
}

function Badge({ label, color }: BadgeProps) {
  return (
    <Box>
      <Rectangle fill={color} width={60} height={20} />
      <Text size={11} fill="#fff">
        {label}
      </Text>
    </Box>
  );
}

interface RowProps {
  item: { name: string; status: string };
  y: number;
}

function Row({ item, y }: RowProps) {
  return (
    <Box>
      <Text x={10} y={y}>
        {item.name}
      </Text>
      <Badge label={item.status} color={item.status === "active" ? "#2b8a3e" : "#868e96"} />
    </Box>
  );
}

return (
  <Container>
    {items.map((item, i) => (
      <Row item={item} y={i * 24} />
    ))}
  </Container>
);
```

TypeScript syntax (`interface`, type annotations, generics) is fully supported in parsing and silently stripped at compile time. Type safety isn't lost though — it's enforced by the schema. The schema validates every element, attribute, data access, and function call at analysis time, before any code runs. TypeScript gives you the editor DX; the schema gives you the runtime guarantees.

## Expression Types

```typescript
// JSX elements
"return <Text>Hello {user.name}</Text>";

// Fragments
"return <>Hello {user.name}, you have {items.length} items!</>";

// Bare expressions (single values — no return needed)
"{user.name}";
"{items.length * 2}";
```

**Note:** Like React, mixed text and expressions need fragment wrapping:

- ❌ `"Hello {user.name}!"` — Won't work
- ✅ `"return <>Hello {user.name}!</>"` — Correct

## Supported Builtins

Only safe, read-only operations are exposed. No mutation, no DOM, no network — just the everyday tools needed for formatting and transforming data.

**Array (static):** `isArray`

**Array (prototype):** `map`, `filter`, `reduce`, `find`, `findIndex`, `some`, `every`, `slice`, `includes`, `indexOf`, `join`, `at`, `concat`, `flat`, `flatMap`, `length`

**String:** `String()` (conversion), plus prototype methods: `charAt`, `charCodeAt`, `concat`, `endsWith`, `includes`, `indexOf`, `lastIndexOf`, `slice`, `split`, `startsWith`, `substring`, `toLowerCase`, `toUpperCase`, `trim`, `trimStart`, `trimEnd`, `replace`, `repeat`, `padStart`, `padEnd`, `replaceAll`, `length`

**Number (static):** `isNaN`, `isFinite`, `parseInt`, `parseFloat`

**Number (prototype):** `toFixed`, `toPrecision`, `toExponential`

**Math:** `max`, `min`, `floor`, `ceil`, `round`, `abs`, `sqrt`, `pow`, `sign`, `sin`, `cos`, `atan2`, `PI`, `E`

### Examples

```tsx
// Array operations
"{items.map(item => item.toUpperCase())}";
"{numbers.filter(n => n > 10).length}";
"{Array.isArray(value) ? value.length : 0}";

// String operations
"{text.toUpperCase().trim()}";
"{String(numericValue)}";

// Math & Number
"{Math.round(price * 1.2)}";
"{temperature.toFixed(1)}°C";
```

## Schema Definition

Define what data and elements are available:

```typescript
import type { Schema } from "jsxpression";

const schema = {
  //
  // Data schema — each key becomes a top-level variable in expressions
  //
  data: {
    user: {
      type: "object",
      description: "User info shown in templates",
      shape: {
        name: { type: "string", required: true },
        age: { type: "number" },
        isAdmin: { type: "boolean" },
        role: { type: "string", enum: ["user", "admin", "guest"] },
        tags: {
          type: "array",
          description: "User tags",
          shape: { type: "string" },
        },
      },
    },

    stats: {
      type: "object",
      shape: {
        scores: { type: "array", shape: { type: "number" } },
      },
    },
  },

  //
  // Element schema — defines which JSX elements can be used
  //
  elements: {
    Text: {
      description: "Simple text element",
      props: {
        size: { type: "number" },
        weight: { type: "string", enum: ["regular", "bold"] },
        color: { type: "string" },
      },
      // no allowedChildren = can contain anything
    },

    Image: {
      description: "Self-closing image element",
      props: {
        src: { type: "string", required: true },
        alt: { type: "string" },
        width: { type: "number" },
        height: { type: "number" },
      },
      allowedChildren: [], // means <Image src="..." /> only
    },

    Card: {
      description: "Wrapper for grouping content",
      props: {
        title: { type: "string", required: true },
        highlighted: { type: "boolean" },
      },
      allowedChildren: ["Text", "Image"], // allowed inside <Card>
    },
  },

  //
  // Functions — additional functions available in expressions
  //
  functions: {
    formatDate: {
      returnType: { type: "string" },
      parameters: [{ name: "date", property: { type: "string" } }],
    },
  },
} satisfies Schema;
```

## API

### `render(source, schema, options?)`

Parse, validate, compile, and evaluate a JSX template in one call.

**Arguments:**

- `source: string` — The JSX/TSX template
- `schema: Schema` — Schema defining available data and elements
- `options?: RenderOptions`:
  - `data?: Record<string, any>` — Data variables available in the template
  - `components?: Record<string, Component>` — Component implementations for schema elements
  - `functions?: Record<string, Function>` — Additional function implementations
  - `createElement?: Function` — Optional createElement (e.g., `React.createElement`)
  - `minSeverity?: 1 | 2 | 3` — Minimum severity to abort (default: 3)

**Returns:** The rendered result

**Throws:** `AnalysisError` if validation fails, `ParseError` if syntax is invalid

```typescript
const result = render(template, schema, {
  data: { title: "Hello", items: [1, 2, 3] },
  components: { Card: MyCardComponent, Text: MyTextComponent },
  createElement: React.createElement,
});
```

### `compile(source, schema, options?)`

Parse, validate, and compile — but don't evaluate. Useful for pre-compiling templates.

```typescript
const compiled = compile(template, schema);
// Store `compiled` and evaluate later with different data
```

### `validate(source, schema, options?)`

Validate a template against a schema without rendering. Great for checking templates before persisting.

**Returns:** `{ ok: true }` or `{ ok: false, error: AnalysisError | ParseError }`

```typescript
const result = validate(template, schema);

if (!result.ok) {
  // Individual issues with codes, messages, and source ranges
  if (result.error instanceof AnalysisError) {
    result.error.report.issues.forEach((issue) => {
      console.error(`[${issue.code}] ${issue.message} (line ${issue.range.start.line})`);
    });
  }
}
```

### `generateTypeScriptDefinitions(schema)`

Generate `.d.ts` content from a schema for editor autocomplete.

```typescript
const dts = generateTypeScriptDefinitions(schema);
// Feed to Monaco Editor, VS Code, or any TypeScript-aware editor
monaco.languages.typescript.javascriptDefaults.addExtraLib(dts, "jsxpression-types.d.ts");
```

## Security Model

Templates run in a locked-down sandbox. The static analyzer rejects anything potentially dangerous before code is ever executed:

- **No globals** — Only schema-defined data, allowed builtins, and local declarations are accessible
- **No mutation** — `let`, `var`, assignment, `delete`, `++/--` are all blocked
- **No escape hatches** — `eval`, `Function`, `import`, `require`, `new`, `this`, `super` are blocked
- **No async** — `await`, `yield`, generators are blocked
- **No side effects** — `try/catch`, `throw`, `debugger`, `with` are blocked
- **Method allowlist** — Only explicitly safe prototype methods are callable
- **Element validation** — Every JSX tag, attribute, and child is checked against the schema

Local `const` bindings and `function` declarations are allowed for composition, but they can't break out of the sandbox.
