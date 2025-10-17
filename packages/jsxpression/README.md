# JSXpression

**Safe JSX expressions with schema validation**

JSXpression lets you render dynamic JSX templates with security and type safety. Perfect for user-configurable components, and other dynamic content.

## Features

- 🛡️ **Security** - Static analysis prevents dangerous operations
- 📋 **Schema validation** - Define exactly what data and components are available
- ⚡ **Performance** - No runtime compilation needed
- 🎯 **Familiar** - Standard JSX syntax

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

const result = render("<Text size={16}>Hello {data.user.name}!</Text>", schema, {
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
  template="<Card title={data.user.role}><Text className='username'>{data.user.name}</Text></Card>"
  userData={{ name: "Alice", role: "Developer" }}
/>;
```

## Expression Types

JSXpression supports different expression patterns:

```typescript
// JSX Elements
"<Text>Hello {data.user.name}</Text>";

// Fragments (for mixed content)
"<>Hello {data.user.name}, you have {data.items.length} items!</>";

// Bare expressions (single values)
"{data.user.name}";
"{data.items.length * 2}";
```

**Important:** Like React components, mixed content needs fragment wrapping:

- ❌ `"Hello {data.user.name}!"` - Won't work
- ✅ `"<>Hello {data.user.name}!</>"` - Correct approach

## Supported Methods

JSXpression includes built-in support for safe JavaScript methods:

**Array:** `map`, `filter`, `reduce`, `find`, `some`, `every`, `slice`, `includes`, `indexOf`, `join`, `at`, `length`

**String:** `charAt`, `charCodeAt`, `concat`, `endsWith`, `includes`, `indexOf`, `lastIndexOf`, `slice`, `split`, `startsWith`, `substring`, `toLowerCase`, `toUpperCase`, `trim`, `trimStart`, `trimEnd`, `replace`, `length`

**Math:** `max`, `min`, `floor`, `ceil`, `round`, `abs`, `PI`, `E`

### Examples

```typescript
// Array operations
"{data.items.map(item => item.toUpperCase())}";
"{data.numbers.filter(n => n > 10).length}";
"{data.items.at(-1)}"; // Last item

// String operations
"{data.text.toUpperCase().trim()}";
"{data.name.slice(0, 3)}";

// Math operations
"{Math.max(...data.scores)}";
"{Math.round(data.price * 1.2)}";
```

## Schema Definition

Define what data and components are available:

```typescript
const schema = {
  data: {
    user: {
      type: "object",
      shape: {
        name: { type: "string" },
        age: { type: "number" },
      },
    },
    items: { type: "array", shape: { type: "string" } },
  },
  elements: {
    Card: {
      props: {
        title: { type: "string" },
        highlighted: { type: "boolean" },
      },
    },
  },
};
```

## Safety Features

- **No eval** - Expressions are parsed and validated, never executed as strings
- **Access control** - Only schema-defined data and components are accessible
- **Method filtering** - Only safe, pure methods are allowed (no `push`, `pop`, etc.)
- **No globals** - No access to `window`, `document`, or other dangerous objects
- **Static data only** - Meant for rendering data, not handling interactions or side effects

## API

### `render(expression, schema, options)`

Renders a JSX expression with data and components.

### `validate(expression, schema, options)`

Validates an expression against a schema without rendering.

### `generateTypeScriptDefinitions(schema)`

Generates TypeScript type definitions from a schema. Use this to enable autocomplete and type checking in code editors like Monaco Editor or VS Code.

## Editor Support: TypeScript DX Without TypeScript

JSXpression provides the full TypeScript developer experience - autocomplete, type checking, and inline documentation - without requiring TypeScript syntax in your expressions.

```typescript
// ✅ API is fully typed
const result = render(expression, schema, options);

// ✅ Schema validation catches errors at runtime
validate("{data.user.invalid}", schema); // Error: Property doesn't exist

// ✅ Generated type definitions enable full IntelliSense
const definitions = generateTypeScriptDefinitions(schema);
// Use in Monaco Editor or VS Code for autocomplete and error highlighting
```

**How it works:** Expressions use standard JavaScript, but `generateTypeScriptDefinitions()` generates `.d.ts` files from your schema. This gives editors complete type information for autocomplete, error highlighting, and inline documentation. Since we only allow simple expressions and the schema defines all available types, we can validate everything at runtime without needing a TypeScript compiler.

**The result:** Same developer experience as TypeScript, zero compilation overhead, full type safety at runtime. The schema becomes the single source of truth for both validation and editor tooling.
