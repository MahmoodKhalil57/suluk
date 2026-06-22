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

### Stage 0 — measure (the gate). Status: ☐ not started

| # | Task | Where | Est | Done? |
|---|---|---|---|---|
| 0.1 | Re-implement **one** Cloudflare example (chat **or** email agent) **twice**: (a) hand-written on the `agents` SDK, (b) wired to a Suluk contract via existing `@suluk/mcp` + `@suluk/agents` + `@suluk/zod`. Use `tooling/ts/packages/agents/examples/conin.contract.ts` or a small fresh contract. | new `tooling/ts/packages/agents/examples/` (or a scratch app) | ½ d | ☐ |
| 0.2 | Diff (a) vs (b). Record the boilerplate-elimination ratio + which of the wiring lines were *correctly* generated vs needed hand-edits. Write the number into this doc's "Stage 0 result" box below. | this doc | — | ☐ |
| 0.3 | **Decision:** ratio justifies a generator → do Stage 2 generator. Ratio thin / output is a heavily-edited stub → Stage 2 ships templates instead. | — | — | ☐ |

> **Stage 0 result (fill in):** _measured ratio = ___ ; correctly-generated wiring = ___ ; verdict = generator | template_

### Stage 1 — high-value, low-risk, build regardless. Status: ☐ not started

| # | Task | Where | Est | Done? |
|---|---|---|---|---|
| 1.1 | Emit `durable_objects.bindings` + `migrations: [{ tag, new_sqlite_classes }]` + `nodejs_compat` into the generated `wrangler.jsonc`, derived from which agents are runtime DOs. (C032 "complete the half" — deploy owns D1/KV/R2/cron but not DO.) | `@suluk/deploy` | ½ d | ☐ |
| 1.2 | Add DO binding + sqlite-class **migration** support to the API-driven `deploy()` (the REST path has no wrangler to lean on). | `@suluk/cloudflare` | ½ d | ☐ |
| 1.3 | **Agent checklist + A–F grade + `assertAgentGrade` CI gate + inverse "fix" transform**, aggregating the existing checks (table below). Reuse `@suluk/harden`'s grade/`assertGrade`/inverse-fix *idiom*; host in `@suluk/agents` (inputs live there, no cycle). Inverse-fix reuses `suggestUnflatten` for the context dimension + existing `hardenDocument` for tool inputs. | `@suluk/agents` | ½–1 d | ☐ |
| 1.4 | New `x-suluk-approval` facet (or extend `x-suluk-access`) for **HITL gate on mutating tools** → projects to the Agents SDK `needsApproval` predicate. Maps onto the chat example's approval-gated `calculate`. Add a `@suluk/testgen` conformance claim so it's load-bearing. | `@suluk/core` facet + `@suluk/agents` | ½–1 d | ☐ |
| 1.5 | Optionally fold the agent grade into `@suluk/harden`'s document rollup for one unified "contract grade" (thin bridge; harden depends on agents, never the reverse). | `@suluk/harden` | ¼ d | ☐ |

### Stage 2 — conditional on Stage 0. Status: ☐ blocked on 0.3

| # | Task (path A: generator) | Where | Est | Done? |
|---|---|---|---|---|
| 2.A1 | `projectCloudflareAgent(doc, agentName, opts)` — third projection target alongside `projectClaudePlugin`/`projectOpenRouter`. Emits **owned source** (L3-pure, source *strings*, no `agents` dep): `Agent<Env,State>` subclass (skills→model via `skillModels`; resident routes→`@callable()`/MCP-tool loop; sub-agents→child-DO routing), `routeAgentRequest()`/`agentsMiddleware()` wiring, `tsconfig`/decorator notes. | `@suluk/agents` | ½–1 d | ☐ |
| 2.A2 | Keep Cloudflare behind a **runtime-adapter seam** (mirror `@suluk/deploy`'s `DeployProvider`/`providers`) so a future Node/Vercel agent runtime is another adapter, not a rewrite. Emit a `Cxxx` ADR for the seam (hard-to-reverse). | `@suluk/agents` | ¼ d | ☐ |

| # | Task (path B: templates, if 0.3 says so) | Where | Est | Done? |
|---|---|---|---|---|
| 2.B1 | Ship the worked examples as `@suluk/example-agent` **templates** (copy-paste, not generated) + a docs page mirroring Cloudflare's example set (chat / email / scheduled / HITL) so parity is legible without a generator. | new `tooling/ts/packages/example-agent/` | ½ d | ☐ |

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

**Start Stage 0.1** — build the chat (or email) agent both ways and diff. That one number settles the Stage 2
fork (generator vs template) and surfaces the exact `x-suluk-approval` facet shape better than more planning will.
Everything in Stage 1 can proceed in parallel and lands value regardless of the Stage 0 verdict.
