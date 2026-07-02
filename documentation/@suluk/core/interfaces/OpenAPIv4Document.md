[**Suluk**](../../../README.md)

***

[Suluk](../../../packages.md) / [@suluk/core](../README.md) / OpenAPIv4Document

# Interface: OpenAPIv4Document

Defined in: [types.ts:13](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L13)

Top-level OpenAPI v4 document.

## Indexable

> \[`ext`: `` `x-${string}` ``\]: `unknown`

## Properties

### apiResponses?

> `optional` **apiResponses?**: `Record`\<`string`, [`Response`](Response.md)\>

Defined in: [types.ts:23](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L23)

Document-level responses reusable across all operations (§5).

***

### components?

> `optional` **components?**: [`Components`](Components.md)

Defined in: [types.ts:72](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L72)

***

### info

> **info**: [`Info`](Info.md)

Defined in: [types.ts:16](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L16)

***

### openapi

> **openapi**: `string`

Defined in: [types.ts:15](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L15)

e.g. "4.0.0-candidate".

***

### paths

> **paths**: `Record`\<`string`, [`PathItem`](PathItem.md)\>

Defined in: [types.ts:21](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L21)

Map keyed by RFC6570 parseable-profile uriTemplate (C005).

***

### servers?

> `optional` **servers?**: [`Server`](Server.md)[]

Defined in: [types.ts:17](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L17)

***

### tags?

> `optional` **tags?**: `Record`\<`string`, [`Tag`](Tag.md)\>

Defined in: [types.ts:19](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L19)

Map keyed by tag name (C009).

***

### webhooks?

> `optional` **webhooks?**: `Record`\<`string`, [`Request`](Request.md)\>

Defined in: [types.ts:25](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L25)

Incoming operations not hosted at the API's own paths (§14, C018).

***

### x-suluk-agents?

> `optional` **x-suluk-agents?**: `Record`\<`string`, [`SulukAgent`](SulukAgent.md)\>

Defined in: [types.ts:42](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L42)

AGENTS vendor map (C027) — `x-suluk-agents`. A composition manifest layered ON TOP of the API: each SulukAgent
is an LLM-orchestrated unit of SKILLS (model-bearing instruction bundles) + deterministic ROUTES (by-name
$refs into EXISTING operations, no `model`) + optional sub-AGENTS (by-name refs; recursion bounded by a
REQUIRED `maxDepth` + a cycle-linter, never the schema). A VENDOR EXTENSION riding the C025 `x-suluk-jobs`
precedent EXACTLY — NOT a normative kind, NEVER read by the DOM→ADA matcher (D1 held; see
plan/facts/0agents-d1.bn + test/agents-d1-invariance.test.ts). Selection/tiering is RUNTIME-ADVISORY;
determinism is DECLARED, never enforced. Severable: a 3.1 downgrade DROPS this map whole and the routes
survive as the ordinary operations they always referenced. Originated, low ceiling (~0.52); pairs with ADR C027.

***

### x-suluk-jobs?

> `optional` **x-suluk-jobs?**: `Record`\<`string`, [`SulukJob`](SulukJob.md)\>

Defined in: [types.ts:31](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L31)

JOBS vendor map (C025) — non-HTTP background work (cron / queue consumers) that has NO inbound Request, so it
can't live in `paths` or `webhooks`. The first-class home C024 pre-blessed for its `scheduled`/`queue-consumed`
cost triggers. A VENDOR EXTENSION (the `x-suluk-*` namespace) — NOT a normative async construct (C018 scope held).

***

### x-suluk-notify?

> `optional` **x-suluk-notify?**: [`SulukNotifyPolicy`](../type-aliases/SulukNotifyPolicy.md)

Defined in: [types.ts:71](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L71)

REACTIVE notify policy (C037) — `x-suluk-notify`. A document-level status→severity map that drives the CALLBACK
layer of the `@suluk/sdk` reactive client: which responses surface to the user, and how. CLIENT-CODEGEN ONLY —
read by NO server path, NO runtime, NO matcher; strictly weaker than every other x-suluk-* facet (those at least
feed runtime-advisory selection). Optional, additive, NO new normative kind, NO meta-schema change. Pairs with the
per-op `x-suluk-store` facet + ADR C037. Originated, low ceiling (~0.5).

***

### x-suluk-policy?

> `optional` **x-suluk-policy?**: `Record`\<`string`, [`SulukPolicy`](SulukPolicy.md)\>

Defined in: [types.ts:52](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L52)

POLICY vendor map (C028) — `x-suluk-policy`, keyed by OPERATOR/fleet name (not agent name: the operator owns
it, one policy spans many third-party agents). An operator-owned governance overlay that NARROWS what an agent
self-declares (effective = INTERSECT(operatorPolicy, agentSelfDeclaration); monotone — never grants). Rides the
x-suluk-jobs/x-suluk-agents move EXACTLY: optional, additive, NO new normative kind, NEVER read by the matcher
(D1; see plan/facts/0policy-d1.bn + test/policy-d1-invariance.test.ts). Only the STATIC subset is decidable here;
the `costCeiling` is DECLARED, enforced by a runtime adapter (`enforcedBy`), never by the schema. Originated, low
ceiling (~0.52); pairs with ADR C028.

***

### x-suluk-resources?

> `optional` **x-suluk-resources?**: `Record`\<`string`, [`SulukResource`](SulukResource.md)\>

Defined in: [types.ts:63](https://github.com/MahmoodKhalil57/suluk/blob/3b4775136ad954f568d9664f2104b2703bb7a4fa/tooling/ts/packages/core/src/types.ts#L63)

RESOURCES vendor map (C036) — `x-suluk-resources`. The loadable, on-demand CATALOG of instructions / references /
scripts an agent can ACTIVATE when a task matches (Cloudflare "Agent Skills" / loadable context-memory alignment;
this is the `x-suluk-resources` name C035 RESERVED, now defined by operator direction). Distinct from a `skill`
(model-bearing, always-on system text): a resource is content-only, lazy, and carries no model. Rides the
x-suluk-jobs/agents/policy move EXACTLY — optional, additive, NO new normative kind, NEVER read by the matcher
(D1; a new x-* sibling is invisible to buildAda — see test/resources-d1-invariance.test.ts). Content is a
PROVENANCE POINTER (the catalog/SKILL.md is GENERATED, hashed for drift), never inlined. Experimental-anchored
(CF Agent Skills + script execution are experimental) ⇒ honestly LOW ceiling (~0.5); pairs with ADR C036.
