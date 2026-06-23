# Suluk Architecture Documentation

This directory documents the Suluk candidate's architecture, primarily by using Architectural Decision Records (ADRs). It holds two ADR families: the **inherited SIG ADRs** (numbered `000x`, carried over from the upstream OpenAPI Moonwalk effort) and the **Suluk candidate-fork ADRs** (numbered `Cxxx`).

ADRs are stored in the [decisions](./decisions) directory, and should be created and managed using the [adr-tools](https://github.com/npryce/adr-tools) scripts which can be installed on any operating system.  For those wishing to create ADRs manually, the [template](./decisions/template.md) is also provided.

Supplemental material that is not part of a decision, such as examples or more detailed explorations of relevant topics, can be added in this directory rather than the decisions directory.

## Supplemental documents

- [saastarter-parity-roadmap.md](./saastarter-parity-roadmap.md) — where each saastarter feature belongs in the `@suluk/*` ecosystem (extract vs extend vs keep app-side).
- [saasuluk-surpass-saastarter-plan.md](./saasuluk-surpass-saastarter-plan.md) — the plan to take saasuluk past saastarter parity.
- [cloudflare-agents-roadmap.md](./cloudflare-agents-roadmap.md) — staged plan (measure → high-value/low-risk → conditional generator) for a Cloudflare Agents SDK runtime story across `@suluk/agents` + `@suluk/deploy`/`@suluk/cloudflare` + `@suluk/harden`.

