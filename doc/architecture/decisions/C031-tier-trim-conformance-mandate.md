# C31. Tier-trim is a CONDITIONAL conformance MUST (mandate-if-tiers-declared)

> **Provenance:** Candidate-fork ADR (Suluk), **not** a SIG decision. ORIGINATED (no industry/SIG prior for agent
> tier-trim). Resolved by a persona council `wf_4badc65e-14b` — **UNANIMOUS 4/4 CONDITIONAL** (conformance-purist,
> adoption-pragmatist, enterprise-security, agent-builder-DX), synthesised @**0.52** (tracks the C027 Originated
> ceiling). Decidable now on **real evidence**: conin (Construction Intelligence) deployed tier-trim to production
> (`construction-intelligence.saastemly.com`, its public `/mcp` serves 8 resident + `discover_tools`, not 35). Ledger:
> [`plan/facts/0tier-trim-mandate.bn`](../../../plan/facts/0tier-trim-mandate.bn). Closes the C027/tier-trim reopen-trigger.

Date: 2026-06-13

## Status

Accepted (candidate-fork) at ~0.52. No D1 gate: a serving/conformance rule, not a static-matcher decision.

## Context

The open tier-trim question (the last one): does the `x-suluk-agents` standard **MANDATE** the trim (a conforming
server MUST serve resident-only-by-default + `discover_tools`) or is it **ADVISORY**? The capability is built
(`@suluk/mcp` `mcpApp({ resident })`, `@suluk/agents` `residentToolNames`) and the standard already ships an auditor
`assertDefaultServedResident` that flags a `cold-tail-in-default` finding — but that finding had **no severity**, so the
"thesis" was unfalsifiable-by-construction (a server could declare tiers, serve the full catalog, and still "conform").

## Decision

**CONDITIONAL — a scoped MUST triggered by DECLARATION, not by surface size.**

1. **UNIVERSAL MANDATE (unchanged — the security floor, already shipped):** a conforming serving adapter's default tool
   surface **MUST** be a subset of the statically-declared reachable surface (`assertServedSubset`, `over-serve` =
   FAILURE); under an operator `x-suluk-policy`, a subset of the post-policy effective surface
   (`assertServedSubsetGoverned`, `policy-denied-served` = FAILURE). The authz-reach guarantee — independent of tiering.

2. **CONDITIONAL TRIM (the resolution):** a conforming MCP/serving adapter **MUST, IF AND ONLY IF** the agent declares
   at least one route with `tier: cold-tail`, serve a default `tools/list` that **excludes every cold-tail route**.
   Cold-tail routes MUST stay reachable via the `discover_tools` meta-tool and **callable by name** via `tools/call`
   (losslessness — `protocol.ts` proves it: only `tools/list` is filtered; `tools/call` resolves any tool). A server
   that declares **no** cold-tail tier has **no** obligation and conforms trivially (full catalog, no `discover_tools`).

3. **`cold-tail-in-default` is therefore a conformance FAILURE** (severity `error`, gate-failing via `conformanceOk`)
   for a tier-declaring server — a **separate** code from `over-serve` (declared-allocation truth vs authz-reach truth;
   never collapsed).

**Explicit NON-conditions (bound the Originated ceiling, avoid absolutist drift):**
- **NO surface-size threshold.** REJECTED the "MUST only above N tools" form — a numeric gate reintroduces the MUST/SHOULD
  ambiguity this rule removes and has no witness; the small-agent case is handled by tier-declaration being *optional*.
- The MUST binds only the **served default surface** — it does NOT mandate any agent adopt tiers, does NOT enforce a
  per-tier context budget, does NOT require runtime tier-routing (all stay advisory per C027). It binds the **adapter's**
  serving behaviour, not the operator's choice to tier.

## Implementation (this ADR ships it — the MUST was previously advisory-by-construction)

`ConformanceFinding` gains `severity: "error" | "warning"` (mirrors `LintFinding`); `conformanceOk(findings)` is the gate
(no error-severity), mirroring `lintOk`. `cold-tail-in-default` / `over-serve` / `policy-denied-served` / `stale-skill`
= `error`; `unpinned-skill` = `warning`. `@suluk/agents@0.1.5`.

## Consequences — adversarial self-check (@0.52)

- **Dissent worth preserving (the DX/served-client lens):** losslessness is at the **protocol** layer (callable by name),
  not the **cognition** layer — a weaker served model that never *thinks* to call `discover_tools` is strictly worse off
  under a mandated trim (the tool it needs is invisible until discovered). The mandate bets that a capable model reads
  the self-describing `discover_tools` and that the context saving outweighs the discovery round-trip. Conin-live is the
  first witness; not yet measured at the task-success layer.
- **Why not ADVISORY:** an optional thesis is unfalsifiable (the exact over-claim the council refuted earlier). The MUST
  makes the context-reduction promise *binding where it is made* (tiers declared) and *silent where it isn't*.

## Falsifier / reopen-trigger

A **second, independent** (non-Conin, author≠operator) conforming server that declares `tier: cold-tail` for a
**legitimate** reason while deliberately serving the full catalog by default — a client doing its own trim, a
transitional mid-migration server, or measured task-success **dropping** vs full-catalog because models don't call
`discover_tools` — **demotes clause 2 from MUST to SHOULD (ADVISORY), with receipt.** Until that evidence exists, the
MUST holds (the alternative is the refuted unfalsifiable thesis). This keeps the decision falsifiable, not a thesis.
