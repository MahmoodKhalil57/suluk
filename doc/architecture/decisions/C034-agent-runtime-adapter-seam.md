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

Accepted (candidate-fork). Decision ceiling **0.8** — the seam is a near-mechanical mirror of `@suluk/deploy`'s
proven provider pattern (low risk), and it is additive (the direct `projectCloudflareAgent` export is unchanged). The
residual uncertainty is N=1: Cloudflare is the *only* implemented adapter, so the interface's generality is asserted
by analogy to the deploy seam, not yet validated by a second runtime (Node/Vercel). The `deploy?: Record<string,
unknown>` escape hatch (which currently carries Cloudflare's `durableObjects`) is the part most likely to be
re-typed when a second adapter lands.

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
- `interface AgentRuntimeArtifacts { files: Record<string,string>; reachableSubAgents: string[]; deploy?: Record<string, unknown> }`
  — owned source + the reachable sub-agent list + a **provider-specific** deploy hint (Cloudflare puts `{ durableObjects }` here).
  `reachableSubAgents` is surfaced at the seam because each sub-agent is its own runtime unit (a separate Durable Object on
  Cloudflare) the host scaffolds separately — v1 of `projectCloudflareAgent` emits only the named agent.
- `cloudflareRuntime: AgentRuntimeProvider` — the FIRST adapter, a thin wrapper over `projectCloudflareAgent` (its
  `durableObjects` becomes the `deploy` hint).
- `runtimeProviders = { cloudflare: cloudflareRuntime }` — the name-keyed registry; the swap point.

`projectCloudflareAgent` stays a first-class, directly-importable export (the typed, ergonomic entry for the common
case); the seam is the *additional* indirection for target-agnostic callers. A future `nodeRuntime` / `vercelRuntime`
is a new adapter + a registry entry — no caller change.

## Consequences

**Easier:** adding a second runtime target is one new adapter behind a stable interface, not a rewrite; a host (the
cockpit, a CLI) can dispatch by provider name without knowing the concrete runtime; the deploy hint flows generically
into whatever deploy provider matches; the neutrality claim is now structural, not aspirational.

**Harder / watch:** the `deploy?: Record<string, unknown>` hint is intentionally loose — it sacrifices type-safety on
the provider-specific payload for generality, and will likely be tightened (a typed union, or per-provider deploy
descriptors) when a second adapter forces the question; until then it is an N=1 generalization. The seam adds a small
indirection that must be kept in lockstep with `projectCloudflareAgent`'s return shape (a wrapper test guards this).
