# C101 — OSB as a companion/projection: `x-suluk-provision` facet + `deriveInstanceSpecs` (the third `@suluk/core` companion model)

> **Provenance.** A Suluk *candidate* decision (codename `asl-ojs`), authored by the single contributor, grounded in
> burhan/daftar/mizan — **not** a Moonwalk SIG decision. Operator-driven (2026-07-04). The third companion model after
> [C099](C099-typed-json-schema-model.md) (JSON Schema 2020-12) and [C100](C100-cloudevents-asyncapi-model.md)
> (CloudEvents + AsyncAPI). Reference: `@suluk/provision`'s own OSB v2 wire-contract model (`src/types.ts`, grounded in
> `spec.md` + the projected `openapiv3.json`/`openapiv4.json`).

**Status:** BUILT + VERIFIED across the whole ecosystem (every `@suluk/core`/`@suluk/provision` dependent's RUNTIME test
suite green; the facet + projector unit-tested). NOT yet published; NOT yet adopted by a live registry module (no
`registry/services/*` module declares `x-suluk-provision` yet — every existing provision fragment is still hand-authored
`InstanceSpec[]`). Confidence ceiling **0.55** — same honest-boundary shape as C099/C100 at this stage: correctness is
witnessed, durable adoption is not.

## Context

Operator, continuing the C099/C100 pattern: *"can we also use [`@suluk/provision`'s OSB types] to improve our suluk core
type for OSB api compatibility... Treat OSB as a companion/projection generated from the canonical Suluk document: author
domain once, annotate broker intent, generate OSB artifacts. This keeps Suluk the single source of truth while giving the
OSB surface whatever adapter-level extras it needs without polluting the domain model."*

Unlike C099/C100 (both *type* upgrades to an existing generation path — `zodToV4`/`emitAsyncApi` already produced the
target shape), this is architecturally new: OSB describes a genuinely different concern (backing INFRASTRUCTURE — a D1
database, a KV namespace, a scoped token — not an API operation), and historically had **zero** structural link to the
v4 document. A 3-agent research pass (parallel: `@suluk/provision` internals, `@suluk/platform`'s catalog/codegen,
`@suluk/core`'s facet precedents) grounded the design before building, confirming:

1. **The OSB wire-contract section (`Service`/`Plan`/`CatalogResponse`/`ServiceInstanceProvisionRequestBody`/…) in
   `provision/src/types.ts` is purely descriptive** — zero brokers, zero CLI command, zero test constructs one. Every
   concrete Cloudflare broker returns the SEAM's plain `{state, instanceId, outputs}` shape directly. Safe to hoist
   (byte-identical, zero behavior change) — the same starting condition C099's Schema model was in.
2. **Zero prior linkage** between `@suluk/core` (the v4 document) and `@suluk/provision` (infra) — `provision`
   depended on neither `@suluk/core` nor `OpenAPIv4Document` at all.
3. **`defineService`'s "provision" catalog fragment is a `{symbol, from}` pointer** to a registry file exporting a
   literal `InstanceSpec[]`; `@suluk/platform`'s `mergeProvision` combines fragments by `ref`; the generated app's
   `provision.config.ts` is literal TS SOURCE TEXT (`buildProvisionConfig` in `platform/src/plan.ts`) — so any new
   source of `InstanceSpec[]` must remain a plain exported array a registry module can hand to the SAME mechanism,
   not a runtime call the generator's codegen would need to special-case.
4. **`SulukJob` already sanctions per-facet extension** (`x-suluk-cost` rides on its own `[ext: \`x-${string}\`]:
   unknown` index signature) and its `queue` field is *exactly* the kind of declared-name-with-no-real-infra-behind-it
   gap this facet exists to close — but a document-level map (mirroring `x-suluk-jobs` exactly) is the right v0 shape,
   matching every other vendor map in `core/types.ts`; attaching per-job is a legitimate, deliberately deferred extension.

## Decision

**Companion model (in `@suluk/core`, one file — matching the C100 single-file correction).** The OSB v2 wire contract
(`Service`, `Plan`, `CatalogResponse`, `ServiceInstanceProvisionRequestBody`, `ServiceBindingRequest`,
`ServiceBrokerError`, `Context`, `Metadata`, `MaintenanceInfo`, `DashboardClient`, `Schemas`, `OperationState`,
`JsonObject`, …) moves into `core/src/types.ts` as a third, clearly-marked non-normative section — the same
"reference the standard, no dependency" treatment as C099/C100.

**The light facet.** `SulukProvisionInstance` (service/plan/name/params/bind/protected — `InstanceSpec` minus `ref`,
implied by the map key) + the document-level `["x-suluk-provision"]?: Record<string, SulukProvisionInstance>` on
`OpenAPIv4Document`, riding the `x-suluk-jobs`/`agents`/`policy`/`resources` vendor-map precedent exactly. NO OSB wire
ceremony (`dashboard_client`/`maintenance_info`/`schemas`/…) belongs on it, by design — that's the projection layer's
job, keeping the domain model unpolluted per the operator's explicit ask.

**The projector.** `deriveInstanceSpecs(doc: OpenAPIv4Document): InstanceSpec[]`, new in `@suluk/provision`
(`src/derive.ts`) — the direct analog of `emitAsyncApi` living in `@suluk/hono` rather than core (core stays unaware
of any downstream package's "seam"). Reads `doc["x-suluk-provision"]`, produces the package's OWN existing
`InstanceSpec[]` shape unchanged. PURE + total (absent facet → `[]`, mirroring `emitAsyncApi`'s empty-surface case).
Composes with the EXISTING `defineProvision`/`plan`/`mergeProvision` mechanism with **zero changes to
`@suluk/platform`'s codegen** — a registry module can write `export const xProvision = deriveInstanceSpecs(document)`
exactly where it previously hand-wrote the array literal, and nothing downstream needs to know the difference.

**`@suluk/provision` rewired**, matching the C100 hono rewire exactly: its OSB-wire-contract section is now a bare
`export type {...} from "@suluk/core"` (byte-identical values); `OperationState` (used by both the wire contract AND
the seam's `ProvisionResult`/`Broker`) is imported from core too. The seam abstraction (`Broker`/`InstanceSpec`/
`InstanceState`/`ServiceOffering`/`ServicePlan`/`Catalog`/`StateStore`/`BindingSink`) stays local, unchanged — Suluk's
own framework reduction of OSB, not the standard itself. `@suluk/core` added as a real dependency (previously zero).

## Consequences

- `@suluk/core` gains a third companion model (~28 exports) and stays zero-runtime-dependency.
- `@suluk/provision` gains one real new dependency (`@suluk/core`) and one new capability (`deriveInstanceSpecs`) —
  everything else byte-identical; its own 37 pre-existing tests + 5 new ones pass; `@suluk/platform` (which depends on
  `@suluk/provision`) typechecks and tests clean, confirming the rewire is invisible to the generator.
- **D1 held**: a new `test/provision-d1-invariance.test.ts` proves the DOM→ADA matcher is invariant to
  `x-suluk-provision`, mirroring the existing agents/store/resources/policy D1 gates exactly.
- **Deferred:** publish `@suluk/core`/`@suluk/provision`; a live registry module (e.g. `credits`/`auth`) actually
  authoring `x-suluk-provision` instead of a hand-written `InstanceSpec[]`; a per-job attach point (`SulukJob`'s own
  `x-suluk-provision`, given its `queue` field is the concrete motivating case) — deliberately not built now, to avoid
  fragmenting the authoring surface before ANY consumer has used even the document-level form.

Pairs with `plan/facts/0osb-provision-facet.bn`. Builds on C099/C100.

## Note: unrelated concurrent breakage observed during verification

While full-ecosystem-sweeping this change, a PRE-EXISTING, NOT-MINE issue in the shared working tree (a
`HttpStatusCode`-keyed `Record<..., Response>` type on `Request.responses`/`Response.status`/`Components.responses`/
`PathItem.pathResponses`, from a concurrent session's edit — first flagged smaller-scope after C100) has WIDENED to
break `tsc` in 14+ packages (`hono`, `builder`, `agents`, `admin`, `cockpit`, `compat`, `cost`, `drizzle`, `editor`,
`effect`, `scalar`, `swagger`, `vscode`, `better-auth`). Confirmed via error-content inspection: 100% of the ~96 error
lines trace to that one root cause; zero mention `Provision`/`OSB`/`Broker`/`Service`/`Plan`/`CatalogResponse` (this
ADR's own vocabulary). RUNTIME behavior is unaffected everywhere checked (`bun test` green in core/provision/platform/
hono/builder/agents — Bun strips types without full-checking). Not fixed here — out of scope, flagged to the operator.
