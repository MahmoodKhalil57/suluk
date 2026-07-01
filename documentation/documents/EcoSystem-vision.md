[**Suluk**](../README.md)

***

[Suluk](../packages.md) / EcoSystem vision

# EcoSystem vision

Suluk is two things at once.

**Layer 1 — the candidate specification.** An independent, single-contributor draft of OpenAPI v4.0 "Moonwalk" — the object model, request signatures, parameters, responses, schemas, components, and security. See the [Specification](Specification.md).

**Layer 2 — the ecosystem it makes possible.** Because the v4 document is a single typed contract, everything else can be **derived** from it — the API, a typed client, generated UI, contract tests, an admin panel, a Cloudflare deploy plan. That derivation *is* the framework:

- a family of small **[`@suluk/*` packages](packages.md)** (the money/security/correctness **logic**),
- a **[shadcn registry](Registry.md)** of own-the-code backend modules (the app-owned **wiring**), and
- declarative provisioning (`@suluk/provision`) + a manifest generator (`@suluk/platform`) that assembles a whole backend from one `definePlatform` call.

**One source, many projections; they cannot drift because they are the same source.** The boundary rule (own the wiring, npm the logic) keeps a fix flowing to every consumer while leaving each app in control of its own routes and policy.

Start with the **[Guides](Guides.md)**, browse the **[Packages](packages.md)** and the **[Registry](Registry.md)**, or read [how it all fits together](documents/Architecture.md).
