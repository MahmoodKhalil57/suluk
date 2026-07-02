---
description: "v4 'Suluk' Schema Objects -> shadcn/ui form + table specs and TSX scaffolds (react-hook-form + zodResolver). Codegen, no runtime UI deps. CANDIDATE tooling."
name: suluk-shadcn
---

# @suluk/shadcn

v4 'Suluk' Schema Objects -> shadcn/ui form + table specs and TSX scaffolds (react-hook-form + zodResolver). Codegen, no runtime UI deps. CANDIDATE tooling.

## Quick Start

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

## Configuration

6 configuration interfaces — see references/config.md for details.

## Quick Reference

**spec:** `formSpec` (Build a FormSpec from an object Schema Object), `tableSpec` (Build a TableSpec), `FieldWidget` (The shadcn form control we pick for a property), `FieldSpec` (One form control, derived from a single object property), `FormSpec` (`@suluk/shadcn` — the UI corner), `ColumnSpec` (One table column, derived from a single object property), `TableSpec` (`@suluk/shadcn` — the UI corner)
**render-form:** `renderFormTsx` (Render a shadcn <Form> component from a FormSpec)
**render-table:** `renderTableTsx` (Render a shadcn <Table> component from a TableSpec)
**render-detail:** `renderDetailTsx` (Render a read-only shadcn detail (show) view from a FormSpec)
**render-skeleton:** `renderFormSkeletonTsx` (A form skeleton — one label+control placeholder per field, plus a submit-button placeholder), `renderTableSkeletonTsx` (A table skeleton — a header row of column placeholders + N body rows of cell placeholders), `renderDetailSkeletonTsx` (A detail skeleton — one label+value placeholder row per field)
**theme:** `renderShadcnTheme` (The full shadcn theme file set from a TokenSpec/ThemeSpec: the css path → globals), `renderGlobalsCss` (The shadcn `globals), `renderComponentsJson` (The shadcn `components)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)