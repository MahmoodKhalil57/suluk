# C34. The agent-runtime seam — Cloudflare is the FIRST adapter, not the only target

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Decides how `@suluk/agents` projects an
> `x-suluk-agents` declaration into an *executing runtime*, given that Stage-0 of the Cloudflare-agents work
> ([cloudflare-agents-roadmap.md](../cloudflare-agents-roadmap.md)) measured ~71% of a hand-written Cloudflare agent to
> be contract-derivable and justified building the `projectCloudflareAgent` generator. Reached this session
> (2026-06-23) while landing Stage 2.A; grounded in two read-only priors: `@suluk/deploy`'s already-shipped
> `DeployProvider` / `providers` seam (the pattern we mirror) and the Cloudflare Agents SDK shape pinned by the
> measurement artifact (`tooling/ts/packages/agents/examples/measure-cf-agent/`).

Date: 2026-06-23

## Status

Accepted (candidate-fork). Decision ceiling **0.85** (raised from 0.8 on 2026-06-23) — the seam is a near-mechanical
mirror of `@suluk/deploy`'s proven provider pattern (low risk) and is additive (the direct `projectCloudflareAgent`
export is unchanged). **Update (2026-06-23): the N=1 caveat is resolved.** A SECOND adapter landed — `nodeRuntime`
(`projectNodeAgent`, a Bun-served agent with no Durable Objects) — validating that the interface generalizes to a
different deploy shape; the contract→tool derivation was extracted to `runtime-shared` and reused (not forked); and the
`deploy` hint was tightened from `Record<string, unknown>` to the typed union `RuntimeDeployHint` (`{ kind: "cloudflare";
durableObjects } | { kind: "node" }`), exactly the re-typing this Status predicted. Residual uncertainty is now only
whether the union generalizes to a *third*, materially-different runtime.

## Context

`projectCloudflareAgent` (Stage 2.A) turns one agent declaration into an owned Cloudflare Agents-SDK scaffold + a
`durableObjects` descriptor for `@suluk/deploy`/`@suluk/cloudflare`. The naïve shape is a single hard-wired function —
but Cloudflare is explicitly "the best hosting / market-mover for self-hosted stateful agents," **not** Suluk's only
intended target. Suluk's actual differentiator is contract-first **neutrality**: one declaration → many artifacts. A
Cloudflare-only runtime projection would betray that the same way a wrangler-only deploy would have.

The repo already solved this exact shape one layer down: `@suluk/deploy` exposes a `DeployProvider { name; generate }`
interface + a `providers` registry, with Cloudflare as the first (and so far only) adapter, precisely so a future
Vercel/Fly/self-hosted target is a new adapter rather than a rewrite. The runtime projection wants the identical move,
one layer up (the executing runtime, not the deploy plan).

The L3 line (C023) must hold at the seam: a runtime provider RENDERS owned source the user controls; it never hosts,
opens a socket, or holds a credential. So the interface trades in source strings + a deploy hint, never a live process.

## Decision

Introduce `AgentRuntimeProvider` + a `runtimeProviders` registry in `@suluk/agents` (`src/runtime.ts`), closely
mirroring `@suluk/deploy` (one deliberate divergence: this interface is **generic in its `opts`** so each adapter keeps
typed options, which is why the registry stores `cloudflareRuntime as AgentRuntimeProvider` — a harmless erase-to-base
cast the non-generic deploy seam doesn't need; typed-opts callers use the named `cloudflareRuntime` export):

- `interface AgentRuntimeProvider<O> { name: string; project(doc, agentName, opts?: O): AgentRuntimeArtifacts }`
- `interface AgentRuntimeArtifacts { files: Record<string,string>; reachableSubAgents: string[]; deploy: RuntimeDeployHint }`
  — owned source + the reachable sub-agent list + a **typed** deploy hint (the discriminated union below; tightened from
  `Record<string,unknown>` once the 2nd adapter landed — see the Status update).
  `reachableSubAgents` is surfaced at the seam because each sub-agent is its own runtime unit (a separate Durable Object on
  Cloudflare) the host scaffolds separately — v1 of `projectCloudflareAgent` emits only the named agent.
- `type RuntimeDeployHint = { kind: "cloudflare"; durableObjects: {…}[] } | { kind: "node" }` — Cloudflare ships the DO
  descriptor for `@suluk/deploy`; the Node runtime is a plain long-lived process with no provisioned infra.
- `cloudflareRuntime` (wraps `projectCloudflareAgent`, its `durableObjects` → the hint) and `nodeRuntime` (wraps
  `projectNodeAgent`, a Bun-served process) — the FIRST two adapters.
- `runtimeProviders = { cloudflare, node }` — the name-keyed registry; the swap point.

`projectCloudflareAgent` / `projectNodeAgent` stay first-class, directly-importable exports (the typed, ergonomic entry
for the common case); the seam is the *additional* indirection for target-agnostic callers. A future `vercelRuntime` is a
new adapter + a registry entry + a new `kind` — no caller change.

## Consequences

**Easier:** adding a second runtime target is one new adapter behind a stable interface, not a rewrite; a host (the
cockpit, a CLI) can dispatch by provider name without knowing the concrete runtime; the deploy hint flows generically
into whatever deploy provider matches; the neutrality claim is now structural, not aspirational.

**Harder / watch:** the `deploy` hint is now a typed discriminated union (`RuntimeDeployHint`) — generality preserved
without the type-safety loss of the original `Record<string,unknown>`, at the cost that adding a runtime means adding a
`kind` (a deliberate, reviewable touch-point). Whether the union generalizes to a *third*, materially-different runtime
is the remaining open question. The seam adds a small indirection that must be kept in lockstep with each
`project*Agent`'s return shape (wrapper tests guard this).
