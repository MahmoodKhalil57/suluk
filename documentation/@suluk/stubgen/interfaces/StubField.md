[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/stubgen](../README.md) / StubField

# Interface: StubField

Defined in: [index.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/stubgen/src/index.ts#L17)

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

## Properties

### name

> **name**: `string`

Defined in: [index.ts:18](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/stubgen/src/index.ts#L18)

***

### tsType

> **tsType**: `string`

Defined in: [index.ts:22](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/stubgen/src/index.ts#L22)

the inferred TS type, e.g. `string`.

***

### zod

> **zod**: `string`

Defined in: [index.ts:20](https://github.com/MahmoodKhalil57/suluk/blob/472537fcba70c073d9cdb30b69f1e212ccaabf6a/tooling/ts/packages/stubgen/src/index.ts#L20)

the inferred Zod expression, e.g. `z.string()`.
