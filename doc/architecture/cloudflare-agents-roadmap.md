# Cloudflare Agents SDK → Suluk ecosystem roadmap (runtime placement)

> **Provenance.** Synthesized 2026-06-22 from a working session comparing Cloudflare's Agents SDK
> ([developers.cloudflare.com/agents](https://developers.cloudflare.com/agents/)) against `@suluk/agents`, then
> pressure-testing "should we build a Cloudflare-agent story, and is the convenience worth it?". Grounded in: the
> current `@suluk/*` surface (`@suluk/agents`, `@suluk/mcp`, `@suluk/deploy`, `@suluk/cloudflare`, `@suluk/harden`),
> the Cloudflare ["add to existing project"](https://developers.cloudflare.com/agents/getting-started/add-to-existing-project/)
> requirements, and a **measured** boilerplate ratio from the Cloudflare
> [chat-agent example](https://developers.cloudflare.com/agents/getting-started/build-a-chat-agent/) (~60% wiring /
> ~40% bespoke, and much of that 40% is itself contract-derivable). Respects the L3 line (generators emit owned
> source / projections / host-bindings, **never a hosted runtime** — [C023](./decisions/C023-contract-lifecycle-facets-and-the-L3-line.md)).

## The headline finding

**Cloudflare Agents is a *runtime*; `@suluk/agents` is a *compile-time projection + audit layer*. They barely
overlap and compose cleanly** — Cloudflare *runs* the agent (durable state, WebSockets, scheduling, credentials);
Suluk *describes, lints, signs, tiers, and packages* it. Suluk already has the Cloudflare **deploy/serve** half
([`@suluk/deploy`](../../tooling/ts/packages/deploy/README.md) plans, [`@suluk/cloudflare`](../../tooling/ts/packages/cloudflare/README.md)
executes, [`@suluk/mcp`](../../tooling/ts/packages/mcp/README.md) serves the tool runtime). The gap is the **Agents
SDK runtime** specifically: stateful `Agent` Durable Objects, `routeAgentRequest()`, `@callable()`, `hono-agents`.

Two corrections to the naive plan ("generate the agent, ship seamless convenience"):

1. **The headline value is correctness-by-construction, not scaffold convenience.** The agent's *brain* (loop policy,
   HITL gates, retrieval strategy, system-prompt text) is irreducibly hand-written — generating it would be the
   over-abstraction C032 brakes on. But the ~60% that is *wiring* is exactly what developers get wrong: DO bindings +
   `new_sqlite_classes` migrations + `nodejs_compat`, the `/agents/{name}/{instance}` routing convention, approval
   plumbing, message pruning, no-credential-leak, prompt-freshness pinning. **Pitch: "wired to your contract correctly,
   tools tiered, prompt pinned, graded against a checklist — you write the loop." Not "we write your agent."**

2. **The generator is the riskiest, least-certain piece — gate it on a measurement, don't build it first.**
   `projectCloudflareAgent` couples Suluk to Cloudflare's `agents` API churn for a payoff we are *assuming*. The
   examples are the **measuring instrument**: build one agent both ways (hand-written vs Suluk-projected), diff,
   and let the boilerplate-elimination ratio decide whether the generator earns its keep or we ship a copy-paste
   **template** instead. (Measure-first; cheapest-next-experiment.)

The L3 tension is real and resolved the same way `@suluk/deploy` already resolves it for the Worker: **project the
scaffold + host-bindings (code the user owns), let Cloudflare host it.** Suluk follows the standard; it never becomes
the runtime. **Do not build a `@suluk/party` / `@suluk/agents-runtime` that hosts.**

## Grounding facts (so a cold resume doesn't re-derive them)

- **Cloudflare add-to-project requires:** `npm i agents` (+ `hono-agents` for Hono apps — Suluk apps are Hono);
  `wrangler.jsonc` with `compatibility_flags: ["nodejs_compat"]`, `durable_objects.bindings`, and
  `migrations: [{ tag, new_sqlite_classes }]`; an `Agent<Env,State>` subclass with `initialState` + `@callable()`
  methods; `routeAgentRequest()` (or `agentsMiddleware()`) in the worker entry; `tsconfig extends "agents/tsconfig"`
  + TC39 decorators; `npx wrangler types`. Default route: `/agents/{agent-name}/{instance-name}`.
- **Measured scaffold/brain split (chat example):** ~60% wiring (class extension, bindings, `routeAgentRequest`,
  `onChatMessage`/`streamText`, message pruning, approval flow, streaming). ~40% bespoke (system prompt, 3 tools'
  Zod schemas, `needsApproval` predicate, client UI). **Of that 40%, the tool schemas + tool→operation dispatch are
  contract-derivable** (tools *are* operations; `@suluk/zod` + the v4 doc already own them) and the **system prompt
  is already pin/freshness-managed** by `@suluk/agents`. Genuinely-bespoke residue ≈ loop policy + `needsApproval` +
  client UI. So real derivable fraction for a representative agent is ~70%, but the *value* is in correctness of the
  wiring, not the LOC.
- **What already exists in Suluk (do not rebuild):** Claude-plugin + OpenRouter projection, lint/install-gate,
  conformance (over-serve / cold-tail-in-default), policy MEET, `contextReport` + `suggestUnflatten`, signing +
  `verifyAgentFreshness`, model selection — all in `@suluk/agents`. MCP tool serving + tier-trim in `@suluk/mcp`.
  Cloudflare provision/deploy (D1/KV/R2/cron, `nodejs_compat`, `keep_bindings`) in `@suluk/deploy` + `@suluk/cloudflare`.
- **Packages own clean homes (no cycles):** runtime projection → `@suluk/agents` (emits source strings, takes no dep
  on `agents`, same as `projectClaudePlugin` references Claude without importing it). DO bindings/migrations →
  `@suluk/deploy` (wrangler gen) + `@suluk/cloudflare` (REST deploy). Agent checklist/grade → `@suluk/agents` (every
  input lives there); reuse `@suluk/harden`'s grade idiom, don't scatter agent rules into harden's schema auditor.

## The staged plan

Build Stage 1 + the Stage 0 examples **unconditionally** (they are the real best-practices deliverable and pay off
generator-or-not). Stage 2 is **gated** on the Stage 0 measurement.

### Stage 0 — measure (the gate). Status: ✅ DONE (2026-06-22)

| # | Task | Where | Est | Done? |
|---|---|---|---|---|
| 0.1 | Re-implement **one** Cloudflare example (chat **or** email agent) **twice**: (a) hand-written on the `agents` SDK, (b) wired to a Suluk contract via existing `@suluk/mcp` + `@suluk/agents` + `@suluk/zod`. Use `tooling/ts/packages/agents/examples/conin.contract.ts` or a small fresh contract. | [`examples/measure-cf-agent/`](../../tooling/ts/packages/agents/examples/measure-cf-agent/) | ½ d | ✅ |
| 0.2 | Diff (a) vs (b). Record the boilerplate-elimination ratio + which of the wiring lines were *correctly* generated vs needed hand-edits. Write the number into this doc's "Stage 0 result" box below. | [RESULT.md](../../tooling/ts/packages/agents/examples/measure-cf-agent/RESULT.md) | — | ✅ |
| 0.3 | **Decision:** ratio justifies a generator → do Stage 2 generator. Ratio thin / output is a heavily-edited stub → Stage 2 ships templates instead. | — | — | ✅ → **generator** |

> **Stage 0 result (chat agent, measured against the real projection — [RESULT.md](../../tooling/ts/packages/agents/examples/measure-cf-agent/RESULT.md)):**
> **derivable now = 71%** (56% wiring + 15% contract-derived tool schemas) · **73% after `x-suluk-approval`** · **27% irreducible brain**.
> Proven, not asserted: `@suluk/agents` already emits the tiered tool surface, each tool's full input JSON Schema, the
> model list, the resident set, and a no-secret Claude plugin — with zero new code. **Verdict = GENERATOR (Stage 2 path A).**
> Caveats: one (favorable, tool-heavy) example → 71% is the high end for thin tool-calling agents; wiring LOC are a
> structured estimate (±10%), tool claims are machine-checked. Value is *correctness of wiring + non-drifting schemas*,
> not LOC saved. A second pass on an email/scheduled agent would bracket the low end.

### Stage 1 — high-value, low-risk, build regardless. Status: ◑ 1.1 + 1.2 + 1.3 + 1.4 DONE (2026-06-22..23); 1.5 pending

| # | Task | Where | Est | Done? |
|---|---|---|---|---|
| 1.1 | Emit `durable_objects.bindings` + `migrations: [{ tag, new_sqlite_classes }]` + `nodejs_compat` into the generated `wrangler.jsonc`, derived from which agents are runtime DOs. (C032 "complete the half" — deploy owns D1/KV/R2/cron but not DO.) | `@suluk/deploy` | ½ d | ✅ |
| 1.2 | Add DO binding + sqlite-class **migration** support to the API-driven `deploy()` (the REST path has no wrangler to lean on). | `@suluk/cloudflare` | ½ d | ✅ |
| 1.3 | **Agent checklist + A–F grade + `assertAgentGrade` CI gate + inverse "fix" transform**, aggregating the existing checks (table below). Reuse `@suluk/harden`'s grade/`assertGrade`/inverse-fix *idiom*; host in `@suluk/agents` (inputs live there, no cycle). Inverse-fix reuses `suggestUnflatten` for the context dimension + existing `hardenDocument` for tool inputs. | `@suluk/agents` | ½–1 d | ✅ |
| 1.4 | New `x-suluk-approval` facet for **HITL gate on mutating tools** → projects to the Agents SDK `needsApproval` predicate. Maps onto the chat example's approval-gated `calculate`. | `@suluk/core` facet + `@suluk/agents` | ½–1 d | ✅ (landed with 2.A; `@suluk/testgen` claim deferred) |
| 1.5 | Optionally fold the agent grade into `@suluk/harden`'s document rollup for one unified "contract grade" (thin bridge; harden depends on agents, never the reverse). | `@suluk/harden` | ¼ d | ☐ |

### Stage 2 — conditional on Stage 0. Status: ✅ **path A (generator) 2.A1 + 2.A2 DONE** (2026-06-23)

| # | Task (path A: generator) | Where | Est | Done? |
|---|---|---|---|---|
| 2.A1 | `projectCloudflareAgent(doc, agentName, opts)` — third projection target alongside `projectClaudePlugin`/`projectOpenRouter`. Emits **owned source** (L3-pure, source *strings*, no `agents` dep): `AIChatAgent` subclass, contract-derived tools (`jsonSchema()` input schemas) + `needsApproval` from `x-suluk-approval`, `routeAgentRequest()` worker. Returns the `durableObjects` descriptor → feeds 1.1/1.2. | `@suluk/agents` | ½–1 d | ✅ |
| 2.A2 | Keep Cloudflare behind a **runtime-adapter seam** (mirror `@suluk/deploy`'s `DeployProvider`/`providers`) so a future Node/Vercel agent runtime is another adapter, not a rewrite. Emit a `Cxxx` ADR for the seam (hard-to-reverse). | `@suluk/agents` | ¼ d | ✅ [C034](decisions/C034-agent-runtime-adapter-seam.md) + daftar receipt |

| # | Task (path B: templates, if 0.3 says so) | Where | Est | Done? |
|---|---|---|---|---|
| 2.B1 | Ship the worked examples as `@suluk/example-agent` **templates** (copy-paste, not generated) + a docs page mirroring Cloudflare's example set (chat / email / scheduled / HITL) so parity is legible without a generator. | new `tooling/ts/packages/example-agent/` | ½ d | ☐ |

### Stage 1.1/1.2 — what landed + the carried follow-up (2026-06-22)

Implemented behind an explicit `durableObjects: [{ binding, className, sqlite?, scriptName? }]` input (deploy stays
decoupled from `@suluk/agents` — the caller computes the DO list). `@suluk/deploy` emits the wrangler.jsonc
`durable_objects` + `migrations` (field name `tag`); `@suluk/cloudflare` binds + migrates over the REST script-upload
(field name `new_tag`, inline on the same `PUT`, `nodejs_compat` auto-injected). Plus a new `cloudflare/tsconfig.json`
(the package was 1 of 2 of 37 missing one; its `typecheck` was broken). **deploy 33 pass · cloudflare 18 pass · both
typecheck clean.** Built (understand → implement → review) via two workflows; the [adversarial review](../../tooling/ts/packages/cloudflare/src/deploy.ts)
returned *ship-with-fixes*, all fixes applied (nodejs_compat REST asymmetry, stale JSDoc, honest no-prev-diff notes,
+2 regression tests).

**Confidence:** first-deploy + redeploy correctness ≈0.85 (wire shapes confirmed against Cloudflare docs + tested,
both field-name paths right, omit-empty-migrations footgun handled). **NOT yet covered — tracked follow-up (≈0.5):**

- **Additive DO evolution (v1→v2).** Both generators take only the CURRENT class set (no `prev` diff), so adding a
  class re-lists all classes (recreate conflict) and a removed class silently orphans its DO state — unlike
  `migrationSql`'s flag-never-DROP. REST plumbs `oldTag`/`newTag` but no caller drives it. *Fix:* thread a
  `prevDurableObjects` set → emit a real additive multi-entry migration + a loud removed-class review comment; add
  the v1→v2 end-to-end test (`{ old_tag:"v1", new_tag:"v2", new_sqlite_classes:[onlyNewClass] }`).
- **Backend-flip guard.** Flipping a class's `sqlite` flag between deploys is invalid (Cloudflare can't re-back an
  existing class). Since the Agents SDK mandates SQLite, forbid `sqlite:false` for agent classes or pin the backend.
- Confirm the mixed-backend single-entry shape (one tag carrying both `new_sqlite_classes` + `new_classes`) against
  the wrangler schema (low risk — Agents callers are all-SQLite).

This is hardening, naturally folded into Stage 2.A when `projectCloudflareAgent` becomes the real DO-list caller.

## Agent-hardening checklist (Stage 1.3 detail)

Mostly **aggregation of checks already shipped** — the new mechanism is the grade/gate + two new rules.

| Rule | Exists? | Source |
|---|---|---|
| Tool inputs bounded (maxLength / maxItems / closed objects) | ✅ | `@suluk/harden` (tools = operations — free) |
| `maxDepth` declared · acyclic · no dangling `operationRef` | ✅ | `lintAgents` |
| No request-value selector (the D1 red-line) | ✅ | `lintAgents` |
| Served ⊆ reachable · no cold-tail in default surface | ✅ | `conformance` |
| Context within budget · a model window fits | ✅ | `contextReport` (+ `suggestUnflatten` as the fix) |
| Prompt pinned + signed + fresh (no preprompt drift) | ✅ | `agentManifest` / `verifyAgentFreshness` |
| No credential / token in projected output | ✅ | projection boundary invariant (C020/C023) |
| **HITL gate on mutating tools** | ❌ new (1.4) | `x-suluk-approval` facet → `needsApproval` |
| **Replay / idempotency-safe side effects** | ❌ new | facet + check |

### Stage 1.3 — what landed (2026-06-22)

[`@suluk/agents/src/grade.ts`](../../tooling/ts/packages/agents/src/grade.ts): `gradeAgent` / `gradeAgents` /
`assertAgentGrade` / `agentGradeOk` / `gradeOf`. Aggregates the install lint + context-budget/model-fit + (served-fact)
over-serve/cold-tail/freshness checks + two NEW static structure checks (`no-tiering`, `skill-unpinned`) into one A–F
score + a CI gate, mirroring `@suluk/harden`. Pure/static by default; no `@suluk/harden` dependency (tool-input
hardening stays harden's job; the two grades unify on the **letter** in Stage 1.5, not the raw score). **Rubric:** F is
reserved for a ship-blocking error (`grade==="F" ⟺ !shippable`); warnings alone never drop below D; info findings are
advisory notes (never scored). **104 `@suluk/agents` tests pass · typecheck clean.** Built understand→implement→review
via two workflows; the [3-lens adversarial review](../../tooling/ts/packages/agents/src/grade.ts) returned
*ship-with-fixes* — all applied: README API row (was undiscoverable), the missing-provenance double-penalty (score is
now invariant to whether the caller passes a snapshot), the warning-pile-F overload (now floored at D), `installable`→
`shippable` (honest name), finding dedup, and the O(N²) rollup hoisted. Confidence ≈0.85. The two `❌ new` rows above
(HITL `x-suluk-approval`, replay-safety) are Stage 1.4 — wiring them adds two checklist rules to this grade.

### Stage 2.A1 + 1.4 — what landed (2026-06-23)

[`@suluk/agents/src/cloudflare.ts`](../../tooling/ts/packages/agents/src/cloudflare.ts) `projectCloudflareAgent` — the
THIRD projection target. One `x-suluk-agents` declaration → an OWNED Cloudflare Agents-SDK scaffold: `AIChatAgent`
subclass + `routeAgentRequest` worker + tools derived from each route's operation (name/description/input-schema via the
`ai` SDK's `jsonSchema()`) + `needsApproval` from the new **`x-suluk-approval`** facet. Model/prompt/loop/`execute`
bodies are marked TODOs (the bespoke brain). **L3-pure** (source strings, no `agents`/`ai` dep, no credential), pure +
deterministic + fail-loud. Returns `durableObjects: [{ binding, className }]` — the real caller of the Stage-1.1/1.2
deploy surface, closing the loop. The **`x-suluk-approval`** facet (1.4) lives in `@suluk/core` (`SulukApproval` +
`Request["x-suluk-approval"]`), static/advisory like cost/ratelimit — verified (code-read + an executable tripwire in
`core/test/facets.test.ts`) to NOT perturb the ADA signature (`computeSignature` is a closed field list) and to ride
the 3.1 downgrade's generic `x-*` passthrough. A `untrusted-mutation-no-approval` rule was added to the Stage-1.3 grade.

**agents 120 pass · core 40 pass · both typecheck clean.** Built understand→implement→review via three workflows; the
[3-lens review](../../tooling/ts/packages/agents/src/cloudflare.ts) returned *ship-with-fixes* (2× ship, no blocker/major;
the facet's ADA-identity safety was the explicit refutation target and held by construction) — all applied: deleted a
dead `MUTATING` const, wired the `mcpUrl` option, guarded an empty-summary description, `await convertToModelMessages`
(ai SDK ≥6), the grade-scope comment, and **F1 the ADA-invariance tripwire**. Confidence ≈0.85.

**Carried follow-ups:** `@suluk/testgen` conformance claim for `x-suluk-approval`; ~~runtime-adapter seam ADR (2.A2)~~ ✅ (C034);
~~recursive sub-agent scaffolding~~ ✅ (2026-06-23 — a class + DO per reachable agent, collision-guarded); unify the
instruction-snapshot key convention (projections use bare `<skill>`, context/grade use `<agent>/<skill>`); additive DO evolution + backend-flip guard.

## What NOT to do (the brakes)

- **No hosting package.** No `@suluk/party` / `@suluk/agents-runtime` that holds live state/credentials — crosses the
  L3 line and reinvents Cloudflare's `agents`. Generate glue *to* the runtime; don't compete with it.
- **No new package unless forced.** Stage 1 is all *extension*. The only candidate new package is `@suluk/example-agent`
  (Stage 2 path B) — and only if Stage 0 says template-not-generator. (Create-rarely: "16 proposed, 3 survived.")
- **No agent fields in `@suluk/core`.** The D1 wall (`@suluk/agents/test/core-boundary.test.ts`) stays — the matcher
  never reads `x-suluk-agents`.
- **Don't sell "seamless / we write your agent."** The brain is hand-written by design; over-generating it is the
  failure mode. Sell correct wiring + the graded checklist.
- **Don't scatter agent rules into `@suluk/harden`'s schema auditor.** Host the agent checklist in `@suluk/agents`;
  harden only optionally folds in the resulting grade (1.5).

## Confidence ceilings

- Examples-as-measuring-instrument · deploy DO bindings (1.1/1.2) · agent checklist+grade (1.3): **≈0.85** — clean
  fits with C027/C032, mostly aggregation of existing mechanism.
- `x-suluk-approval` HITL facet (1.4): **≈0.7** — clearly needed (chat example proves it) but facet design is a real
  Step (intersection with `x-suluk-access`, projection shape).
- That the full `projectCloudflareAgent` generator (2.A) is worth building: **deliberately unstated** — that is what
  Stage 0 exists to measure. Asserting it now would be over-confidence on a novel projection without a witness.

## Resume pointer (cheapest next move)

**Stages 0, 1.1, 1.2, 1.3, 1.4, 2.A1, and 2.A2 all closed (✅ 2026-06-22..23, each reviewed, fixes applied).** The full
arc is end-to-end AND behind a swappable seam: contract → `runtimeProviders.cloudflare` (`projectCloudflareAgent`) →
`durableObjects` → `@suluk/deploy`/`@suluk/cloudflare`. Next:

1. **Hardening follow-ups** (fold into a Stage-2 pass): the `@suluk/testgen` claim for `x-suluk-approval`; ~~recursive
   sub-agent scaffolding in `projectCloudflareAgent`~~ ✅ (2026-06-23); ~~additive DO evolution (`prev` set) + backend-flip
   guard in deploy~~ ✅ (2026-06-23 — `prevDurableObjects` on both paths: wrangler emits an additive 2-step history,
   REST a true `old_tag→new_tag` delta; a removed class is flagged/`durableObjectsRemoved`, never DROPped; a backend flip
   or a colliding tag throws; reviewed ship-with-fixes, 4 majors fixed); unify the instruction-snapshot key convention;
   tighten the seam's `deploy?: Record<string,unknown>` when a 2nd adapter lands.
   Doc-only caveats (from the review): a fully-disjoint wrangler evolution starts its history at v2 (out of 2-step scope —
   hand-edit); `prevDurableObjectMigrationTag` must equal the *latest* tag in the deployed history when real history has >2 entries.
2. **Stage 1.5 — unified contract grade**: average the `@suluk/harden` doc grade and the `gradeAgent` grade on the LETTER
   (a thin bridge in `@suluk/harden`).
3. **A second runtime adapter** (validates the C034 seam's generality) — a Node/Vercel agent runtime as a new `AgentRuntimeProvider`.
4. **End-to-end smoke** (optional): wire `projectCloudflareAgent`'s output through `@suluk/cloudflare`'s `deploy()` against
   a real account, or a second Stage-0 pass on an email/scheduled agent.

Strong candidate for a **commit checkpoint** here — Stages 1.1–2.A1 are a large, green, reviewed, uncommitted body across
`@suluk/{core,deploy,cloudflare,agents}` + docs.

Optional: a **second Stage-0 pass** on an email/scheduled agent to bracket the low end of the derivable range (the chat
agent is the favorable, tool-heavy case).
