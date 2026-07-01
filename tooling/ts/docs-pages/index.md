---
title: Suluk
---

# Suluk

**One typed contract — projected into your entire stack: API, docs, typed client, UI, tests, admin, and deploy.**

**Suluk** is a candidate exploration of OpenAPI v4 "Moonwalk", built as a framework: you declare your
data and routes **once**, and everything else — the OpenAPI v4 document, Scalar/Swagger docs, a typed
Nano Stores client, generated shadcn UI, request validation, contract tests, a documentation audit, an
admin panel (in your editor *and* on `/superadmin`), and a Cloudflare deploy plan — is **derived** from
it. One source, many projections; they cannot drift because they are the same source.

## The cycle

```text
Drizzle  ──▶  contract (Hono + Zod + Better Auth)  ──▶  v4 document (the hub)
  data                                                          │
                       ┌──────────────────────────────────────┼─────────────────────────────┐
                       ▼                  ▼                    ▼                ▼              ▼
                  Scalar / Swagger   Nano Stores          shadcn UI       contract tests   doc audit
                     (docs)         (client state)          (UI)           (the doc as a    (coverage)
                                                                            check)
        @suluk/builder composes it (pages → sections → blocks → components, contract-narrowing)
        @suluk/deploy ships it to Cloudflare · @suluk/cockpit drives it (vscode + /superadmin)
```

## Explore

**The candidate** — Suluk *as OpenAPI v4.0*:

- **[Specification](specification.md)** — the spec document, object model, signatures, conformance, and the Rust reference core.
- **[EcoSystem vision](ecosystem-vision.md)** — how one typed contract gives rise to a whole framework.

**The ecosystem** — the framework it enables:

- **[Guides](guides.md)** — the 30-second tour, the architecture, and how to contribute.
- **[Packages](packages.md)** — every `@suluk/*` package (each its own complete docs site, with its version).
- **[Registry](registry.md)** — the shadcn registry of own-the-code backend modules.

## The discipline (why it stays coherent)

- **One source, many projections.** The v4 document is the hub; everything is derived from it.
- **Honest losses are enumerated, never silent** — every converter reports what it couldn't carry.
- **Schema Objects are JSON Schema 2020-12 verbatim** across v4 / 3.1 / Zod / Drizzle.
- **Pure logic + thin shells** — the cockpit runs identically in the editor and on `/superadmin`.

> Suluk is a **candidate** exploration of OpenAPI v4 "Moonwalk" — not the official specification.
> This documentation is generated from the packages' source by [TypeDoc](https://typedoc.org) and
> hosted on GitHub Pages.
