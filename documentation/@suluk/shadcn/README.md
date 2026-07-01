[**Suluk**](../../README.md)

***

[Suluk](../../packages.md) / @suluk/shadcn

<p align="center">
  <a href="https://github.com/MahmoodKhalil57/suluk">
    <img src="https://raw.githubusercontent.com/MahmoodKhalil57/suluk/main/branding/export/wordmark.png" alt="Suluk" width="360" />
  </a>
</p>

# @suluk/shadcn

**v4 "Suluk" Schema Objects → shadcn/ui form, table, and detail TSX you own — plus the shadcn theme files. Codegen, no runtime UI deps.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor candidate for
> OpenAPI Specification v4.0 ("Moonwalk"), unaffiliated with the OpenAPI Initiative and unable
> to ratify anything on the SIG's behalf.

## Install

```sh
bun add @suluk/shadcn
```

## What it does

Reads a v4 Schema Object (which **is** JSON Schema 2020-12) and projects it onto shadcn/ui component source — as **strings**. The chain is `Zod → v4 Schema Object (@suluk/zod) → descriptor (formSpec / tableSpec, here) → shadcn TSX (here)`.

- **Descriptor pass** — `formSpec` / `tableSpec` inspect a schema and produce a UI-shaped model: which control per property (`text` / `number` / `select` / `switch` / `date` / `email` / `file` / `richtext` / `relation` / …), required-ness, enum options, bounds, relations.
- **Codegen pass** — `renderFormTsx` (react-hook-form + `zodResolver`), `renderTableTsx`, `renderDetailTsx` (read-only show view), and matching loading skeletons emit idiomatic, self-contained shadcn component source against the conventional `@/components/ui/*` import paths.
- **Theme pass** — `renderShadcnTheme` turns a `@suluk/theme` `TokenSpec` into the two files a shadcn project needs: `globals.css` (token CSS vars + Tailwind v4 `@theme inline`) and `components.json` (`cssVariables: true`).
- **Honest-loss discipline** — every property that can't be faithfully mapped (unresolvable `$ref`, boolean schema, non-object root) is enumerated in the spec's `warnings: string[]`, and the renderers surface those warnings as a leading comment block. Nothing is dropped silently.
- **No runtime UI deps** — this is pure string codegen; no JSX is evaluated and no shadcn/React packages are imported at runtime.

## When to reach for it

Reach for `@suluk/shadcn` when you have a React/shadcn frontend and want **generated, owned** CRUD components scaffolded from your contract — code you then check in and edit by hand.

- Use **`@suluk/shadcn`** when you want shadcn/ui TSX you keep and customize.
- Use **`@suluk/panel`** instead when you want a contract-first admin UI (Payload-style) that infers forms + tables for you, rather than emitting component source to own.
- It does **not** generate the Zod schema — that is `@suluk/zod`'s `v4ToZod` corner. `renderFormTsx` references the schema by name (`import { FormSchema } from "./schema"`) so the file is drop-in once you wire that import.

## Usage

### Schema → form + table TSX (the common case)

```ts
import * as z from "zod";
import { zodToV4 } from "@suluk/zod";
import { formSpec, tableSpec, renderFormTsx, renderTableTsx } from "@suluk/shadcn";

// Zod is the source of truth → a v4 Schema Object (JSON Schema 2020-12)
const Pet = z.object({
  name: z.string(),
  status: z.enum(["available", "pending", "sold"]),
  age: z.number(),
  active: z.boolean(),
});
const petSchema = zodToV4(Pet).schema;

// Descriptor pass: inspect the schema
const fSpec = formSpec(petSchema);   // → { fields: [...], warnings: [] }
const tSpec = tableSpec(petSchema);  // → { columns: [...], warnings: [] }

// Codegen pass: emit shadcn TSX as strings
const formTsx  = renderFormTsx(fSpec,  { componentName: "PetForm",  schemaName: "PetSchema" });
const tableTsx = renderTableTsx(tSpec, { componentName: "PetTable" });

await Bun.write("src/components/pet-form.tsx", formTsx);
await Bun.write("src/components/pet-table.tsx", tableTsx);
```

`formSpec` picks the control per property: `status` (an enum) becomes a `<Select>` carrying the enum options, `active` (boolean) a `<Switch>`, `age` a number `<Input>`, `name` a text `<Input>`. Formats and `x-suluk-*` facets refine the pick — `format: "email"`/`"uri"`/`"date"`/`"date-time"` map to the matching input; `contentEncoding: "base64"` / `format: "binary"` → a file input; `contentMediaType: "text/html"` → a richtext editor; an `x-suluk-relation: "User"` property → an entity-picker; and an explicit `x-suluk-widget` override always wins.

The generated form is hardened shadcn: `mode: "onSubmit"` with `reValidateMode: "onChange"`, a root-error alert banner (`role="alert"`), a submit `<Button>` disabled while submitting, and reset-on-success (toggle with `resetOnSuccess: false`).

### Detail (show) view + loading skeletons

```ts
import {
  formSpec, tableSpec,
  renderDetailTsx,
  renderFormSkeletonTsx, renderTableSkeletonTsx, renderDetailSkeletonTsx,
} from "@suluk/shadcn";

const fSpec = formSpec(petSchema);
const tSpec = tableSpec(petSchema);

renderDetailTsx(fSpec, { componentName: "PetDetail" });   // a read-only <dl> of label → value
renderFormSkeletonTsx(fSpec);                             // a placeholder per field + submit
renderTableSkeletonTsx(tSpec, { rows: 8 });               // header + N body rows of placeholders
renderDetailSkeletonTsx(fSpec);                           // a placeholder row per field
```

Together these complete the CRUD UI set: form (create/edit), table (list), detail (show), and a loading skeleton mirroring each shape so the layout doesn't jump when data lands.

### `$ref` resolution

Pass a `defs` map so a top-level or property-level `Reference` resolves by name (works for bare names and full `#/components/schemas/<name>` JSON-Pointers alike):

```ts
formSpec({ $ref: "#/components/schemas/Pet" }, { defs: { Pet: petSchema } });
```

### shadcn theme files from a TokenSpec

```ts
import { renderShadcnTheme, renderGlobalsCss, renderComponentsJson } from "@suluk/shadcn";
import { terracotta } from "@suluk/theme";

// the whole theme: both files keyed by their on-disk paths
const files = renderShadcnTheme(terracotta, { cssPath: "src/app/globals.css" });
// → { "src/app/globals.css": "<css>", "components.json": "<json>" }
for (const [path, content] of Object.entries(files)) await Bun.write(path, content);

// or each file on its own
const css  = renderGlobalsCss(terracotta, { darkSelector: ".dark" });
const json = renderComponentsJson({ style: "new-york", baseColor: "neutral" });
```

One `@suluk/theme` `TokenSpec` (light) — or a full `ThemeSpec` (`{ light, dark }`) — drives `globals.css` and `components.json` together, instead of hand-syncing the token CSS against the component library. A bare `TokenSpec` has its dark scheme derived; a full `ThemeSpec` is used as-is.

## API

| Export | What it does |
| --- | --- |
| `formSpec(schema, opts?)` | Schema Object → `FormSpec` (`{ fields, warnings }`); one `FieldSpec` per object property. |
| `tableSpec(schema, opts?)` | Schema Object (object or array) → `TableSpec` (`{ columns, warnings }`). |
| `renderFormTsx(spec, opts?)` | `FormSpec` → shadcn `<Form>` TSX (react-hook-form + `zodResolver`) as a string. |
| `renderTableTsx(spec, opts?)` | `TableSpec` → shadcn `<Table>` TSX as a string. |
| `renderDetailTsx(spec, opts?)` | `FormSpec` → read-only detail (`<dl>` show) view TSX. |
| `renderFormSkeletonTsx` / `renderTableSkeletonTsx` / `renderDetailSkeletonTsx` | Loading-skeleton TSX mirroring each view's shape. |
| `renderShadcnTheme(theme, opts?)` | `TokenSpec`/`ThemeSpec` → `{ [cssPath]: globals.css, "components.json": … }`. |
| `renderGlobalsCss(theme, opts?)` | Just the `globals.css` string. |
| `renderComponentsJson(opts?)` | Just the `components.json` string. |

Types: `FieldWidget`, `FieldSpec`, `FormSpec`, `ColumnSpec`, `TableSpec`, `SpecOptions`, `RenderFormOptions`, `RenderTableOptions`, `RenderDetailOptions`, `RenderSkeletonOptions`, `ShadcnThemeOptions`.

This package has a single entry point (`@suluk/shadcn`); there are no sub-path exports and no CLI.

## Boundary

This is the L3 line — **render/generate, never host.** `@suluk/shadcn` hands you component *source* you own and can edit; it imports no React/shadcn packages at runtime. The seams it leaves app-side:

- **Wire the imports.** Generated TSX targets the conventional shadcn paths (`@/components/ui/*`); you supply those primitives (`bunx shadcn add …`). The form references its Zod schema by name (`./schema`) — you wire that import.
- **App-provided components.** A `richtext` widget emits `<RichTextEditor>` and a `relation` widget emits `<EntitySelect>` — you provide those (a Lexical editor, an async entity picker).
- **Data + submit stay yours.** The table maps a `rows` prop you supply; the detail view reads a `record` prop; the form's `onSubmit` is a stubbed handler you fill in.
- **Zod generation lives elsewhere.** Get the v4 Schema Object from `@suluk/zod` (`zodToV4`) and the Zod schema for the resolver from its `v4ToZod` corner.

## License

Apache-2.0

## Interfaces

- [ColumnSpec](interfaces/ColumnSpec.md)
- [FieldSpec](interfaces/FieldSpec.md)
- [FormSpec](interfaces/FormSpec.md)
- [RenderDetailOptions](interfaces/RenderDetailOptions.md)
- [RenderFormOptions](interfaces/RenderFormOptions.md)
- [RenderSkeletonOptions](interfaces/RenderSkeletonOptions.md)
- [RenderTableOptions](interfaces/RenderTableOptions.md)
- [ShadcnThemeOptions](interfaces/ShadcnThemeOptions.md)
- [SpecOptions](interfaces/SpecOptions.md)
- [TableSpec](interfaces/TableSpec.md)

## Type Aliases

- [FieldWidget](type-aliases/FieldWidget.md)

## Functions

- [formSpec](functions/formSpec.md)
- [renderComponentsJson](functions/renderComponentsJson.md)
- [renderDetailSkeletonTsx](functions/renderDetailSkeletonTsx.md)
- [renderDetailTsx](functions/renderDetailTsx.md)
- [renderFormSkeletonTsx](functions/renderFormSkeletonTsx.md)
- [renderFormTsx](functions/renderFormTsx.md)
- [renderGlobalsCss](functions/renderGlobalsCss.md)
- [renderShadcnTheme](functions/renderShadcnTheme.md)
- [renderTableSkeletonTsx](functions/renderTableSkeletonTsx.md)
- [renderTableTsx](functions/renderTableTsx.md)
- [tableSpec](functions/tableSpec.md)
