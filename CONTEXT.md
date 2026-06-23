# Suluk — OpenAPI v4.0 Candidate (forked from Moonwalk)

Suluk is a single-contributor effort, grounded in the Adam substrate suite (burhan / daftar / mizan), to author a complete, internally-consistent **candidate** for OpenAPI Specification v4.0 — honestly labelled as a fork/proposal, not as closure of the official Moonwalk SIG. This glossary is the shared language for that effort; it is a glossary only, not a spec or a plan.

## Language

**Suluk**:
The name of this candidate effort (سُلوك, "the walk"; substrate codename `asl-ojs`). The independent, single-contributor v4.0 candidate built here — distinct from the SIG's Moonwalk.
_Avoid_: Moonwalk (that is the upstream effort, not ours)

**Candidate v4.0**:
The complete, internally-consistent specification document we author end-to-end. Our artifact, under our control. Distinct from anything the official SIG ratifies.
_Avoid_: the spec, moonwalk, v4 (all ambiguous with the official effort)

**Completion**:
The state in which the Candidate v4.0 is internally coherent as a **single unified document covering every Concern** (API shapes, content schema formats, deployment configuration, foundational interfaces, mechanical upgrade). Monolithic — there is no per-module finish line, so Completion is judged on whole-document coherence. Explicitly **not** official ratification, SIG consensus, or community adoption.
_Avoid_: done, shipped, ratified, finished

**Concern**:
One of the loosely-coupled areas Moonwalk separates: API shapes, content schema formats, deployment configuration, foundational interfaces, mechanical upgrade. In our Candidate these are sections of one document, not separate deliverables.
_Avoid_: module, package (they are not independently shipped)

**Originated section**:
A part of the Candidate with no strong SIG prior, constructed by burhan from the principles. Carries an inherently low confidence ceiling until independently witnessed; contrast with an Inherited prior. Deployment, upgrade, and foundational-interface areas are mostly Originated.
_Avoid_: draft, stub (those describe maturity, not provenance)

## The walk (recursive state)

**Walk**:
The cross-session process of resolving the Frontier to Completion, one decision per Step. Defined by [C002](./doc/architecture/decisions/C002-recursive-state-mechanism.md).
_Avoid_: process, loop (when ambiguous with the SIG's process)

**Step**:
One iteration of the Walk: load Spine → pick a question → resolve to Inherited prior or Deviation → write the Ledger + receipt → re-project → update the Spine.
_Avoid_: task, iteration

**Spine**:
The thin state loaded at the start of every Step (`plan/STATE.md` + `plan/MAIN.bn`). Holds the active set and a complete index; bounded in size forever. Indexed ≠ carried.
_Avoid_: state, context, summary

**Frontier**:
The set of open design questions (`plan/frontier.md`), seeded from the SIG record. The Walk's work-list; a Step pops one.
_Avoid_: backlog, todo, queue

**Ledger**:
The durable, append-only decision store (`plan/facts/*.bn` burhan claims + daftar receipts). The source of truth; grows without limit, loaded on demand.
_Avoid_: log, history

**Projection**:
The spec document, regenerated from the Ledger rather than hand-maintained. The document is downstream of the decisions, never the reverse.
_Avoid_: draft, output, build

## The council ([C006](./doc/architecture/decisions/C006-backtested-persona-council.md))

**Persona**:
A predictive model of a recurring SIG voice, built only from their public statements and carrying a backtest-derived confidence ceiling. A model-guess, never attributed to the real person as fact.
_Avoid_: profile, the person's name as a fact-source

**Council**:
The set of *calibrated* Personas (those that passed their blind backtest), consulted as a "what would they object to?" guide — example guides, not prophets. Predictions feed a Step as hypotheses and an adversarial lens; they never substitute for the real record or raise a decision's ceiling.
_Avoid_: oracle, panel (reserved for the workflow's adversarial verifiers)

**Backtest**:
The blind out-of-sample test that validates an *individual* Persona: the builder sees only a train slice, the predictor sees only held-out prompts (not answers), a judge scores prediction-vs-reality. Hit-rate sets the ceiling. Calibration lives in `plan/council/CALIBRATION.md`.
_Avoid_: evaluation, check

**Disposition**:
A Class-B council lens (optimist, pessimist, expansionist, contrarian, …) — a reasoning *stance*, not a real person. Predicts no one; carries no predictive ceiling. A generative lens to stress-test a decision ([C007](./doc/architecture/decisions/C007-council-persona-classes.md)).
_Avoid_: persona (reserve for backtested individuals), prediction

**Role**:
A Class-C council lens (codegen author, platform architect, security reviewer, AI/LLM consumer, …) — a *synthetic stakeholder* representing who the standard affects. Capped, grounded where evidenced; "who does this help/hurt?", never a real person's view.
_Avoid_: persona, stakeholder-as-individual

**Usefulness-replay**:
The validation gate for Dispositions and Roles: replay the lens against resolved Steps and check whether it surfaces considerations that genuinely mattered (true positives) vs noise. The honest analog of the Backtest for non-predictive lenses.
_Avoid_: backtest (reserve for predictive individual validation)

**The SIG**:
The official OpenAPI Moonwalk Special Interest Group and its consensus process (discussions → weekly-call consensus → ADRs → eventual formal spec). We are an external contributor building a candidate; we are not the SIG and cannot ratify on its behalf.
_Avoid_: the project, moonwalk (when meaning the official body)

**Prior**:
An existing position from the SIG record — an accepted ADR, an initial proposal, or a discussion consensus — that we treat as input to our reasoning, with an explicit confidence ceiling, rather than as fixed truth.
_Avoid_: requirement, given, fact

**Inherited prior**:
A Prior we adopt unchanged into the Candidate. Default outcome for any Prior; recorded so the Candidate's lineage to the SIG record is always traceable.
_Avoid_: assumption, copy

**Deviation**:
A point where the Candidate departs from a Prior. Permitted only with a recorded justification receipt — the contested claim, its cite-chain, why the Prior was insufficient, and the new confidence ceiling. Never silent.
_Avoid_: change, override, fix (when unrecorded)

## Composable units ([C027](./doc/architecture/decisions/C027-suluk-agents-composition-map.md))

> Four "composable-unit" nouns that must NOT collapse — if they blur, codegen/conformance mislabels a stochastic thing as deterministic. Each is a distinct locus with a distinct determinism posture.

**Route** (deterministic):
An ordinary Suluk operation (`paths[*]` / `webhooks` / `x-suluk-jobs`) — same input → same output, statically matched (the DOM→ADA matcher). Inside an agent it appears ONLY as a by-name `operationRef` `$ref`, never inlined, and never carries a `model`.
_Avoid_: tool (ambiguous with MCP tool), endpoint (3.x flavour)

**Skill** (LLM):
An instruction bundle inside an agent — the system-text tier, identified by the PRESENCE of a `model`. Its text is a provenance pointer (`source` + `contentHash` + `version`) the projected `SKILL.md` is generated from, not inlined prose.
_Avoid_: prompt (too narrow), instruction (when meaning the served source of truth)

**Agent** (orchestrator):
A `SulukAgent` in the top-level `x-suluk-agents` map — an LLM-orchestrated unit composed of skills + deterministic routes + (optional, by-name) sub-agents. A vendor extension layered ON TOP of the API, never read by the matcher. Projects to a Claude plugin AND an OpenRouter manifest.
_Avoid_: assistant, bot, module (a different noun — see below)

**Module** ([C021](./doc/architecture/decisions/C021-modules-contract-merge-marketplace.md)):
A contract-merge fragment distributed through the signed marketplace — a *packaging/governance* unit of the document, NOT an LLM orchestration. An agent may ship AS a module; an agent is not itself a module.
_Avoid_: agent, package, plugin (a plugin is one projection target, not the unit)

**Job** ([C025](./doc/architecture/decisions/C025-jobs-vendor-map.md)):
A `SulukJob` in `x-suluk-jobs` — non-HTTP background work (cron / queue) with no inbound Request. Disjoint from a route (which has a Request) and from an agent (which orchestrates).
_Avoid_: route, webhook, task

## Cloudflare alignment — the Rosetta layer ([C035](./doc/architecture/decisions/C035-cloudflare-terminology-alignment.md))

> A legibility layer over C027, **not** a rename. Suluk keeps its deliberate nouns (the contract author's words); this
> table says what each one *is* in **Cloudflare Agents SDK** terms and what it projects to, so the two vocabularies are
> readable as one. Suluk names the **contract**; Cloudflare names the **running instance**. Rows marked _provisional_
> ride Cloudflare APIs that are explicitly experimental and may drift.

| Suluk (contract) | Cloudflare (runtime) | Projects to |
| --- | --- | --- |
| **Agent** (`x-suluk-agents.<n>`) | **Agent** (`AIChatAgent`/`Think` Durable Object) | the AIChatAgent scaffold + worker |
| **Route** (`routes`, no `model`) | **server-side Tool** (`tool()`) | an MCP `tool()` |
| **sub-agent** (`agents` + `maxDepth`) | **sub-agent** (`subAgent()`) / **agent-as-tool** (`agentTool()`) | a DO per sub-agent + `agentTool` |
| **`x-suluk-approval`** | **`needsApproval`** / `waitForApproval()` / `elicitInput()` | tool `needsApproval` |
| **`thinking.maxRounds`** (C029) | **`stopWhen: stepCountIs(n)`** (AI SDK) | `stepCountIs(maxRounds)` |
| **`tier`** (`resident`/`cold-tail`) | tool-merge-order + lazy Skill loading | `discover_tools` trim |
| **`x-suluk-cost`** (C026, declared) | **`paidTool`** price (x402) / MPP `charge` | `paidTool(price)` (future) |
| **Job** (`x-suluk-jobs`, C025) | **Scheduled tasks** (`schedule()`) / Workflows | `schedule()` / Workflow |
| **Skill** (`skills`, model-bearing) | _provisional:_ **Agent Skills** (`agents/skills`) / read-only **soul** | `SKILL.md` + the agent's model config |

**Skill** is the one genuine **collision**, kept-and-reserved (C035): Suluk Skill = an agent's *model + instruction
tier* (presence of `model` is the discriminator); Cloudflare Skill = *loadable on-demand content* with no model. A
Suluk skill conflates two CF concepts — its `model*` fields → the CF agent's model config; its `provenance.source` →
the generated `SKILL.md`, which *is* a valid CF Agent-Skill artifact. We keep `skills` unchanged; the reserved name
`x-suluk-resources` was subsequently **defined ([C036](./doc/architecture/decisions/C036-suluk-resources-loadable-catalog.md), operator-directed)** as CF's loadable-catalog concept — see **Resource** below.
_Avoid_: equating Suluk Skill with Cloudflare's `agents/skills` catalog (opposite granularity)

**Resource** ([C036](./doc/architecture/decisions/C036-suluk-resources-loadable-catalog.md)):
A member of the top-level `x-suluk-resources` catalog — loadable, on-demand *content* (instructions / reference /
script) an agent activates when a task matches (Cloudflare "Agent Skills", contract-first). **Content-only, no model**
— that is what walls it off from a Skill (model-bearing, always-on). Its `provenance` pointer generates a `SKILL.md`
(a valid CF Agent-Skill artifact), never inlined prose. Structural, advisory, never wire-enforced; experimental-anchored
(CF Agent Skills are experimental) ⇒ low ceiling. An agent references it by-name via `resources`.
_Avoid_: skill (model-bearing, always-on — the opposite); calling it always-on (it is lazy/loaded-on-demand)

**Pyramid** ([C035](./doc/architecture/decisions/C035-cloudflare-terminology-alignment.md)):
The agent stack viewed as determinism layers — the route(no-model)/skill(model) discriminator made vertical. **Layer 0**
= `routes` (deterministic floor, → MCP tools, the "calculators"); **Layer k** = an agent composing `skills` + lower-layer
routes + sub-agents; `maxDepth` bounds the height. **Edges** are MCP connections (each agent → a `@suluk/mcp` server; its
routes/sub-agents are the MCP tools a parent consumes). An agent's **level** is a pure static derivation over the
composition graph — DECLARED, never schema-enforced, never read by the D1 matcher.
_Avoid_: hierarchy, tree (the edges are MCP wires, not containment); calling a higher layer "smarter" as fact (it is *less deterministic + more general*, not better)
