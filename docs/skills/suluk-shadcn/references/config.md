# Configuration

## SpecOptions

`@suluk/shadcn` — the UI corner. v4 "Suluk" Schema Objects → shadcn/ui form + table specs and TSX scaffolds.

The chain is: Zod → v4 Schema Object (@suluk/zod) → descriptor model (formSpec/tableSpec, here) → shadcn TSX
(renderFormTsx/renderTableTsx, here). This package is CODEGEN ONLY — no runtime UI deps; it emits component
source as strings against the conventional shadcn/ui import paths (react-hook-form + zodResolver for forms).

Honest-loss discipline (house pattern): the descriptor specs carry a `warnings: string[]` channel for every
property we could not faithfully map (unresolvable $ref, boolean schemas, non-object roots), and the
renderers surface those warnings as a leading comment block. Nothing is dropped silently. CANDIDATE tooling.

### Properties

#### defs

A `$defs`/components map so a top-level or property-level Reference can be resolved by name.

**Type:** `Record<string, SchemaOrRef>`

## RenderFormOptions

### Properties

#### componentName

React component name. Default "GeneratedForm".

**Type:** `string`

#### schemaName

Name of the Zod schema symbol passed to zodResolver. Default "FormSchema".

**Type:** `string`

#### resetOnSuccess

Reset the form after a successful submit (clear-on-success UX). Default true.

**Type:** `boolean`

## RenderTableOptions

### Properties

#### componentName

React component name. Default "GeneratedTable".

**Type:** `string`

## RenderDetailOptions

### Properties

#### componentName

React component name. Default "GeneratedDetail".

**Type:** `string`

## RenderSkeletonOptions

### Properties

#### componentName

React component name (default per view: GeneratedFormSkeleton / …TableSkeleton / …DetailSkeleton).

**Type:** `string`

#### rows

placeholder row count for the table/detail skeleton (default 5 / fields).

**Type:** `number`

## ShadcnThemeOptions

### Properties

#### style

shadcn style. Default "new-york".

**Type:** `string`

#### baseColor

base color name for components.json. Default "neutral".

**Type:** `string`

#### cssPath

the globals.css path recorded in components.json. Default "src/app/globals.css".

**Type:** `string`

#### darkSelector

the dark-mode selector (shadcn convention is `.dark`; saastarter uses `[data-theme='dark']`). Default ".dark".

**Type:** `string`

#### rsc

React Server Components flag for components.json. Default true.

**Type:** `boolean`