# Types & Enums

## lint

### `LintFinding`
`@suluk/agents` — the Suluk Agent composition layer (C027). Lint + project an `x-suluk-agents` map (skills +
deterministic routes + by-name sub-agents) into a Claude plugin AND an OpenRouter/OpenAI-compatible manifest:
one contract, two artifacts, zero network at generate time. This package is the OTHER side of the D1 wall —
it reads `x-suluk-agents`, which @suluk/core's matcher (buildAda/matchRequest) provably never does. Selection
and tiering are runtime-advisory; determinism is DECLARED, never enforced. CANDIDATE tooling — NOT official OAS.

NB (the C027 module-boundary invariant): @suluk/core MUST NEVER import @suluk/agents. The dependency is one-way.
test/core-boundary.test.ts enforces it as a maintained tripwire.
**Properties:**
- `severity: Severity`
- `code: string` — machine code, e.g. "agent-cycle", "missing-max-depth", "dangling-operation-ref", "request-value-selector".
- `agent: string`
- `detail: string`
- `at: string` (optional) — dotted locus within the agent, e.g. "routes.run_core_primitive.operationRef".

### `Severity`
`@suluk/agents` — the Suluk Agent composition layer (C027). Lint + project an `x-suluk-agents` map (skills +
deterministic routes + by-name sub-agents) into a Claude plugin AND an OpenRouter/OpenAI-compatible manifest:
one contract, two artifacts, zero network at generate time. This package is the OTHER side of the D1 wall —
it reads `x-suluk-agents`, which @suluk/core's matcher (buildAda/matchRequest) provably never does. Selection
and tiering are runtime-advisory; determinism is DECLARED, never enforced. CANDIDATE tooling — NOT official OAS.

NB (the C027 module-boundary invariant): @suluk/core MUST NEVER import @suluk/agents. The dependency is one-way.
test/core-boundary.test.ts enforces it as a maintained tripwire.
```ts
"error" | "warning" | "info"
```

## resolve

### `OperationLocus`
```ts
"path" | "webhook" | "job"
```

### `ResolvedOperation`
**Properties:**
- `locus: OperationLocus`
- `container: string` — the container key (path template / webhook name / job name).
- `requestName: string` (optional) — the by-name request handle within a pathItem (paths only).
- `request: Request` (optional)

## skill

### `SkillRenderInput`
**Properties:**
- `name: string`
- `description: string`
- `instructions: string` — the instruction snapshot (the served /v1/instructions content, pinned at generate time).
- `source: string` (optional) — the URL the snapshot was taken from (recorded in the stamp; not fetched here).
- `version: string` (optional)

## project

### `ClaudePluginArtifacts`
**Properties:**
- `files: Record<string, string>` — path → content; e.g. "plugin.json", ".mcp.json", "skills/operate/SKILL.md".

### `OpenRouterAgentManifest`
**Properties:**
- `name: string`
- `model: string[]` — model preference list (cheap→capable) from the primary skill; the OpenRouter ids to try in order.
- `tier: "resident" | "cold-tail"` (optional)
- `instructions: { source?: string; contentHash?: string; version?: string }` — a POINTER to the served instructions + the pinned hash — never inlined creds, never the full text by default.
- `tools: OpenRouterFunctionTool[]` — The DEFAULT tool surface — RESIDENT routes only, plus a synthetic `discover_tools` when cold-tail routes exist.
This is the tier-trim: the cheap/lower tier carries a SMALLER tool surface (the conditional context reduction).
- `discoverable: OpenRouterFunctionTool[]` — COLD-TAIL routes — NOT in the default surface; revealed on demand via `discover_tools`.
- `subAgents: { name: string; ref: string }[]` — sub-agents → one front-door tool each (dispatched as a NEW completion at the child's tier).

### `OpenRouterFunctionTool`
**Properties:**
- `type: "function"`
- `function: { name: string; description: string; parameters: SchemaOrRef }`

## cloudflare

### `CloudflareAgentArtifacts`
**Properties:**
- `files: Record<string, string>` — path → owned source the user writes into their Worker project (one agent file per REACHABLE agent + the worker).
- `durableObjects: { binding: string; className: string }[]` — ONE entry per reachable agent (root + transitive sub-agents) — feed straight to `@suluk/deploy`'s `durableObjects`
 / `@suluk/cloudflare`'s `DeployPlan.durableObjects` (Stage 1.1/1.2); each becomes a bound + migrated Durable Object.
- `reachableSubAgents: string[]` — the reachable sub-agent KEYS (x-suluk-agents map keys), each now scaffolded as its own file (cross-agent DISPATCH is yours to wire).

## node

### `NodeAgentArtifacts`
**Properties:**
- `files: Record<string, string>` — path → owned source the user writes into their Node/Bun project.
- `reachableSubAgents: string[]` — reachable sub-agents (NOT scaffolded by this v1 adapter — see Cloudflare's recursive version).

## runtime

### `AgentRuntimeProvider`
A runtime target. PURE: it projects the agent into owned source; the host writes the files + deploys (mirrors DeployProvider).
**Properties:**
- `name: string`

### `AgentRuntimeArtifacts`
What every runtime adapter returns: owned source + the reachable sub-agent list + the deploy hint.
**Properties:**
- `files: Record<string, string>` — path → owned source the user writes into their project.
- `reachableSubAgents: string[]` — reachable sub-agents (each a separate runtime unit; scaffold per provider).
- `deploy: RuntimeDeployHint` — provider-specific deploy descriptor (Cloudflare → `@suluk/deploy`'s `durableObjects`; Node → none).

### `RuntimeDeployHint`
The provider-specific deploy hint — a discriminated union (tightened from `Record<string,unknown>` once a 2nd adapter
landed, per the C034 follow-up). Cloudflare ships the Durable Object descriptor for `@suluk/deploy`; the Node runtime
is a plain long-lived process with no provisioned infra. A future adapter adds a new `kind`.
```ts
{ kind: "cloudflare"; durableObjects: { binding: string; className: string }[] } | { kind: "node" }
```

## runtime-shared

### `RouteToolDef`
A tool DERIVED from a route's operation — the runtime-agnostic shape every adapter renders its own way.
**Properties:**
- `key: string` — the wire-level tool id (the route key).
- `description: string` — the LLM-facing description (the operation's summary/description; falls through an empty summary).
- `schema: SchemaOrRef` — the input JSON Schema (the operation's body), fed verbatim to the runtime's tool factory.
- `approval: { required: true; reason?: string }` (optional) — the HITL gate from x-suluk-approval, when required (projects to e.g. the Agents SDK `needsApproval`).
- `price: PaidToolPrice` (optional) — the x402 paidTool price from x-suluk-cost, when a chargeable cost is declared (DECLARED, never enforced — C026).
- `operationRef: string` — the by-name operationRef the tool dispatches to (used in the execute stub).

### `PaidToolPrice`
An x402 `paidTool` price derived from a route's declared `x-suluk-cost` (C026/C035).
**Properties:**
- `priceUsd: number` — the flat per-call price in USD — the `paidTool(name, desc, PRICE, …)` argument.
- `microUsd: number` — the same, raw micro-USD (the cost model's native unit; 1 USD = 1_000_000 µ$).
- `metered: boolean` — true ⇒ ALSO has usage-metered components a fixed per-call price can't capture — the honest pointer to MPP `session`.

## conformance

### `ConformanceFinding`
**Properties:**
- `severity: "error" | "warning"` — `error` is gate-failing (a conformance FAILURE); `warning` is advisory.
- `code: string`
- `detail: string`

## scope

### `Scope`
```ts
string[] | null
```

### `ScopeEscalation`
**Properties:**
- `parent: string` — the agent whose declared grant is exceeded by a child.
- `childLocal: string` — the local handle of the offending sub-agent.
- `child: string` — the resolved child agent key.
- `perms: string[]` — the permissions the child declares that the parent does NOT grant (silently dropped under intersection).

## manifest

### `AgentManifest`
**Properties:**
- `manifestVersion: 1`
- `agent: string`
- `nodes: AgentManifestNode[]` — the root + every transitively-reachable sub-agent, sorted by name (canonical).
- `reachable: { tools: string[]; agents: string[] }` — the statically-enumerable worst-case reachable surface.
- `escalations: ScopeEscalation[]` — any per-edge scope escalations (an installable agent has none).

### `AgentManifestNode`
**Properties:**
- `name: string`
- `description: string`
- `effectiveScope: Scope` — effective scope after intersection along the reaching path (null = unconstrained).
- `skills: AgentManifestSkill[]`
- `routes: AgentManifestRoute[]`
- `subAgents: string[]`
- `governed: AgentManifestGoverned` (optional) — operator-effective surface after x-suluk-policy (C028) — so the C021 signature covers the operator's caps.
- `modelSelection: { skill: string; ids: string[]; from: "declared" | "selected"; snapshotHash: string | null; resolve: "pinned" | "router" | "latest"; pickPinned: boolean }[]` (optional) — catalog-pinned model selection per skill (present only when agentManifest is given a catalog) — reproducible: the
snapshotHash is signed (the SURVIVOR SET), so a re-pick week-over-week with no author edit is auditable. `resolve`
is the C030 mode; `pickPinned` false ⇒ set-pinned but the served id is NOT reproducible (router/latest).

### `AgentManifestSkill`
**Properties:**
- `name: string`
- `model: string[]`
- `tier: "resident" | "cold-tail"` (optional)
- `source: string` (optional)
- `contentHash: string` (optional) — the pinned hash of the served instructions — what the signature ends up covering.
- `version: string` (optional)

### `AgentManifestRoute`
**Properties:**
- `name: string`
- `operationRef: string`
- `guarantee: "same-in-same-out" | "idempotent" | "safe"` (optional)

### `AgentManifestGoverned`
The operator-effective surface after x-suluk-policy narrowing (present only when a policy governs the agent).
**Properties:**
- `scope: Scope`
- `maxDepth: number` (optional)
- `nestingForbidden: boolean`
- `allowedTools: string[]`
- `deniedTools: string[]`
- `allowedSubAgents: string[]`

## policy

### `EffectiveAgent`
**Properties:**
- `agent: string`
- `scope: Scope` — INTERSECT(agent.scope, policy.scopeAllowlist).
- `maxDepth: number` (optional)
- `nestingForbidden: boolean`
- `skills: EffectiveSkill[]`
- `allowedTools: string[]`
- `deniedTools: string[]`
- `allowedSubAgents: string[]`
- `deniedSubAgents: string[]`

### `EffectiveSkill`
**Properties:**
- `name: string`
- `model: string[]` — INTERSECT(skill.model, policy.modelAllowlist).
- `tier: "resident" | "cold-tail"` (optional)
- `usable: boolean` — false ⇒ model ∩ allowlist = ∅: the operator's allowlist leaves this skill no model to run.

### `PolicyNarrowing`
**Properties:**
- `axis: "scope" | "tier" | "model" | "maxDepth" | "tools" | "retrievalTools" | "subAgents" | "nesting"`
- `detail: string`

### `PolicyConstrainResult`
**Properties:**
- `effective: EffectiveAgent`
- `narrowings: PolicyNarrowing[]`

## context

### `ContextReport`
**Properties:**
- `loads: AgentContextLoad[]`
- `findings: LintFinding[]`
- `suggestions: UnflattenSuggestion[]` — unflatten suggestions for over-target agents (split DOWN).
- `flatten: FlattenSuggestion[]` — flatten suggestions for thin/redundant layers (collapse UP).

### `AgentContextLoad`
**Properties:**
- `agent: string`
- `instructionsTokens: number`
- `instructionsMeasured: boolean`
- `residentToolTokens: number`
- `overheadTokens: number`
- `totalTokens: number`
- `coldTailTokens: number`
- `tools: ToolContextCost[]`
- `subAgentCount: number`
- `minWindowRequired: number` — the minimum context window a model needs to run this agent (= the multi-round PEAK load).
- `maxRounds: number` (optional) — within-agent thinking cap (C029), if declared.
- `thinkingBudget: number` (optional)
- `peakTokens: number` — worst-case load accounting for thinking round-accretion (= totalTokens when no thinking). Fit checks use THIS.
- `modelFit: ModelFit[]` — which DECLARED models are expected to work (window ≥ load) and which can't hold it.
- `budget: number` (optional)
- `modelWindow: number` (optional) — the smallest declared model window (the binding window constraint), if any model is known.
- `target: number` (optional)
- `utilization: number` (optional)

### `UnflattenSuggestion`
**Properties:**
- `agent: string`
- `reason: string`
- `moveToColdTail: string[]`
- `wouldSaveTokens: number`
- `alsoConsider: string`

### `FlattenSuggestion`
The dual of unflatten: a thin/redundant layer worth collapsing UP into its parent.
**Properties:**
- `parent: string`
- `child: string`
- `reason: string`
- `mergedParentTokens: number` — the parent's load if the child's resident tools+instructions were inlined.
- `fitsTarget: boolean`
- `savedHopOverhead: number` — per-hop overhead removed by collapsing (the child's framing + its dispatch tool).

### `ModelFit`
Per declared candidate model: does its context window hold this agent's load? (window null ⇒ unknown model.)
**Properties:**
- `model: string`
- `window: number | null`
- `fits: boolean | null`
- `headroom: number | null`

### `ToolContextCost`
**Properties:**
- `name: string`
- `tokens: number`
- `tier: "resident" | "cold-tail"`

## model-select

### `SkillModelResolution`
**Properties:**
- `ids: string[]`
- `from: "declared" | "selected"`
- `selection: SelectResult` (optional) — the selector result (filter trace + per-axis why + coverage gaps) when `from === "selected"`.
- `snapshotHash: string | null` — the catalog snapshot the SURVIVOR SET was pinned against (null when declared).
- `target: ResolvedTarget` — the resolved runtime target (pin / router / latest).
- `pickPinned: boolean` — true ⇒ the SERVED model id is reproducible (pinned). false ⇒ set-pinned but pick-NOT-pinned (router/latest).

### `ResolvedTarget`
How a skill RESOLVES to a runtime model (C030, council wf_75f87ab6-b1b — unanimous hybrid). We keep the survivor
SET (governance + caps + min-context, the moat) and either PIN a concrete reproducible id, or DELEGATE the
per-request pick to OpenRouter's auto-router fenced by our ENUMERATED survivor allowlist (never a wildcard).
```ts
{ kind: "pinned"; model: string } | { kind: "router"; model: "openrouter/auto"; allowedModels: string[]; costQualityTradeoff: number; provider?: { zdr: true } } | { kind: "latest"; model: string; note: string }
```

## types

### `ModelCatalog`
**Properties:**
- `schemaVersion: string`
- `generatedAt: string`
- `snapshotHash: string` — content-addressed so a selection is reproducible week-over-week (ties C027 contentHash).
- `rows: ModelRecord[]`

### `SelectResult`
**Properties:**
- `ranked: RankedModel[]` — ranked best-first; empty when no model satisfies the hard filters.
- `candidateCount: number` — the count after hard filtering.
- `unsatisfiable: string[]` (optional) — present when the requirements emptied the set — names the unsatisfiable filter(s).
- `coverageGaps: string[]` — UNKNOWN-coverage warning: soft axes with no data on the winner (honesty surface).

### `Preferences`
Preference — RANKS the survivors. A named profile is the 90% case; the escape hatch is ≤4 small int weights.
**Properties:**
- `profile: Profile` (optional)
- `prefer: { intelligence?: 0 | 1 | 2 | 3; cost?: 0 | 1 | 2 | 3; speed?: 0 | 1 | 2 | 3; context?: 0 | 1 | 2 | 3 }` (optional)
- `taskShape: "agentic" | "coding" | "reasoning"` (optional) — routes the single "intelligence" knob to the ONE relevant INTEL sub-tier.

### `HardFilters`
Hard requirements — these FILTER (can empty the set ⇒ fail-loud), never rank.
**Properties:**
- `needsTools: boolean` (optional)
- `needsForcedToolChoice: boolean` (optional)
- `needsStructured: boolean` (optional)
- `strictSchema: boolean` (optional)
- `inputModalities: string[]` (optional)
- `outputModalities: string[]` (optional)
- `minWindowRequired: number` (optional) — the analyzer's per-agent minWindowRequired (context.ts) becomes the hard min-context gate.
- `minOutputTokens: number` (optional)
- `fidelityFloor: Tier` (optional)

<!-- truncated -->
