# JSXpression

**Safe JSX expressions with schema validation**

JSXpression lets you render dynamic JSX templates in a controlled, type-safe sandbox. Perfect for user-configurable components, low-code environments, and other places where you want flexibility without giving up control.

Under the hood it parses your JSX into an AST, validates it against a schema, compiles it to safe JavaScript, and runs it in isolation – with only your data and components available.

## What's it for?

Let users write JSX – safely. You define a schema describing which components and data are available, and JSXpression takes care of the rest: parsing, validation, and execution. No risk, no globals, no surprises.

**Bonus:** You can generate `.d.ts` files straight from your schema for full editor support – autocomplete, error highlighting, inline docs – all the TypeScript DX, none of the compilation overhead. Your schema stays the single source of truth.

## Features

- 🛡️ **Secure by design** – Static analysis blocks everything unsafe. No `eval`, no `window`, no `document`, only pure, allowed operations
- 📋 **Schema-driven** – Explicitly define what data and components exist. Anything not in the schema simply doesn't exist
- ⚡ **Fast** – Parse and validate once, then run freely. No runtime compilation required
- 🎯 **Familiar** – It's just JSX. The same syntax developers already know, now with guardrails

## Installation

```bash
npm install jsxpression
```

or

```bash
pnpm add jsxpression
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
// Result: <span style="font-size: 16px">Hello Peter!</span>
```

## React Example

```tsx
import { createElement } from "react";
import { render } from "jsxpression";

function DynamicComponent({ template, userData }) {
  const schema = {
    data: {
      user: {
        type: "object",
        shape: {
          name: {
            type: "string",
          },
          role: {
            type: "string",
          },
        },
      },
    },
    elements: {
      Text: {
        props: {
          className: {
            type: "string",
          },
        },
      },
      Card: {
        props: {
          title: {
            type: "string",
          },
        },
      },
    },
  };

  const result = render(template, schema, {
    data: { user: userData },
    components: {
      Text: ({ className, children }) => <span className={className}>{children}</span>,
      Card: ({ title, children }) => (
        <div className="card">
          <h3>{title}</h3>
          <div>{children}</div>
        </div>
      ),
    },
    createElement,
  });

  return <div className="dynamic-content">{result}</div>;
}

// Usage
<DynamicComponent
  template="<Card title={user.role}><Text className='username'>{user.name}</Text></Card>"
  userData={{ name: "Alice", role: "Developer" }}
/>;
```

## Expression Types

JSXpression supports different expression patterns:

```typescript
// JSX Elements
"<Text>Hello {user.name}</Text>";

// Fragments (for mixed content)
"<>Hello {user.name}, you have {items.length} items!</>";

// Bare expressions (single values)
"{user.name}";
"{items.length * 2}";
```

**Important:** Like React components, mixed content needs fragment wrapping:

- ❌ `"Hello {user.name}!"` - Won't work
- ✅ `"<>Hello {user.name}!</>"` - Correct approach

## Supported Methods

JSXpression gives you access to common JavaScript methods for working with data - but only the safe ones. No methods that modify arrays in place, no DOM access, no network calls. Just the everyday operations you need for formatting and transforming data in templates.

**Why?** When users write templates, they should be able to format dates, filter lists, and do basic math - but not delete files or make API calls. By exposing only pure, read-only methods, templates stay predictable and safe while covering 99% of real-world needs.

**Array (static):** `isArray`

**Array (prototype):** `map`, `filter`, `reduce`, `find`, `findIndex`, `some`, `every`, `slice`, `includes`, `indexOf`, `join`, `at`, `concat`, `flat`, `flatMap`, `length`

**String (prototype):** `charAt`, `charCodeAt`, `concat`, `endsWith`, `includes`, `indexOf`, `lastIndexOf`, `slice`, `split`, `startsWith`, `substring`, `toLowerCase`, `toUpperCase`, `trim`, `trimStart`, `trimEnd`, `replace`, `repeat`, `padStart`, `padEnd`, `replaceAll`, `length`

**Number (static):** `isNaN`, `isFinite`, `parseInt`, `parseFloat`

**Number (prototype):** `toFixed`, `toPrecision`, `toExponential`

**Math:** `max`, `min`, `floor`, `ceil`, `round`, `abs`, `sqrt`, `pow`, `sign`, `sin`, `cos`, `atan2`, `PI`, `E`

### Examples

```typescript
// Array operations
"{items.map(item => item.toUpperCase())}";
"{numbers.filter(n => n > 10).length}";
"{items.at(-1)}"; // Last item
"{arrays.flat()}"; // Flatten nested arrays
"{items.findIndex(item => item.id === 5)}"; // Find index
"{Array.isArray(value) ? value.length : 0}"; // Type check

// String operations
"{text.toUpperCase().trim()}";
"{name.slice(0, 3)}";
"{label.padStart(10, '0')}"; // "00000label"
"{text.repeat(3)}"; // Repeat string
"{str.replaceAll('old', 'new')}"; // Replace all occurrences

// Math operations
"{Math.max(...scores)}";
"{Math.round(price * 1.2)}";
"{Math.sqrt(area)}"; // Square root
"{Math.pow(2, 8)}"; // 2^8 = 256
"{Math.sin(angle)}"; // Trigonometry

// Number operations
"{Number.isNaN(value)}";
"{Number.parseInt(stringNumber, 10)}";
"{temperature.toFixed(1)}°C"; // 23.5°C
"{price.toFixed(2)}"; // 19.99
"{airflow.toPrecision(4)} m³/h"; // Technical measurements
```

## Schema Definition

Define what data and components are available:

```typescript
import type { Schema } from "jsxpression";

const schema = {
  //
  // Data schema – each key becomes a top-level variable in expressions
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
        address: {
          type: "object",
          shape: {
            city: { type: "string" },
            zip: { type: "number" },
          },
        },
        tags: {
          type: "array",
          description: "User tags (array of strings)",
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

    onClick: {
      type: "function",
      description: "A safe callback (pure, no side effects)",
    },
  },

  //
  // Element schema – defines which JSX elements can be used
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

    Button: {
      description: "Button with event handler and label",
      props: {
        label: { type: "string", required: true },
        onClick: { type: "function" },
        variant: { type: "string", enum: ["primary", "secondary"] },
      },
      allowedChildren: ["Text"], // can only contain <Text>
    },

    Card: {
      description: "Wrapper element for grouping content",
      props: {
        title: { type: "string", required: true },
        highlighted: { type: "boolean" },
      },
      allowedChildren: ["Text", "Image", "Button"], // allowed inside <Card>...</Card>
    },
  },
} satisfies Schema;

// <Text size={16} color="blue">{user.name}</Text>
// <Image src={user.avatar} />
// <Button label="Click" onClick={onClick}><Text>OK</Text></Button>
// <Card title="Profile"><Text>{user.role}</Text><Button label="Edit" /></Card>
```

## API

### `render(source, schema, options?)`

Renders a JSX expression with data and components.

**Arguments:**

- `source: string` - The JSX expression to render (e.g., `"<Text>{name}</Text>"`)
- `schema: Schema` - Schema defining available data properties and components
- `options?: RenderOptions` - Optional rendering settings:
  - `data?: Record<string, any>` - Data object whose keys become top-level variables in expressions
  - `components?: Record<string, Component>` - Component implementations
  - `createElement?: Function` - Optional createElement function (e.g., React's `createElement`)
  - `minSeverity?: 1 | 2 | 3` - Minimum severity to abort (1=info, 2=warning, 3=error). Default: 3

**Returns:** The rendered result (type depends on the provided createElement function)

**Throws:** `AnalysisError` if validation fails

**Example:**

```typescript
const result = render("<Card title={title}>{content}</Card>", schema, {
  data: { title: "Hello", content: "World" },
  components: { Card: MyCardComponent },
  createElement: React.createElement,
});
```

### `validate(source, schema, options?)`

Validatesa JSX expression against a schema without rendering. Great for checking templates before persisting or execution.

**Arguments:**

- `source: string` - The JSX expression to validate
- `schema: Schema` - Schema to validate against
- `options?: ValidateOptions` - Optional validation settings:
  - `minSeverity?: 1 | 2 | 3` - Minimum severity to count as failure. Default: 3

**Returns:** `ValidateResult` - Either `{ ok: true }` or `{ ok: false, error: AnalysisError | ParseError }`

**Example:**

```typescript
const result = validate("{user.invalidProperty}", schema);

if (!result.ok) {
  console.error("Validation failed:", result.error.message);

  // Analysis errors give you the full breakdown
  if (result.error instanceof AnalysisError) {
    result.error.report.issues.forEach((issue) => {
      console.error(`${issue.message} at line ${issue.range.start.line}`);
    });
    // Also available: .errors (severity 3), .warnings (severity 2), .infos (severity 1)
  }
}
```

### `generateTypeScriptDefinitions(schema)`

Generates TypeScript type definitions from a schema. Use this to enable autocomplete and type checking in code editors like Monaco Editor or VS Code.

**Arguments:**

- `schema: Schema` - The schema to generate types from

**Returns:** `string` - Complete TypeScript `.d.ts` file content

**Example:**

```typescript
const definitions = generateTypeScriptDefinitions(schema);
// Add to Monaco Editor:
monaco.languages.typescript.javascriptDefaults.addExtraLib(definitions, "jsxpression-types.d.ts");
```
