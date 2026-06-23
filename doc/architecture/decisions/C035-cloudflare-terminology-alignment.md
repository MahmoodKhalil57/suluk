# C35. Cloudflare terminology alignment — a Rosetta layer over C027, and the agent-pyramid vocabulary

> **Provenance:** Candidate-fork ADR (Suluk), not a SIG decision. Records how Suluk's composable-unit vocabulary
> ([C027](./C027-suluk-agents-composition-map.md)) maps onto the **Cloudflare Agents SDK** terminology, so an author
> who knows one can read the other and the `@suluk/agents` projections (Cloudflare runtime, MCP, docs) are legible as
> *the same things under two names*. Reached this session (2026-06-23) after reading the vendored Cloudflare Agents
> docs snapshot (`cloudflare-agents-llms-full.md`, dated 2026-06: *what-are-agents*, *agentic-patterns*,
> *human-in-the-loop*, *long-running-agents*, *calling-llms*, *conversation-state-and-memory*, *concepts/tools*,
> *Agent Skills*, *Agents as tools*, *tools/mcp*, *ai-search*, *payments/x402/mpp*) and cross-checking them against
> `core/src/types.ts` (`SulukAgent`/`SulukSkillRef`/`SulukRouteRef`/`SulukAgentRef`) and the C027 glossary. Operator
> asked to "align Suluk on the terminologies and definitions Cloudflare created" and to standardize the agent-pyramid.
> Grounded in two read-only priors: C027 (the deliberate noun choice we are NOT overruling) and the Cloudflare docs
> (the external vocabulary we are mapping *to*, never adopting wholesale).

Date: 2026-06-23

## Status

Accepted (candidate-fork). Decision ceiling **0.7** — documentation-grade: this ADR adds a vocabulary-equivalence
mapping plus **one reserved name** and changes **no type, no schema, no normative section**. The ceiling is bounded
below 0.85 (and never raises C027's own 0.52) because two Cloudflare anchors it leans on are **explicitly
experimental** in the vendored docs (`agents/skills` "Agent Skills are experimental"; the Session memory APIs under
`agents/experimental/memory/session`, "import paths and details may change before graduation") and may drift. Ledger:
[`0cf-align.bn`](../../../plan/facts/0cf-align.bn) (converge clean, 253).

## Context

C027 gave Suluk a composition standard (`x-suluk-agents`) with five deliberately-chosen nouns — **Route / Skill /
Agent / Module / Job** — and CONTEXT.md's glossary already anticipated the clash with the wider ecosystem (Route
carries `_Avoid_: tool (ambiguous with MCP tool)`). Independently, Cloudflare shipped an Agents SDK that is now the
market-mover for self-hosted stateful agents, with its *own* vocabulary (Agent, Tool, Skill, sub-agent,
needsApproval, scheduled tasks, paidTool, context memory). The two vocabularies overlap heavily, diverge on a few
words, and **collide on exactly one** — "Skill".

The operator's framing is an **agent-pyramid**: a deterministic floor (calculators, no internal AI — hard to use,
trivial to verify) rising to less-deterministic, more-general, more-convenient layers, each agent being "an MCP +
skills" that connects to routes or sub-agents through MCP. The question this ADR settles is **not** whether to
rebuild anything — it is *what to call things*, how the one collision resolves, and whether the pyramid is a new
construct or an existing one renamed.

The risk of getting it wrong is real but bounded: a careless "align = rename" would overrule a shipped,
council-resolved, D1-gated decision (C027) and break `grade.ts`/`manifest.ts`/contracts/tests for a doc-resolvable
confusion. So the bar is: maximize legibility, change nothing load-bearing.

## Decision

**1. A Rosetta mapping, documented — never a rename.** Each Suluk composable-unit noun is mapped to its Cloudflare
counterpart *and* to the artifact it projects to. The mapping lives in CONTEXT.md (a new "Cloudflare alignment"
subsection) and is authoritative for how the `@suluk/agents` projections should read:

| Suluk (the contract) | Cloudflare (the runtime) | Projects to | Note |
| --- | --- | --- | --- |
| **Agent** (`x-suluk-agents.<n>`) | **Agent** (`AIChatAgent`/`Think`, a Durable Object) | AIChatAgent scaffold + worker | contract vs running instance |
| **Route** (`routes`, `operationRef`, no `model`) | **server-side Tool** (`tool()`) | an MCP `tool()` | deliberate divergence (C027 `_Avoid_: tool`) |
| **sub-agent** (`agents`, by-name refs + `maxDepth`) | **sub-agent** (`subAgent()`) / **agent-as-tool** (`agentTool()`) | DO-per-sub-agent + `agentTool` | word matches |
| **`x-suluk-approval`** (`{required,reason}`) | **`needsApproval`** / `waitForApproval()` / `elicitInput()` | tool `needsApproval` | CF has 3 HITL surfaces; Suluk 1 static facet |
| **`thinking.maxRounds`** (C029) | **`stopWhen: stepCountIs(n)`** (AI SDK) | `stepCountIs(maxRounds)` | rename in projection only |
| **`contextBudget` / `thinking.budget`** | runtime token meter (`[45% — 495/1100 tokens]`) | a lint / warning | Suluk is *ahead* (declared, static) |
| **`tier: resident\|cold-tail`** | tool-merge-order + lazy Skill loading | `discover_tools` trim | Suluk-specific context-reduction |
| **`x-suluk-cost`** (declared, PROVISIONAL C026) | **`paidTool`** price (x402) / MPP `charge` | `paidTool(price)` | a real wiring opportunity (future) |
| **Job** (`x-suluk-jobs`, C025) | **Scheduled tasks** (`schedule()`) / Workflows | `schedule()` / Workflow | aligns |
| **Skill** (`skills`, model-bearing) | **(a) Agent Skills** (`agents/skills`) **(b) read-only "soul"** | `SKILL.md` + model config | **collision — see (2)** |
| *(reserved — see (2))* `x-suluk-resources` | **Agent Skills / loadable context** (`activate_skill`) | — | the loadable-catalog concept, undefined until memory descriptors land |
| *(none yet)* | **context memory** (read-only / writable / searchable / loadable) | — | gap (runtime memory) — *experimental in CF* |
| *(none yet)* | **agentic patterns** (chaining / routing / parallel / orchestrator / evaluator-optimizer) | — | gap (Suluk composition could *name* these) |

The rows touching CF **Skills** and CF **context memory** are flagged **provisional** inline, because those CF APIs
are experimental.

**2. The one collision (Skill) is kept and reserved, not renamed.** Suluk **Skill** = the agent's *model +
instruction tier* (presence of `model` is the hard route-vs-skill discriminator). Cloudflare **Skill** = *loadable
on-demand content* carrying no model (the agent owns the model). A Suluk skill **conflates two Cloudflare concepts**:

- its `model`/`tier`/`modelProfile` → the Cloudflare *agent's model config*, and
- its `provenance.source` → the generated `SKILL.md`, **which is itself a valid Cloudflare Agent-Skill artifact**.

Resolution: **keep `skills` unchanged** (honoring shipped C027), and **reserve the name `x-suluk-resources`** for
Cloudflare's loadable-catalog concept — to be *defined only when* Suluk grows runtime/memory descriptors
(built-by-nobody until then, mirroring C027/C028's reserve-a-floor discipline). The collision is thereby made
explicit and harmless rather than papered over.

**3. The pyramid is the existing determinism gradient, named — not a new kind.** The operator's pyramid **is** the
route(no-model)/skill(model) discriminator made into layers:

- **Layer 0 (deterministic floor):** `routes` (`guarantee: same-in-same-out`) projecting to MCP **tools** — the
  calculators. No internal AI; statically verifiable.
- **Layer k:** an agent = `skills` (model) + `routes` (layer < k) + `sub-agents` (layer < k); `maxDepth` bounds the
  height (a leaf = `maxDepth 0`).
- **Edges = MCP connections:** "each agent is an MCP + skills" ≡ *Suluk agent → a `@suluk/mcp` server projection +
  model-bearing skills*; routes/sub-agents are the MCP tools the parent's MCP client consumes.

An agent's **level** is a *pure static derivation* over the route/skill/sub-agent graph — DECLARED / derivable, never
schema-enforced, **never read by the D1 matcher** (no field references request/DOM/header/body values; the C027 D1
gate is untouched). No new normative kind, no meta-schema change.

**4. Per-layer static observability reuses shipped infra.** The operator's three asks already have homes, so the
pyramid adds a *view*, not enforcement: **hardening** → `gradeAgent` (A–F) + `@suluk/harden.combineGrades`;
**token-warning** → `contextBudget`/`thinking.budget` declared vs the `@suluk/agents` context-analyzer estimate;
**context-waste** → `tier` (resident-surface size) + round-accretion in `context.ts`. An optional `layerReport` is a
*composition* of these.

## Consequences

**Easier:** an author who knows Cloudflare's SDK can read a Suluk contract (and vice-versa) without a decoder ring;
the `@suluk/agents` Cloudflare/MCP/docs projections are now documented as *the same nouns under two names*; the
pyramid has a vocabulary, so "which layer is this agent / how deterministic is it / is it context-wasteful" become
sayable, statically-answerable questions; the Skill collision is on the record instead of latent.

**Harder / watch:** two anchor rows (CF Skills, CF context memory) ride **experimental** Cloudflare APIs and may
drift — the mapping flags them, but a CF rename would force a doc refresh. The reserved `x-suluk-resources` name is a
*promise of a seam*, not a built feature; it must stay built-by-nobody until a real memory-descriptor need appears,
or it becomes speculative scope. The `level` derivation and `layerReport` described in (3)/(4) are **not built by
this ADR** — this Step writes the vocabulary down; implementing them is a separate, lower-stakes Step.

**Not done here (deliberate, low-stakes follow-ups):** the static `agentLevel()` / `layerReport()` derivation in
`@suluk/agents`; naming the agentic-patterns Suluk composition expresses; wiring `x-suluk-cost → paidTool(price)`;
defining `x-suluk-resources` if/when memory descriptors land.
