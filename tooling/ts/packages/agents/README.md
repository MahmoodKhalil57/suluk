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
| `agentManifest` / `verifyAgentFreshness` | a canonical signable manifest + preprompt-drift detection over the signed `contentHash` |
| `reachableSurface` / `residentSurface` / `residentToolNames` | the static, zero-request tool/sub-agent surface; the resident (default-served) partition |
| `assertServedSubset` / `assertDefaultServedResident` / `assertServedSubsetGoverned` / `conformanceOk` | over-serve / cold-tail-in-default / policy-denied auditors |
| `verifySkillFreshness` / `contentHash` / `renderSkillMd` | skill drift detection + the `SKILL.md` content-hash primitives |
| `effectiveUnderPolicies` / `policyConstrain` / `lintPolicy` / `policyOk` | C028 operator-governance overlay (monotone-narrowing MEET) |
| `contextReport` / `suggestUnflatten` | C027 context-budget analyzer (model-fit, over-budget, flatten/unflatten suggestions) |
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
