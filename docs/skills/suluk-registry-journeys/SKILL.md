---
description: Reference tooling for the OpenAPI v4.0 Suluk candidate.
name: suluk-registry-journeys
---

# suluk

Reference tooling for the OpenAPI v4.0 Suluk candidate.

## Configuration

**JourneysConfig** — Journeys config (Suluk registry: `journeys`) — where the BDD harness finds your contract + your authored `.feature`
stories. `@suluk/journeys` projects a step VOCABULARY from the v4 contract, binds your Gherkin against it (exact-or-
unbound), grades coverage, and can emit a runnable `bun:test` suite through `@suluk/sdk`'s generated client. This file
is the owned wiring the harness (`src/journeys.test.ts`) reads. Point `contractPath` at your generated v4 doc. (3 options — see references/config.md)

## Quick Reference

**journeys.config:** `default`

## References

Load these on demand — do NOT read all at once:

- When using exported constants → read `references/variables.md`
- When configuring options → read `references/config.md` for all settings and defaults