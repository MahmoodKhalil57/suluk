# Types & Enums

## fields

### `Field`
`@suluk/panel` — contract-first admin panels, in the spirit of Payload but projected from ONE OpenAPI v4 document.
Payload makes you configure collections in a framework-coupled DSL; @suluk/panel INFERS the same field types
(text/textarea/richtext/number/boolean/select/date/email/url/json/relationship) straight from the contract's
component schemas, renders shadcn/theme-aware forms + data tables, and mounts a role-aware admin — pass a
per-role PROJECTED document and you get a per-role dashboard for free. No DB coupling (it drives the contract's
REST), no config drift (the contract is the single source). CANDIDATE tooling.
**Properties:**
- `name: string`
- `label: string`
- `type: FieldType`
- `required: boolean`
- `nullable: boolean`
- `readOnly: boolean`
- `description: string` (optional)
- `options: string[]` (optional)
- `optionType: "string" | "number" | "boolean"` (optional)
- `relationTo: string` (optional)
- `relationLabelField: string` (optional)

### `FieldType`
Field-type inference — the Payload-parity core, contract-first. Given an entity's JSON-Schema (from the v4 doc's
components.schemas), infer the Payload-style field set: the right widget per property (text/textarea/number/
boolean/select/date/email/url/json/richtext/relationship), required/nullable, enum options, and relationships
(a `<entity>Id` whose `<Entity>` is itself an entity). No config DSL — the contract IS the config.
```ts
"text" | "textarea" | "richtext" | "number" | "boolean" | "select" | "date" | "datetime" | "email" | "url" | "media" | "json" | "relationship"
```

## model

### `EntityModel`
**Properties:**
- `name: string`
- `path: string`
- `fields: Field[]`
- `title: string`
- `access: { list: boolean; create: boolean; update: boolean; delete: boolean }`

## shell

### `NavGroup`
**Properties:**
- `title: string`
- `items: NavItem[]`

### `NavItem`
**Properties:**
- `name: string`
- `label: string`
- `href: string`
- `count: number` (optional)

## app

### `StatCard`
A KPI tile on the dashboard home.
**Properties:**
- `label: string`
- `value: string | number`
- `hint: string` (optional)
- `href: string` (optional)

### `PanelSection`
A custom, non-CRUD page mounted at `${basePath}/s/<id>`, rendered inside the panel shell.
**Properties:**
- `id: string`
- `label: string`
- `summary: string` (optional) — short line shown on the home card (else "Open").
- `render: (c: Context) => string | Promise<string>` — Inner HTML for the section body (may include <script>); receives the request context.

### `PanelGroup`
Sidebar grouping: a titled section listing entity names and/or section ids, in order.
**Properties:**
- `title: string`
- `entities: string[]` (optional)
- `sections: string[]` (optional)
