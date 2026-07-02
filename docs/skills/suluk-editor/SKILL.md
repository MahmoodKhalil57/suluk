---
description: "A fully-static, client-only OpenAPI v4 EDITOR (the editor.scalar.com analog, native v4). Two panes: a CodeMirror source editor + a live API reference rendered by the suluk Scalar fork; diagnostics from @suluk/core + @suluk/harden; 3.1→v4 upgrade via @suluk/openapi-compat; v4 superpowers (cost/access/hardening) in the preview. No server: parse→validate→harden→enrich→re-mount all run in the browser. editorHtml() emits a self-contained page; the built client bundle ships in dist/. CANDIDATE tooling."
name: suluk-editor
---

# @suluk/editor

A fully-static, client-only OpenAPI v4 EDITOR (the editor.scalar.com analog, native v4). Two panes: a CodeMirror source editor + a live API reference rendered by the suluk Scalar fork; diagnostics from @suluk/core + @suluk/harden; 3.1→v4 upgrade via @suluk/openapi-compat; v4 superpowers (cost/access/hardening) in the preview. No server: parse→validate→harden→enrich→re-mount all run in the browser. editorHtml() emits a self-contained page; the built client bundle ships in dist/. CANDIDATE tooling.

## Quick Start

```ts
import { editorHtml, editorResponse } from "@suluk/editor";

// As a string (Bun.serve / Astro / anywhere):
const html = editorHtml({
  brand: "Suluk",
  forkSrc: "/vendor/scalar/standalone-suluk.js", // the suluk Scalar fork (defines window.Scalar)
  clientSrc: "/editor.client.js",                // this package's dist bundle, served as a static asset
});

// Or as a Response (Workers / Hono):
app.get("/", () => editorResponse());
```

## Configuration

**EditorOptions** (8 options — see references/config.md)

## Quick Reference

`editorHtml` (Build the self-contained editor page), `editorResponse` (The editor page as a text/html Response (Workers / Bun)
**examples:** `EditorExample` (Seed documents the editor can open with), `examples`, `defaultExample`

## References

Load these on demand — do NOT read all at once:

- When calling any function → read `references/functions.md` for full signatures, parameters, and return types
- When defining typed variables or function parameters → read `references/types.md`
- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults

## Links

- [Repository](https://github.com/MahmoodKhalil57/suluk)