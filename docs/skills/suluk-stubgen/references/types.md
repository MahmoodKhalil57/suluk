# Types & Enums

## Types

### `StubField`
`@suluk/stubgen` — turn a NEEDS-CONTRACT gap (a tester pre-wrote a scenario the contract can't back yet) into
honestly-provisional backend STUBS the maintainer then writes pragmatically.

Two halves, per C040-P3:
  • the CONTRACT half is GENERIC — a `@suluk/hono` RouteContract literal (method/path/name inferred from the intent;
    request Zod inferred from the gap's Examples columns; responses a placeholder), every inference tagged
    `// TODO: tighten` — the inferred Zod is LOSSY by construction and the maintainer owns the final schema (never
    laundered as authoritative).
  • the HANDLER half goes through a `HandlerTarget` ADAPTER SEAM (mirroring @suluk/deploy's DeployProvider / the C034
    runtime seam), because the handler idiom is app-specific. The first adapter is `honoEffectTarget` (the toolfactory
    Effect + run() + RouteError<name> shape); `honoTarget` is a framework-generic fallback.

Zero-dependency + pure (source-text out): @suluk/core never imports this; this imports nothing.
**Properties:**
- `name: string`
- `zod: string` — the inferred Zod expression, e.g. `z.string()`.
- `tsType: string` — the inferred TS type, e.g. `string`.

### `StubGap`
The input: a gap the contract cannot back, optionally with the Examples columns that hint the request shape.
**Properties:**
- `intent: string` — the authored intent — the When step text, e.g. "I refund a charge".
- `fields: { name: string; sample?: string }[]` (optional) — the Examples columns (request field names) + an optional sample cell for type inference.
- `name: string` (optional) — explicit overrides (else inferred from `intent`).
- `method: string` (optional)
- `path: string` (optional)

### `StubSpec`
The resolved, renderable stub.
**Properties:**
- `name: string`
- `method: string`
- `path: string`
- `intent: string`
- `fields: StubField[]`

### `HandlerTarget`
The handler-emit adapter seam — a target renders the HANDLER half in its app's idiom.
**Properties:**
- `name: string`

### `GeneratedStub`
**Properties:**
- `name: string`
- `spec: StubSpec`
- `contract: string`
- `handler: string`
