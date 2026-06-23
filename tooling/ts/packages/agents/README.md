# @suluk/agents

**One `x-suluk-agents` contract → a Claude plugin AND an OpenRouter manifest — linted, signable, zero network at generate time.**

> **CANDIDATE tooling — not official OpenAPI.** Suluk is a single-contributor *candidate* of the
> OpenAPI v4.0 ("Moonwalk") line, not a ratified spec. `x-suluk-agents` is a vendor extension; treat
> these artifacts as proposals, pin your versions, and expect churn.

Declare an agent **once** inside your v4 document — its skills (model-bearing LLM tiers), its
deterministic routes (by-name tool calls to real operations), and its by-name sub-agents — then
*project* that one declaration into the two artifacts that actually run it: a Claude plugin
(`plugin.json` + `.mcp.json` + generated `SKILL.md`) and an OpenRouter/OpenAI-compatible tool manifest.
Both projections are **pure functions** of `(doc, agentName, opts)`: no network, deterministic,
byte-identical out for the same contract in.

The hard line this package holds (C027): selection and tiering are **runtime-advisory** —
*determinism is DECLARED, never enforced*. The matcher in `@suluk/core` (`buildAda`/`matchRequest`)
provably never reads an `x-suluk-agents` field; this package is the only thing that does. A maintained
tripwire (`test/core-boundary.test.ts`) enforces that `@suluk/core` never imports `@suluk/agents`.

## Install

```bash
bun add @suluk/agents
```

## What it does

- **Lints** an `x-suluk-agents` map against rules JSON-Schema cannot express: acyclicity, declared
  `maxDepth`, every `operationRef` resolving to a real operation, and the D1 red-line — **no agent
  field may carry a request-value selector** (a runtime expression), so the matcher can never be
  pressured into dynamic dispatch.
- **Projects** one agent two ways: `projectClaudePlugin` (a ready-to-ship Claude plugin) and
  `projectOpenRouter` (a function-tool manifest). Both refuse to emit a broken artifact — a dangling
  ref or missing depth bound throws (fail-loud), never a silently-broken file.
- **Tier-trims** the served surface: `resident` routes go in the default tool list; `cold-tail`
  routes sit behind a synthetic `discover_tools` meta-tool — the conditional context reduction.
- **Signs + verifies freshness**: `agentManifest` emits a canonical, signable manifest carrying each
  skill's `contentHash`, so a signature over it covers preprompt drift (`verifyAgentFreshness`).
- **Audits + observes**: a static reachable-surface enumerator + over-serve auditor (`conformance`),
  an operator-governance overlay (`policy`, monotone-narrowing MEET), a context-budget analyzer
  (`context`), a model-selection seam over `@suluk/models`, and a zoomable agent diagram.

## When to reach for it

Reach for `@suluk/agents` when you have a v4 document and want to **package its agent surface** for
Claude and/or OpenRouter from a single declaration — and to gate that declaration (lint), sign it,
and right-size its context before it ships.

It is the LLM-facing *composition* layer. Its sibling `@suluk/mcp` serves the operations as an MCP
server (the runtime); this package *projects + audits* the agent contract that sits on top. It does
not host, execute an agent, fetch a preprompt, or hold a credential — see **Boundary**.

## Usage

The input is your v4 document with an `x-suluk-agents` block; everything below is keyed by the agent
name within that block. (`agentName` = e.g. `"conin"`.)

### Lint — the install gate

```ts
import { lintAgents, lintOk, assertAgentInstallable } from "@suluk/agents";

const findings = lintAgents(doc);              // LintFinding[] — severity/code/agent/detail/at
if (!lintOk(findings)) {                        // false ⇒ at least one error-severity finding
  for (const f of findings.filter((f) => f.severity === "error")) {
    console.error(`${f.code} @ ${f.agent}.${f.at ?? ""}: ${f.detail}`);
  }
}

assertAgentInstallable(doc, "conin");           // throws if "conin" does not install (else void)
```

### Project a Claude plugin

```ts
import { projectClaudePlugin } from "@suluk/agents";

const plugin = projectClaudePlugin(doc, "conin", {
  mcpUrl: "https://construction-intelligence.saastemly.com/mcp",
  version: "1.0.0",
  homepage: "https://construction-intelligence.saastemly.com",
  // pinned instruction snapshots per skill name (never fetched at generate time);
  // a skill without one emits no SKILL.md (we never invent text)
  instructions: { operate: "You are Conin. Deterministic-first: every NUMBER comes from a tool…" },
});

plugin.files;
// {
//   "plugin.json":            …,   // name, description, mcpServers: "./.mcp.json"
//   ".mcp.json":              …,   // { type: "http", url, oauth: {} } — NO embedded token (creds host-side)
//   "skills/operate/SKILL.md": …,  // carries contentHash + version staleness stamp
// }
```

### Project an OpenRouter / OpenAI-compatible manifest

```ts
import { projectOpenRouter } from "@suluk/agents";

const m = projectOpenRouter(doc, "conin", {
  instructions: { operate: "You are Conin…" },   // optional; pins the served contentHash
});

m.model;          // ["anthropic/claude-opus-4", "google/gemini-2.5-flash"] — from the primary skill
m.tier;           // "resident" | "cold-tail"
m.tools;          // resident routes as { type:"function", function:{name,description,parameters} }[]
                  //   + a synthetic `discover_tools` ONLY when cold-tail routes exist
m.discoverable;   // cold-tail routes — kept OUT of the default surface
m.subAgents;      // [{ name: "retrieval", ref: "#/x-suluk-agents/coninRetrieval" }]
m.instructions;   // { source, contentHash, version } — a pointer + pinned hash, never raw text by default
```

### Project a Cloudflare Agents-SDK scaffold (the RUNTIME — emits the `durableObjects` descriptor `@suluk/deploy` consumes)

The third projection target: one declaration → an **owned** Cloudflare Agents-SDK Worker. It emits exactly the wiring
the Stage-0 measurement proved derivable (~71%) — the `AIChatAgent` class, the `routeAgentRequest` worker, the Env
bindings, and each tool's name/description/**input schema** (via the `ai` SDK's `jsonSchema()`) + the `needsApproval`
gate from `x-suluk-approval`. The bespoke brain (model, system prompt, loop policy, each tool's `execute`) is left as
clearly-marked TODOs — generating it would be over-abstraction. L3-pure: source strings only, no `agents`/`ai` dep, no
credential ever embedded.

```ts
import { projectCloudflareAgent } from "@suluk/agents";

const a = projectCloudflareAgent(doc, "weatherAssistant", {
  instructions: { chat: "You are a helpful weather assistant." }, // optional; inlined + contentHash-pinned as the system prompt
  // className: "WeatherAssistant",   // default = PascalCase(agentName)
  // mcpUrl: "https://host/mcp",       // optional; referenced in the execute-stub comment (never embedded as a credential)
});

a.files;             // one src/agents/<Class>.ts per REACHABLE agent (root + transitive sub-agents) + src/index.ts (the worker)
a.durableObjects;    // one { binding, className } per reachable agent → feed @suluk/deploy's `durableObjects` (binds + migrates each DO)
a.reachableSubAgents; // the sub-agent keys (each now scaffolded as its own file); cross-agent DISPATCH is yours to wire
```

A multi-agent contract (e.g. an orchestrator + an untrusted retrieval tier) is scaffolded whole: a Durable Object class
per reachable agent, each wiring its OWN tools, and one worker exporting them all with a combined `Env`. `opts.className`
renames only the root; sub-agents use PascalCase of their `x-suluk-agents` key (a class-name collision fails loud).

The returned `durableObjects` is exactly the shape [`@suluk/deploy`](../deploy)'s `DeployInput.durableObjects` /
[`@suluk/cloudflare`](../cloudflare)'s `DeployPlan.durableObjects` expect — so the same contract that scaffolds the
agent also declares its Durable Object binding + sqlite migration.

Both projections throw on a non-installable agent — a day-one dangling `operationRef` fails on **both**
targets rather than emitting a broken artifact.

### Sign a manifest + catch preprompt drift

```ts
import { agentManifest, verifyAgentFreshness, contentHash } from "@suluk/agents";
import { signRegistry, verifyRegistrySignature, generateSigningKeypair } from "@suluk/builder";

const manifest = agentManifest(doc, "conin");   // canonical: root + reachable sub-tree, sorted
// pin each skill's hash to the actually-served snapshot, then sign with the same C021 ECDSA path
manifest.nodes.find((n) => n.name === "conin")!.skills[0].contentHash = contentHash(servedText);

const { publicKey, privateKey } = await generateSigningKeypair();
const sig = await signRegistry(manifest, privateKey);

await verifyRegistrySignature(manifest, sig, publicKey);              // structural tamper → false
verifyAgentFreshness(manifest, { "conin/operate": servedText });     // drifted snapshot → "stale-skill"
```

### Conformance — static reachable surface + over-serve auditor

```ts
import { reachableSurface, residentToolNames, assertServedSubset, assertDefaultServedResident } from "@suluk/agents";

reachableSurface(doc, "conin");
// { tools: ["find_comparables","generate_deliverable","run_core_primitive","search_library"], agents: ["coninRetrieval"] }

residentToolNames(doc, "conin");                 // the resident (default-served) tools — feed this to mcpApp({ resident })

assertServedSubset(doc, "conin", servedNames);   // [] if served ⊆ reachable; else "over-serve" findings
assertDefaultServedResident(doc, "conin", served); // "cold-tail-in-default" if a cold-tail tool leaks into the default surface
```

### Operator governance (policy) + context budget + model selection

```ts
import { effectiveUnderPolicies, lintPolicy, contextReport, skillModels, SEED_CATALOG } from "@suluk/agents";

// C028: effective = INTERSECT(operator x-suluk-policy, agent) — monotone-narrowing, never widens
const { effective, narrowings } = effectiveUnderPolicies(doc, "conin");
lintPolicy(doc);                                  // policy-unsatisfiable / dangling / request-value-selector …

// C027: estimate each agent's default context load vs its budget + smallest model window
const report = contextReport(doc, { catalog: SEED_CATALOG });
report.findings;                                  // no-fitting-model / context-over-budget / flat-agent-overloaded …
report.suggestions;                               // what to move to cold-tail when overloaded

// C027 × @suluk/models: a needs-based skill resolves to the best CURRENT catalog model (never a hard-coded id)
const pick = skillModels(doc, "conin", "operate", SEED_CATALOG);
pick.ids;                                          // selected model ids; pick.from === "selected" | "declared"
```

### Grade — one A–F number + a CI gate (the harden idiom for the agent surface)

```ts
import { gradeAgent, gradeAgents, assertAgentGrade } from "@suluk/agents";

// Static by default — aggregates the install lint + context-budget/model-fit + two structure checks (no-tiering,
// fully-unpinned skill). Pass a served fact to fold in the over-serve / cold-tail-in-default / drift checks.
const r = gradeAgent(doc, "conin", {
  catalog: SEED_CATALOG,                 // enables model-fit
  served: ["list_library", "get_study"],  // folds in over-serve + cold-tail-in-default conformance
  snapshots: { operate: servedText },     // folds in skill-freshness (drift) — keyed by bare skill name
});
r.grade;        // "A" | "B" | "C" | "D" | "F"   (F ⟺ !shippable — a ship-blocking error; warnings alone never go below D)
r.shippable;    // false ⇒ at least one error-severity finding (any dimension)
r.byDimension;  // findings grouped: lint / context / structure / conformance / freshness
r.suggestions;  // the inverse-fix pointers (which resident tools to push to cold-tail)

gradeAgents(doc);                          // the rollup, weakest first (computes the whole-doc passes once)
assertAgentGrade(doc, "conin", "B");       // CI gate: throws below the floor (returns the report on pass)
```

The grade is the agent-COMPOSITION dimension; tool-INPUT hardening stays [`@suluk/harden`](../harden)'s job (an
agent's tools are operations). `gradeOf` mirrors harden's letter thresholds so a future unified contract grade
can combine the two on the LETTER (the raw scores differ — harden scores a clean/nodes ratio, this scores `100 − Σ penalty`).

### Pyramid — the determinism gradient as layers ([C035](../../../../doc/architecture/decisions/C035-cloudflare-terminology-alignment.md))

The shipped route(no-model)/skill(model) discriminator, made vertical. **Level 0** is the deterministic floor —
`routes` projecting to MCP tools (the "calculators"). **Level k** is an agent composing skills + lower-level routes
and sub-agents. Higher ⇒ less deterministic, more general, more convenient. An agent's level is a pure static
derivation (never read by the D1 matcher).

```ts
import { agentLevel, layerReport } from "@suluk/agents";

agentLevel(doc, "calculator");  // 1 — a leaf agent (routes only), one step above the floor
agentLevel(doc, "assistant");   // 2 — composes the calculator sub-agent
agentLevel(doc, "not-an-agent");// 0 (FLOOR_LEVEL) — routes/leaf capabilities live on the floor

const rep = layerReport(doc, { catalog: SEED_CATALOG });  // same options bag as gradeAgent
rep.layers;    // per agent, sorted by level: { level, routeCount, skillCount, subAgentCount, grade, contextTokens, overBudget, contextWaste }
rep.byLevel;   // level → agent names (cyclic agents grouped under -1)
rep.maxLevel;  // tallest finite layer
rep.floor;     // the distinct route operationRefs forming the deterministic base
```

`layerReport` is a **composition** of the shipped analyzers — it folds the three per-layer static-observability
signals into one surface: **hardening** (`gradeAgent` A–F), **token-budget** (declared `contextBudget` vs the
`contextReport` estimate → `overBudget`), and **context-waste** (resident tools the analyzer says to push to
cold-tail → `contextWaste`). No new mechanism, no enforcement.

### Agentic-pattern affordances (C035)

Which canonical agentic patterns (prompt-chaining · routing · parallelization · orchestrator-workers ·
evaluator-optimizer) an agent's **composition shape affords** — advisory only. The runtime trajectory (which pattern
actually runs) stays opaque by design (C029), so this reports *capability*, never an execution claim.

```ts
import { agenticPatterns, affordedPatterns } from "@suluk/agents";

affordedPatterns(doc, "refiner");      // ["evaluator-optimizer"]  — a thinking envelope of ≥2 rounds
affordedPatterns(doc, "chain");        // ["prompt-chaining"]       — exactly one sub-agent (a linear pipe)
affordedPatterns(doc, "coordinator");  // ["orchestrator-workers","parallelization","routing"] — ≥2 sub-agents + a skill
agenticPatterns(doc, "coordinator");   // each with a rationale + advisory:true
```

### Charge per call — `x-suluk-cost` → x402 `paidTool` (C035)

A route's declared `x-suluk-cost` projects to an x402 `paidTool` price. The Cloudflare/Node scaffolds surface the
price + the wiring path (DECLARED, never enforced — an AI-SDK `tool()` isn't itself a `paidTool`).

```ts
import { paidToolPrice } from "@suluk/agents";

paidToolPrice({ components: [{ basis: "per-call", microUsd: 10_000 }] });  // { priceUsd: 0.01, microUsd: 10000, metered: false }
paidToolPrice({ components: [{ basis: "per-token", microUsd: 3 }] });      // { priceUsd: 0, microUsd: 0, metered: true } → use MPP session
```

The projected scaffold then carries `// x-suluk-cost → x402: … server.paidTool("square", desc, 0.01, …)`. Flat
(`per-call`/`per-request`) cost → a fixed price; usage-metered components are flagged `metered` (MPP `session`
territory), never folded into the fixed number.

### Loadable resources — `x-suluk-resources` (C036, Cloudflare "Agent Skills")

The `x-suluk-resources` catalog is the on-demand, loadable content (instructions / references / scripts) an agent
activates when a task matches — Suluk's contract-first form of CF Agent Skills. **Content-only, no model** — that
walls it off from a `skill` (model-bearing, always-on). Experimental-anchored, structural-only, never enforced.

```ts
import { resourceCatalog, lintResources } from "@suluk/agents";

resourceCatalog(doc, "assistant");  // the CF get() listing: [{ key, kind, description, provenance, trust }, …]
lintResources(doc);                 // well-formedness + dangling refs + kind:"script" flagged (CF script exec is experimental)
```

### Diagram (OBSERVE)

```ts
import { agentDiagram, agentDiagramHtml } from "@suluk/agents";

agentDiagram(doc, "conin");        // a zoomable tree: Skills / Resident routes / Cold-tail routes / Sub-agents
agentDiagramHtml(doc, "conin");    // a self-contained D3 page (data inlined + HTML-escaped) — open in a browser
```

## API

| Export | What it does |
|---|---|
| `lintAgents` / `lintOk` / `assertAgentInstallable` | the C027 install gate (acyclicity, depth, dangling refs, the D1 selector red-line) |
| `projectClaudePlugin` | one agent → `plugin.json` + `.mcp.json` + generated `SKILL.md` (pure, fail-loud) |
| `projectOpenRouter` | one agent → an OpenRouter/OpenAI function-tool manifest (resident vs `discover_tools` cold-tail) |
| `projectCloudflareAgent` | one agent → an OWNED Cloudflare Agents-SDK scaffold (AIChatAgent class + `routeAgentRequest` worker + contract-derived tools + `needsApproval` from `x-suluk-approval`) **+ the `durableObjects` descriptor for `@suluk/deploy`** (pure, L3, fail-loud) |
| `projectNodeAgent` | one agent → an OWNED Bun-served agent (`Bun.serve` loop, contract-derived tools, NO Durable Objects) — the second runtime target; v1 scaffolds the named agent only |
| `runtimeProviders` / `cloudflareRuntime` / `nodeRuntime` / `AgentRuntimeProvider` | C034 runtime-adapter **seam** — `cloudflare` + `node` are the shipped adapters; the interface (+ the typed `RuntimeDeployHint`) is the swap point so a future runtime is a new adapter, not a rewrite (mirrors `@suluk/deploy`'s `providers`) |
| `routeToolDef` / `RouteToolDef` | the runtime-agnostic contract→tool derivation both adapters share (name + description + input schema + approval gate) |
| `agentManifest` / `verifyAgentFreshness` | a canonical signable manifest + preprompt-drift detection over the signed `contentHash` |
| `reachableSurface` / `residentSurface` / `residentToolNames` | the static, zero-request tool/sub-agent surface; the resident (default-served) partition |
| `assertServedSubset` / `assertDefaultServedResident` / `assertServedSubsetGoverned` / `conformanceOk` | over-serve / cold-tail-in-default / policy-denied auditors |
| `verifySkillFreshness` / `contentHash` / `renderSkillMd` | skill drift detection + the `SKILL.md` content-hash primitives |
| `effectiveUnderPolicies` / `policyConstrain` / `lintPolicy` / `policyOk` | C028 operator-governance overlay (monotone-narrowing MEET) |
| `contextReport` / `suggestUnflatten` | C027 context-budget analyzer (model-fit, over-budget, flatten/unflatten suggestions) |
| `gradeAgent` / `gradeAgents` / `assertAgentGrade` / `agentGradeOk` / `gradeOf` | C027 Stage-1.3 agent-COMPOSITION grade — aggregate lint + context + (served-fact) conformance/freshness into one A–F score + a CI gate (mirrors `@suluk/harden`'s `assertGrade`; F reserved for ship-blocking errors) |
| `agentLevel` / `layerReport` / `FLOOR_LEVEL` | C035 agent **pyramid** — `agentLevel` is the pure static composition-height (routes=0, leaf agent=1); `layerReport` folds level + grade + token-budget + context-waste into one per-layer observability surface (a composition of shipped analyzers, never read by D1) |
| `agenticPatterns` / `affordedPatterns` | C035 — the canonical agentic patterns an agent's composition SHAPE affords (advisory; the runtime trajectory stays opaque per C029) |
| `paidToolPrice` | C035 — derive an x402 `paidTool` price (USD) from a route's declared `x-suluk-cost`; flat → fixed price, metered → flagged for MPP `session` (declared, not enforced) |
| `resourceCatalog` / `lintResources` / `resourcesOk` | C036 `x-suluk-resources` — the loadable on-demand catalog (CF "Agent Skills", content-only); `resourceCatalog` is the CF `get()` listing, `lintResources` gates well-formedness + dangling refs + the experimental-script flag |
| `skillModels` / `resolveSkillModels` / `deriveCQT` / `selectModel` / `SEED_CATALOG` / `PROFILES` | C027 × `@suluk/models` model-selection seam (pin / router / latest, governance-gated) |
| `intersectScope` / `analyzeScopes` / `localEscalations` | scope intersection along the reaching path + escalation detection |
| `resolveOperationRef` / `agentMap` / `reachableSurface` / `findCycle` … | the `resolve` primitives the rest is built on |
| `agentDiagram` / `agentDiagramHtml` | the OBSERVE composition tree + a self-contained D3 page |

All exports live at the single entry point (`@suluk/agents`) — there are no sub-path exports and no CLI.

## Boundary

`@suluk/agents` is L3: **render/generate, never host.** Both projections are pure functions of the
contract plus *injected* instruction snapshots — the package never opens a socket, fetches a preprompt,
or touches a credential. The `.mcp.json` it emits declares HTTP MCP with host-side OAuth (`oauth: {}`)
and never embeds a token, bearer, or secret (C020/C023 upheld).

The seams stay app-side:

- **Inject the bytes.** Pinned instruction text comes in via `instructions: { skillName: text }`; a
  skill without a snapshot simply emits no `SKILL.md`. The package never invents preprompt text.
- **Signing is delegated.** `agentManifest` produces the canonical object; the actual ECDSA-P256
  signature is `@suluk/builder`'s `signRegistry` / `verifyRegistrySignature` — one mechanism, reused.
- **Serving is delegated.** `residentToolNames` tells `@suluk/mcp`'s `mcpApp({ resident })` which tools
  to advertise by default; this package decides *what* the surface is, the MCP server *serves* it.
- **The one-way wall.** `@suluk/core` must never import `@suluk/agents`; agent fields are read here and
  nowhere in the matcher. Determinism and tiering are **declared, never enforced** at runtime.

## License

Apache-2.0
