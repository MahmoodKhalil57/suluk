---
description: "Lossless-where-representable conversion between Zod schemas and OpenAPI v4 'Suluk' Schema Objects (JSON Schema 2020-12). Zod is the source of truth; v4 is the interchange. CANDIDATE tooling."
name: suluk-zod
---

# @suluk/zod

Lossless-where-representable conversion between Zod schemas and OpenAPI v4 'Suluk' Schema Objects (JSON Schema 2020-12). Zod is the source of truth; v4 is the interchange. CANDIDATE tooling.

## Quick Start

```ts
import { zodToV4 } from "@suluk/zod";
import * as z from "zod";

const User = z.object({
  name: z.string().min(2),
  email: z.email(),
  age: z.number().int().optional(),
  role: z.enum(["admin", "user"]),
});

const { schema, warnings } = zodToV4(User);
// schema  → a v4 Schema Object (JSON Schema 2020-12), no `$schema` marker
// warnings → [] (fully lossless — nothing was dropped)
```

## Configuration

**V4ToZodOptions** (1 options — see references/config.md)

## Quick Reference

**to-v4:** `zodToV4` (Convert a Zod schema to a v4 Schema Object), `ZodToV4Result` (`@suluk/zod` — Zod ⇄ v4 "Suluk" Schema Object conversion)
**to-zod:** `v4ToZod` (Convert a v4 Schema Object to a Zod schema), `convert` (Core recursive conversion of one v4/JSON-Schema node to a Zod type)
**lexical:** `LexicalState`, `lexicalSchema` (The serialized Lexical editor state — `{ root: { children: [), `lexicalNodeSchema` (A single Lexical node — recursive + open (each node type carries its own extra fields; we keep the common ones)), `LEXICAL_V4_SCHEMA` (The v4 (JSON Schema 2020-12) projection of a Lexical state — recursive via a `$defs)

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)