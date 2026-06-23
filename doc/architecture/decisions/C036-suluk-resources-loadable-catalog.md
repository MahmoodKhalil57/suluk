# C36. `x-suluk-resources` — the loadable-resource catalog (Cloudflare "Agent Skills", contract-first)

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Defines `x-suluk-resources`, the on-demand catalog
> of loadable instructions / references / scripts an agent activates when a task matches — Suluk's contract-first form
> of the Cloudflare **Agent Skills** model (and loadable context-memory). This is the name [C035](./C035-cloudflare-terminology-alignment.md)
> RESERVED as "build-by-nobody until memory descriptors land"; it is defined here by **explicit operator direction**
> ("pick up all of the deferred follow-ups", session 2026-06-23) — a recorded **deviation** from that self-imposed
> reserve. Grounded in two read-only priors: the C027 composable-units model (the `skill`/`route`/`agent` nouns this
> sits beside) and the vendored Cloudflare docs (`cloudflare-agents-llms-full.md`: *Agent Skills*,
> *conversation-state-and-memory* — both **experimental** in that snapshot).

Date: 2026-06-23

## Status

Accepted (candidate-fork). Decision ceiling **0.5** — Originated + witness-thin + anchored to **experimental**
Cloudflare APIs (`agents/skills` is "experimental, script execution in particular early"; the Session loadable-context
APIs "may change before graduation"). Tracks C027/C028's originated ceiling. Ledger:
[`0resources.bn`](../../../plan/facts/0resources.bn) (burhan True, converge clean 258). **D1 gate passed** — an
independent maintained witness ([`test/resources-d1-invariance.test.ts`](../../../tooling/ts/packages/core/test/resources-d1-invariance.test.ts), 2 pass)
proves `buildAda`/`matchRequest` are byte-identical with vs without an `x-suluk-resources` block.

## Context

C035 mapped Suluk's vocabulary onto Cloudflare's and surfaced the one genuine collision — **Skill**. Suluk `skill` =
the agent's *model + instruction tier* (always-on system text, presence of `model` is the discriminator). Cloudflare
**Agent Skills** = *loadable, on-demand content* (a catalog of instructions/references/scripts the model activates;
no model — the agent owns the model). C035 resolved the collision by keeping `skills` and **reserving** the name
`x-suluk-resources` for Cloudflare's loadable-catalog meaning, to be defined only when a real memory-descriptor need
appeared.

The operator then directed building all the C035 follow-ups, which lifts that reserve. Building it now is defensible
under the same **operator-surfaced-cowpath** pattern that justified C027 (the operator owns the call), provided the
build is honest about its experimental anchor and stays structural-only — exactly the discipline C027/C028 used for
their originated, low-ceiling facets.

## Decision

Define `x-suluk-resources` as a top-level OPTIONAL vendor map, riding the C025/C027 precedent EXACTLY (additive, no new
normative kind, no meta-schema change, never read by the matcher):

- **`SulukResource`** (a catalog entry): `description` (the catalog listing the model selects on, required) · `kind`
  (`instructions` | `reference` | `script`) · `provenance` (`source` + `contentHash` + optional `version` — the
  catalog/`SKILL.md` is GENERATED from the pointer and drift-hashed, never inlined, same as a C027 skill) · optional
  `trust` (`author-declared` | `retrieved`).
- **`SulukResourceRef`** — a by-name `#/x-suluk-resources/<key>` ref (never inline), mirroring `SulukAgentRef`.
- **`SulukAgent.resources?`** — by-name refs into the catalog: the agent's loadable surface.

**The definitional wall (resolves the C035 collision in code):** a resource is **content-only** (no `model`) and
**lazy** (loaded on demand); a `skill` is **model-bearing** and **always-on**. So `presence-of-model` discriminates
skill-vs-route, and `content-only-loadable` discriminates resource-vs-skill. The projected `SKILL.md` is a valid
Cloudflare Agent-Skill artifact (C035 noted this), so the *artifact* aligns even though the *declaration role* differs.

**Static surface** (`@suluk/agents`): `resourceCatalog(doc, agentName)` returns the CF `get()` metadata listing an
agent's catalog projects to; `lintResources(doc)` gates well-formedness (description, valid kind, pinned provenance) +
dangling refs + flags `kind: "script"` (the experimental script-execution path) and `retrieved` (untrusted) content.
Pure, static, never read by the D1 matcher.

## Consequences

**Easier:** Cloudflare's Agent-Skills concept now has a typed, lint-gated home in the contract, distinct from a
model-bearing skill; the C035 collision is resolved in code, not just prose; an agent's loadable catalog is statically
enumerable + drift-checkable; the `SKILL.md` projection already aligns with CF's artifact.

**Harder / watch:** the facet is anchored to **experimental** Cloudflare APIs (Agent Skills, loadable context memory)
— a CF rename forces a follow-up; `kind: "script"` maps to CF's *early* script execution and is lint-flagged
accordingly. This is a recorded **deviation from C035's reserve** (operator-directed); the honest mitigation is the low
ceiling (0.5), structural-only scope (no runtime, no enforcement, never wire-enforced), and the experimental caveat
carried in the type docs + the lint. The `D1` invariance must hold as a regression tripwire (the witness test enforces
it).

**Not done here (deliberate):** folding `lintResources` into the `gradeAgent` rubric (kept standalone for now, like
`contextReport` was before it folded in); a full `SKILL.md`-set / script-runner projection (CF's script execution is
experimental — out of scope until it stabilizes); a runtime loader.
