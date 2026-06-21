# @suluk/editor

A fully-static, **client-only OpenAPI v4 editor** — the [editor.scalar.com](https://editor.scalar.com) analog, but
native to the Suluk candidate **v4** shape (named `requests` maps, `parameterSchema`, the `4.0.0-candidate` identity,
and the `x-suluk-*` facets). Two panes: a CodeMirror source editor on the left, a **live** API reference on the right
(rendered by the suluk Scalar fork), with a diagnostics bar below.

Everything runs in the browser. The page loads two scripts — the Scalar fork bundle (defines `window.Scalar`) and this
package's pre-built client bundle — and then, on every edit, does `parse → validate (@suluk/core) → harden
(@suluk/harden) → enrich (@suluk/scalar) → re-mount the preview`. There are **no server calls**. See
[ADR C033](../../../../doc/architecture/decisions/C033-suluk-editor-thin-shell.md).

## What it does

- **Live native-v4 preview** — the fork ingests v4 as v4. It shows what a 3.x editor structurally cannot: multiple
  named requests sharing one method on one path, per-operation cost (`x-suluk-cost`) and access (`x-suluk-access`).
- **Diagnostics** — `@suluk/core` validation in the lint gutter + a bottom bar, plus the `@suluk/harden` A–F grade.
- **3.1 → v4 upgrade** — paste a standard OpenAPI 3.1 document, one click converts it to v4 (`@suluk/openapi-compat`).
- **Show as 3.1** — an honest downgrade preview that lists exactly what v4 features 3.1 cannot represent.
- **JSON / YAML** — edit in either; one toggle re-serializes.
- **Examples + `?url=`** — open the bundled examples or load any remote v4/3.1 document.
- **Share + autosave** — a self-contained permalink (the whole doc, gzipped, in the URL hash) and localStorage autosave.

## Usage

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

Host **three** static assets: the page (from `editorHtml()`), the fork bundle (`forkSrc`), and this package's client
bundle — the prebuilt `dist/editor.client.js` file (resolvable as the `@suluk/editor/client` export).

The seed documents are exported too, so you can supply your own Examples dropdown:

```ts
import { editorHtml } from "@suluk/editor";
import { examples, defaultExample, type EditorExample } from "@suluk/editor/examples";

const mine: EditorExample[] = [{ id: "mine", label: "My API", doc: { openapi: "4.0.0-candidate", /* … */ } }];
const html = editorHtml({ examples: [...examples, ...mine], initialDoc: defaultExample.doc });
```

> Sub-paths: `@suluk/editor` (the page builders + the example exports), `@suluk/editor/examples` (the seed documents
> on their own), and `@suluk/editor/client` (the prebuilt browser bundle to serve as `clientSrc`).

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `pageTitle` | `"<brand> — OpenAPI v4 editor"` | `<title>` |
| `brand` | `"Suluk"` | toolbar heading |
| `forkSrc` | `/vendor/scalar/standalone-suluk.js` | Scalar fork bundle URL |
| `clientSrc` | `/editor.client.js` | this package's client bundle URL |
| `examples` | the bundled examples | Examples dropdown contents |
| `initialDoc` | the Suluk Galaxy example | document opened when there's no `?url=`, `#share`, or saved draft |
| `faviconHref`, `customCss` | — | page chrome |

## Building the client bundle

```sh
bun run build:client   # → dist/editor.client.js (CodeMirror + the @suluk pipeline, browser target)
```

The bundle is committed so consumers don't need a build step. Rebuild it when the client code or its deps change.

## Boundary

This package is the *shell*. The render engine is the suluk Scalar fork (`tooling/ts/scalar-fork`), and all validation
/ audit / conversion is reused verbatim from `@suluk/core`, `@suluk/harden`, and `@suluk/openapi-compat` — in the
browser. Nothing of upstream `scalar-app` is forked; see C033 for why.

CANDIDATE tooling — part of the Suluk OpenAPI v4.0 candidate, not a SIG deliverable.
