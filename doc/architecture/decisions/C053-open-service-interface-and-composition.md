# C53. The open Service interface — typed 2×2 opts, system/brand split, and port/capability composition

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Operator-surfaced across four turns: *"platform.config.ts
> should carry more information so its author can one-shot the base for platforms with the complexity of toolfactory …
> create a COMMON INTERFACE that defines what each core service is, so other users can extend it with custom opts and still
> give control to the platform.config.ts author"* → *"brandOpts vs serviceOpts"* (per-service axis) → *"a globalBrandOpts and
> globalServiceOpts"* (the global axis) → *"opts should also configure how the services work with each other, not just within
> itself"* (composition). Grounded in a 13-agent judge-panel design workflow (4 independent stances → parallel judge +
> adversarial-break per stance → synthesis; ~969k tokens). **Extends [C051](C051-platform-generator.md)** (the manifest
> generator) and is governed by [C052](C052-npm-vs-registry-boundary.md) ("own the wiring, npm the logic").

Date: 2026-07-01

## Status

Accepted as the **DESIGN** — architecture-only, **nothing built yet** (operator chose "record C053 first"). Ceiling **0.5**:
the design is grounded in a rigorous adversarial panel and operator-ratified on the composition crux, but **zero code is
written**, and its two load-bearing promises — **byte-identical regeneration of autotoolfactory** and the **env-threading of
the auth→credits closure** — are *asserted-by-design*, provable only by the Phase-0 golden test and the Phase-3 seam-pinning
respectively. Ledger: [`0service-interface.bn`](../../../plan/facts/0service-interface.bn) (burhan True). Not a contract-facet
change (it is a generator/authoring-surface change; the emitted contract is unaffected).

## Context — the closed catalog is the constraint

Today (C051) a "service" is a fixed `CatalogEntry { mount, provision?, deps?, env? }` in a **closed** `CATALOG: Record<string,
CatalogEntry>` baked into `@suluk/platform`; `opts` is an untyped `Record<string, Record<string, unknown>>` threaded only for
`auth.mcp`; `services: string[]` can name only what ships in the box; and inter-service wiring (auth→credits signup grant,
etc.) is **hardcoded inside the module bodies**, not configurable from the manifest. So a community shadcn registry cannot add
a service the generator understands, the author gets no type-safety on opts, and the *composition graph* — where a
toolfactory-complexity platform's real complexity lives — is not author-controlled.

## Decision — the open Service model

A capability the manifest author configures is now modelled on **two surfaces**: **node opts** (config within a service / the
whole system, a 2×2 matrix) and **edge opts** (how services compose). Both are typed; the untyped `opts` blob and the flat
`vars` map are *replaced* by this model (with a strict back-compat subset).

### 1. The common interface — `defineService<SO, BO>`

```ts
export interface Service<SO = {}, BO = {}> {
  readonly id: string;                    // "auth" | "acme.analytics"
  readonly registry?: string;             // owning registry (multi-registry); default = the manifest's core alias
  readonly mount: Mount;                   // UNCHANGED union {base|middleware|route|dev}
  readonly provision?: { symbol: string; from: string };
  readonly deps?: string[];
  readonly env?: EnvVar[];
  readonly serviceOpts?: Schema<SO, SO>;  // how THIS service works       → ENTRY (mount 2nd arg)
  readonly brandOpts?:   Schema<BO, BO>;  // THIS service's brand-facing  → [vars]/env (default) | ENTRY (dest:entry)
  readonly reads?: { globalService?: string[]; globalBrand?: string[] };  // which globals it consumes
  readonly compose?: CompositionSurface;  // ports it EXPOSES + capabilities it OFFERS
}
```

`Schema<T>` is the **Standard-Schema** interface (zod v4 implements it; zod is a **peerDependency** to avoid duplicate-instance
`instanceof` failures). The 19 core catalog entries become `defineService(...)` values (**dogfood**); the old `CATALOG` stays a
*derived view* (`toCatalogEntry(service)`) with a generation-time keys-equality drift assertion, so `collectEnv` /
`orderServices` / `buildPackageJson` / `buildProvisionConfig` are unchanged.

### 2. The manifest — `defineSystem` + `defineBrand`

`platform.config.ts` factors into a **SYSTEM** (the reusable, publishable template) and a **BRAND** (thin, swappable):

```ts
export const system = defineSystem({
  registries: { core: "MahmoodKhalil57/suluk", acme: "acme/suluk-analytics" },
  services: [authService, "contract", creditsService, emailService, analyticsService],
  globalServiceOpts: { apiBase: "/api", environment: "production", trustedOrigins: ["https://tf.app"] },
  serviceOpts: { auth: { mcp: { /* …typed by service id… */ } }, "acme.analytics": { sampleRate: 0.25 } },
  wire: [ { id: "signup-grant", from: "auth.onUserCreated", to: "credits.grantOnSignup", with: { amount: 100 } } ],
});
export const brand = defineBrand({ name: "toolfactory",
  globalBrandOpts: { BRAND_NAME: "ToolFactory", baseUrl: "https://tf.app", SIGNUP_GRANT: "100" } });
export default definePlatform({ system, brand });
```

`defineSystem<const T>` is generic over the services tuple, so `serviceOpts` and every `wire` endpoint **autocomplete off the
imported Service objects** — variadic-tuple inference, **no codegen**. The legacy single-object `PlatformManifest` +
`definePlatform(manifest)` stay valid **forever** (a strict subset, see byte-identity).

### 3. Node opts — the 2×2 matrix

|  | **per-service** | **global** |
|---|---|---|
| **service axis** (how it works) | `Service.serviceOpts` → **entry** (mount 2nd arg) | `SystemManifest.globalServiceOpts` → **entry-inert** unless a mount opts-in via `reads`; env-shaped keys mirror to `[vars]` |
| **brand axis** (business identity) | `Service.brandOpts` → **`[vars]`** (default) / entry if `dest:entry` | `BrandManifest.globalBrandOpts` → **`[vars]`** |

**Precedence** (later wins, per service): schema defaults → the read global (only keys named in `reads`) → per-service opts →
legacy `opts[id]` **last, lowest** for back-compat only (a lint warns when legacy and new both set a key). Origin-derived
fields (`auth.mcp.loginPage/consentPage/resource`, `trustedOrigins`) are **templated from `globalBrandOpts.baseUrl`** so a
rebrand of the *same system* never ships the prior brand's domain.

### 4. Edge opts — composition (operator-ratified: **port/capability DI, rendered into the producer's mount-opt field**)

A service `compose`s by **exposing typed ports** (hooks others fill) and **offering typed capabilities** (fillers). A
`WireDecl { from: "<svc>.<port>", to: "<svc>.<cap>", with?, id? }` binds them, **typed against both endpoints** via the
variadic-tuple `WireDecl<PortRefs<T>, CapRefs<T>>`. Fan-out is a flat array (multiple entries share a `from`, rendered in array
order = execution order). `resolveWiring` validates **presence** (both services + port + cap selected), **compatibility**
(`with` parsed against the cap schema + a compile error via the typed decl), and **ordering + acyclicity** (Kahn topo over
`after` + producer→consumer arcs; throws on a cycle).

**The decisive mechanism (confirmed):** a bound edge renders **into the producer port's existing mount-opt field, never a
separate post-route `wire()` statement.** For `auth.onUserCreated ← credits.grantOnSignup { amount: 100 }`:

```ts
mountAuthRoutes(app, { mcp: {…}, onUserCreated: async (userId) => {
  await run(env, Effect.flatMap(Credits, (s) => s.grant(userId, Number(env.SIGNUP_GRANT ?? 100), `signup:${userId}`, "signup grant")));
} });
```

This reuses a seam that **already exists** in `registry/auth/auth.ts` (`onUserCreated?: (userId) => Promise<void>`) — so no
invented module singletons, and the closure gets a real `env` binding from the Better-Auth `databaseHook` context. **Zero
wires on a port → no hook field → byte-identical.** Communities offer capabilities or expose ports symmetrically — no
`@suluk` fork. Edge params are **SYSTEM by default**; a param marked `.meta({ brand: true, env: "KEY" })` is brand-tunable
(reads `[vars]`, `Number(env.KEY ?? default)`), with an `assertNumber(env.KEY)` startup guard (no silent NaN on a money path).

### 5. Safe rendering — two rails

Author input is **data**, framework input is **code shape**. **Rail 1 (values):** every opts/edge value reaches source only via
`lit(v) = JSON.stringify(parse(schema, v))` (a schema-validated JSON value → an inert JSON literal; `assertJsonSafe` rejects
functions/symbols/`__proto__`). **Rail 2 (identifiers/code):** every symbol, import path, port/cap name, and code template
(`Port.render`, `Capability.build`) comes only from the **trusted** Service definition (core catalog or an imported
companion), never manifest free text; `validateIdentifier` + a path regex fail closed. Residual trust (a hostile community npm
symbol runs at signup) equals the trust `shadcn add` already grants to place files — not a new hole.

### 6. Extension — two channels

**npm companion** (`@acme/suluk-analytics` exporting `defineService(...)`) is the **type-bearing** surface (schemas + compose
contract, versioned with the code, zero-codegen types). The **shadcn registry item** carries the **file set** + a small
`suluk` discovery block, *emitted from the companion* (`suluk-platform emit-registry`) so the two can't drift. The load-bearing
contract is the exported Service object; the JSON block is a fallback (types degrade to `unknown`, documented). Multi-registry:
`registries` is an alias map; a duplicate-id guard throws at plan time (a community id must be dotted, e.g. `acme.analytics`).

## Recommended fork resolutions

| Fork | Options | Recommendation |
|---|---|---|
| Extension surface | companion / registry-json / hybrid | **Hybrid, companion load-bearing** (JSON can't type generics; its `.d.ts` is stale-by-construction) |
| Manifest shape | single file / system+brand split | **system/brand split** (delivers the reuse property), single-file legacy kept forever |
| Composition | explicit-wire / **port-capability DI** / registry-hooks | **port/capability DI, render-into-mount-opt** *(operator-confirmed)* |
| Validation | zod / bare TS / structural | **zod v4 via Standard-Schema, peerDependency** |
| Precedence + ambiguous opts | legacy-lowest+lint / per-service>global / templated origins | **All three** |

## Build plan (recommended, NOT yet built)

- **Phase 0 — golden-file lock** *(low)*: snapshot autotoolfactory's `src/index.ts` + `provision.config.ts` + `wrangler.toml`
  + `package.json` + `.env.example` from the current **and the installed published** generator, pinned byte-for-byte. The
  guardrail every later phase runs against (the C051 one-shot invariant).
- **Phase 1 — dogfood core catalog to `defineService`, byte-identical** *(high)*: `service.ts`; 19 entries → `CORE_SERVICES`
  with passthrough **superset** schemas (no new defaults) + compose surfaces; old `CATALOG` a derived view + drift assertion.
- **Phase 2 — typed 2×2 node quadrants + `defineSystem`/`defineBrand` + `liftLegacy`** *(medium)*: `resolve.ts` (precedence +
  dest routing + `varsFromOpts`); `definePlatform` overloaded; golden test green on legacy AND migrated.
- **Phase 3 — port/capability composition engine** *(medium)*: `wire.ts` (typed endpoints, `resolveWiring`, render-into-mount);
  **pin the env-threading seam here** before freezing the Port interface; `DEFAULT_CORE_WIRES` gated off.
- **Phase 4 — multi-registry + community system with a community EDGE, rebranded** *(medium)*: alias map + duplicate-id guard +
  companion resolution; a fixture `@acme/suluk-analytics`; prove one system + two brands = identical entry, differing `[vars]`.
- **Phase 5 — migrate codemod, docs, ADR finalize, publish** *(low)*: `suluk-platform migrate` + `emit-registry`; re-run the
  C051 one-shot from the installed generator; bump + publish.

## Open questions (honest boundaries)

1. **Env threading precision.** `registry/auth/auth.ts` currently invokes `onUserCreated` as `(u) => opts.onUserCreated(u.id)`
   — signature `(userId) => Promise<void>`, **no `env` passed**. Phase 3 must decide: (a) widen the auth seam to `(userId,
   env)` (a reviewed byte-diff to the owned module) or (b) resolve `env` from a request-context in the capability. This is the
   one place the render contract must be pinned to the real signature before the Port/Capability interface freezes.
2. **Cross-cutting / aspect edges don't fit the pairwise shape.** `contract → all /api routes` (already a middleware mount,
   needs no wiring) and `erasure → credits/keys/billing/logs` (an ordered leaf-first *set* delete) are not producer→consumer
   pairs. Leave them module-internal for now (neither is in the generated entry today → byte-identity unaffected) or design an
   "aspect" edge kind later.
3. **Registry-fallback typing.** A community service resolved via the registry `suluk` block (no companion installed) degrades
   `serviceOpts` to `unknown`. Is companion-import-for-full-typing acceptable, or is a JSON-Schema→`.d.ts` second path needed?
4. **Mount union ceiling.** A community service needing a Workers queue / DO / cron / scheduled handler, two routes, or
   path-scoped middleware cannot be expressed by the frozen `{base|middleware|route|dev}` `Mount`. Widen to `mounts: Mount[]`
   + a guarded `{kind:"custom", render}` in a follow-up, or declare it out of scope for C053.
5. **GSO-into-mount codegen.** For a *new* system where a service reads a `globalServiceOpts` key into its mount, the mount
   symbol must be generated to accept it — which core mounts (if any) opt in, and does that edit their owned registry modules?

## Consequences

- **The manifest becomes the surface for the whole product, not just the service list** — node config (both axes, both
  scopes) *and* the composition graph. A toolfactory-complexity platform (its request-time hook edges included) becomes
  one-shottable; the aspect edges (Q2) are the honest exception.
- **A SYSTEM is publishable and rebrandable by swapping only the BRAND** — generated entry *code* is byte-identical across
  brands (origin fields templated from `baseUrl`), only `[vars]`/env differ. This is the white-label / franchise axis.
- **Communities extend services *and* composition without forking `@suluk` logic** (C052 holds: the generator owns the wiring,
  the packages own the logic).
- **The incumbent never breaks** — legacy `PlatformManifest` is a strict subset through the same renderers, gated by Phase 0.
- Extends C051; cites C052. A future `Cxxx` records the *built* outcome (this ADR records the *decision*); the ceiling lifts as
  Phase 0/1 prove byte-identity and Phase 3 pins the env seam.
