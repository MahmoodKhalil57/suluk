---
title: Contributing
---

# Contributing

Suluk is a Bun + TypeScript monorepo of small, single-purpose packages (plus a Rust core). Contributions
are welcome — the architecture is designed so each package is independently understandable and testable.

## Set up

```sh
git clone https://github.com/MahmoodKhalil57/suluk
cd suluk && bun install
bun test            # run a package's tests from its dir
```

Every package has `bun test` and `tsc --noEmit` gates. Keep both green.

## How the code is organized

- Each package separates **pure logic** (unit-tested with `bun test`) from a **thin adapter/host shell**
  (duck-typed; type-checked). That's why coverage is high and the host bindings are trivial.
- A new conversion or projection is just a new package that consumes the v4 document (or a Zod/Drizzle
  source) and emits an artifact — follow the shape of `@suluk/scalar` or `@suluk/drizzle`.
- **Enumerate every loss.** If a transform can't carry something, surface it (a `warnings`/`diagnostics`
  array), never drop it silently.
- Keep the **CANDIDATE** labeling — nothing here is the official OpenAPI specification.

## Good first contributions

- A new `DeployProvider` (Vercel, Fly, a Node box) — implement the interface in `@suluk/deploy`.
- A new UI target alongside `@suluk/shadcn` (e.g. a different component kit).
- Richer `@suluk/docs` output, or a second language core (the Rust `suluk-core` is the template).

Open a [discussion](https://github.com/MahmoodKhalil57/suluk/discussions) before large changes, and a
[pull request](https://github.com/MahmoodKhalil57/suluk/pulls) when ready.

## The docs you're reading

This site is regenerated from the packages' source by `@suluk/docs` + [TypeDoc](https://typedoc.org),
built locally and pushed to GitHub Pages — see [Architecture](architecture.md) for the pipeline. The API
reference under **Modules** is a projection of the code; it cannot drift from what ships.
